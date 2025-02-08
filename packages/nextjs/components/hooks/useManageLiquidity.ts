import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
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

  const { data: poolBalance, isLoading: isLoadingPoolBalance } = useReadContract({
    abi: deployedPairContractData?.abi,
    address: pairAddr,
    functionName: "poolBalance",
    query: {
      enabled: pairAddr !== undefined,
    },
  });

  const { data: userLiquidity, isLoading: isLoadingUserLiquidity } = useReadContract({
    abi: deployedPairContractData?.abi,
    address: pairAddr,
    functionName: "balanceOf",
    args: [account || ""],
    query: {
      enabled: pairAddr !== undefined,
    },
  });

  return {
    data: {
      pairAddr,
      poolBalance,
      userLiquidity,
      isLoading:
        isLoadingPairCount &&
        isLoadingPoolBalance &&
        isLoadingUserLiquidity &&
        deployedContractLoading &&
        deployedPairContractLoading,
    },
    functions: { setTokenAddresses: setAddresses },
  };
}

export default useManageLiquidity;
