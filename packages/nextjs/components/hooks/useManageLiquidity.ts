import { useEffect, useState } from "react";
import { Abi, erc20Abi } from "viem";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { FACTORY_CONTRACT_NAME, PAIR_CONTRACT_NAME } from "~~/utils/constants";

function useManageLiquidity() {
  const [addresses, setAddresses] = useState<[string, string]>(["", ""]);
  const { address: account } = useAccount();

  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo({
    contractName: FACTORY_CONTRACT_NAME,
  });
  const { data: deployedPairContractData, isLoading: deployedPairContractLoading } = useDeployedContractInfo({
    contractName: PAIR_CONTRACT_NAME,
  });

  const { data: pairAddr, isLoading: isLoadingPairCount } = useReadContract({
    abi: [
      {
        type: "function",
        name: "getPair",
        inputs: [
          {
            name: "",
            type: "address",
            internalType: "address",
          },
          {
            name: "",
            type: "address",
            internalType: "address",
          },
        ],
        outputs: [
          {
            name: "",
            type: "address",
            internalType: "address",
          },
        ],
        stateMutability: "view",
      },
    ],
    address: deployedContractData?.address,
    functionName: "getPair",
    args: [addresses[0], addresses[1]],
    query: {
      enabled: addresses.every(address => address !== "") && deployedContractData !== undefined,
    },
  });

  const {
    data: poolBalance,
    refetch: refetchPoolBalance,
    isLoading: isLoadingPoolBalance,
  } = useReadContract({
    address: pairAddr,
    functionName: "total",
    abi: deployedPairContractData?.abi,
    query: {
      enabled: pairAddr !== undefined,
    },
  });

  const {
    data: userLiquidity,
    refetch: refetchUserLiquidity,
    isLoading: isLoadingUserLiquidity,
  } = useReadContract({
    abi: deployedPairContractData?.abi,
    address: pairAddr,
    functionName: "balanceOf",
    args: [account || ""],
    query: {
      enabled: pairAddr !== undefined,
    },
  });

  console.log({ poolBalance, userLiquidity, pairAddr });

  useEffect(() => {
    if (pairAddr) {
      refetchPoolBalance().then().catch(console.error);
      refetchUserLiquidity().then().catch(console.error);
    }
  }, [poolBalance, userLiquidity, pairAddr, refetchPoolBalance, refetchUserLiquidity]);

  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [liquidityToRemove, setLiquidityToRemove] = useState("");

  const {
    writeContract,
    writeContractAsync,
    isPending: isLoadingContract,
    error: writeContractError,
  } = useWriteContract();

  const handleAddLiquidity = async () => {
    if (!pairAddr) return;
    if (!amountA || !amountB) return;

    const result = await setupAddLiquidity(BigInt(amountA), BigInt(amountB));
    if (!result) return;

    writeContract({
      address: pairAddr,
      functionName: "addLiquidity",
      args: [BigInt(amountA), BigInt(amountB)],
      abi: deployedPairContractData?.abi as Abi,
    });
  };

  const handleRemoveLiquidity = async () => {
    writeContract({
      address: pairAddr || "",

      abi: deployedPairContractData?.abi as Abi,
      functionName: "removeLiquidity",
      args: [BigInt(liquidityToRemove)],
    });
  };

  async function setupAddLiquidity(amount0: bigint, amount1: bigint) {
    try {
      // Get token addresses from pair contract
      if (!pairAddr) return;
      // Create token contracts
      console.log("Approving token0...");

      const token0 = await writeContractAsync({
        address: addresses[0],
        abi: erc20Abi,
        functionName: "approve",
        args: [pairAddr, amount0],
      });
      console.log({ token0 });
      console.log("Approving token1...");

      const token1 = await writeContractAsync({
        address: addresses[1],
        abi: erc20Abi,
        functionName: "approve",
        args: [pairAddr, amount1],
      });
      console.log({ token1 });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  return {
    data: {
      amountA,
      amountB,
      pairAddr,
      poolBalance,
      liquidityToRemove,
      writeContractError,
      userLiquidity,
      isLoadingContract,
      isLoading:
        isLoadingPairCount &&
        isLoadingPoolBalance &&
        isLoadingUserLiquidity &&
        deployedContractLoading &&
        deployedPairContractLoading,
    },
    functions: {
      setAmountA,
      setAmountB,
      setupAddLiquidity,
      handleAddLiquidity,
      setLiquidityToRemove,
      handleRemoveLiquidity,
      setTokenAddresses: setAddresses,
    },
  };
}

export default useManageLiquidity;
