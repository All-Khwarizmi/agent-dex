"use client";

import { useQuery } from "@tanstack/react-query";
import { BASE_BACKEND_URL } from "~~/utils/constants";

interface DetailedUser {
  id: number;
  address: string;
  name: string | null;
  email: string | null;
  swaps: number;
  status: "active" | "inactive" | "pending";
  created_at: Date;
  totalValueLocked: number;
  lastActivity: Date;
}

interface DetailedLiquidityProvider {
  id: number;
  address: string;
  totalShares: number;
  poolLiquidity: Record<string, number>;
  created_at: Date;
  totalValueProvided: number;
  activePools: number;
  lastActivityDate: Date;
}

export function useDetailedData() {
  const { data: users, isLoading: isLoadingUsers } = useQuery<DetailedUser[]>({
    queryKey: ["detailedUsers"],
    queryFn: () => fetch(`${BASE_BACKEND_URL}/users`).then(res => res.json()),
  });

  const { data: liquidityProviders, isLoading: isLoadingLPs } = useQuery<DetailedLiquidityProvider[]>({
    queryKey: ["detailedLiquidityProviders"],
    queryFn: () => fetch(`${BASE_BACKEND_URL}/liquidity-provider`).then(res => res.json()),
  });

  return {
    users,
    liquidityProviders,
    isLoading: isLoadingUsers || isLoadingLPs,
  };
}
