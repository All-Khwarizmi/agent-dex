"use client";

import { useEffect, useState } from "react";
import { Abi, erc20Abi, zeroAddress } from "viem";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { FACTORY_CONTRACT_NAME, PAIR_CONTRACT_NAME, TOKENS } from "~~/utils/constants";

function getTokenAddr(tokenSymbol: string) {
  return TOKENS.find(token => token.symbol === tokenSymbol)?.address || "";
}
function useSwap() {
  const [tokenA, setTokenA] = useState<(typeof TOKENS)[number]["symbol"]>(TOKENS[0].symbol);
  const [tokenB, setTokenB] = useState<(typeof TOKENS)[number]["symbol"]>(TOKENS[1].symbol);
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const { address: account } = useAccount();

  const { data: deployedFactoryData } = useDeployedContractInfo({
    contractName: FACTORY_CONTRACT_NAME,
  });

  const { data: deployedPairData } = useDeployedContractInfo({
    contractName: PAIR_CONTRACT_NAME,
  });

  const { data: pairAddr, isLoading: isLoadingPair } = useReadContract({
    abi: deployedFactoryData?.abi,
    address: deployedFactoryData?.address,
    functionName: "getPair",
    args: [getTokenAddr(tokenA), getTokenAddr(tokenB)],
    query: {
      enabled: !!deployedFactoryData,
    },
  });

  const { data: reserveData, isLoading: isLoadingReserves } = useReadContract({
    abi: deployedPairData?.abi,
    address: (pairAddr as string) || "",
    functionName: "getReserves",
    query: {
      enabled: !!pairAddr && pairAddr !== zeroAddress,
    },
  });

  const { writeContractAsync, isPending: isSwapping, error: swapError } = useWriteContract();

  useEffect(() => {
    if (amountA && reserveData) {
      const [reserve0, reserve1] = reserveData as [bigint, bigint];
      const amountOut = calculateAmountOut(BigInt(amountA), reserve0, reserve1);
      setAmountB(amountOut.toString());
    }
  }, [amountA, reserveData]);

  const calculateAmountOut = (amountIn: bigint, reserveIn: bigint, reserveOut: bigint) => {
    const amountInWithFee = amountIn * BigInt(997);
    const numerator = amountInWithFee * reserveOut;
    const denominator = reserveIn * BigInt(1000) + amountInWithFee;
    return numerator / denominator;
  };

  const handleSwap = async () => {
    if (!pairAddr || !account) return;

    try {
      await writeContractAsync({
        address: getTokenAddr(tokenA),
        abi: erc20Abi,
        functionName: "approve",
        args: [pairAddr as string, BigInt(amountA)],
      });

      // Perform swap
      await writeContractAsync({
        address: pairAddr as string,
        abi: deployedPairData?.abi as Abi,
        functionName: "swap",
        args: [getTokenAddr(tokenB), getTokenAddr(tokenA), BigInt(amountA)],
      });

    
      setAmountA("");
      setAmountB("");
    } catch (error) {
      console.error("Swap failed:", error);
    }
  };

  return {
    tokenA,
    tokenB,
    setTokenA,
    setTokenB,
    amountA,
    amountB,
    setAmountA,
    setAmountB,
    isSwapping,
    swapError,
    handleSwap,
    isLoading: isLoadingPair || isLoadingReserves,
  };
}

export default useSwap;
