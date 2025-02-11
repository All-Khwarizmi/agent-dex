"use client";

import { useQuery } from "@tanstack/react-query";
import { BASE_BACKEND_URL } from "~~/utils/constants";

interface Pool {
  id: number;
  address: string;
  token0: string;
  token1: string;
  reserve0: number;
  reserve1: number;
  swaps: number;
  created_at: Date;
}

interface User {
  id: number;
  address: string;
  name: string | null;
  email: string | null;
  swaps: number;
  status: "active" | "inactive" | "pending";
  created_at: Date;
  liquidityProvider: LiquidityProvider | null;
}

interface LiquidityProvider {
  id: number;
  address: string;
  totalShares: number;
  poolLiquidity: Record<string, number>;
  created_at: Date;
}

export function usePoolsData() {
  const { data: pools, isLoading: isLoadingPools } = useQuery<Pool[]>({
    queryKey: ["pools"],
    queryFn: () => fetch(`${BASE_BACKEND_URL}/pools`).then(res => res.json()),
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => fetch(`${BASE_BACKEND_URL}/users`).then(res => res.json()),
  });

  const { data: liquidityProviders, isLoading: isLoadingLPs } = useQuery<LiquidityProvider[]>({
    queryKey: ["liquidityProviders"],
    queryFn: () => fetch(`${BASE_BACKEND_URL}/liquidity-providers`).then(res => res.json()),
  });

  return {
    pools,
    users,
    liquidityProviders,
    isLoading: isLoadingPools || isLoadingUsers || isLoadingLPs,
  };
}
