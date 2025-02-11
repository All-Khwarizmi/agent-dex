"use client";

import { useQuery } from "@tanstack/react-query";
import { TokenMetadata } from "~~/types/tokens";
import { fetchTokenMetadata, getSymbolsFromAddresses } from "~~/utils/tokens";

export function useTokenMetadata(tokenAddresses: string[]) {
  return useQuery<TokenMetadata[]>({
    queryKey: ["tokenMetadata", tokenAddresses],
    queryFn: () => fetchTokenMetadata(getSymbolsFromAddresses(tokenAddresses)),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    enabled: tokenAddresses.length > 0,
  });
}
