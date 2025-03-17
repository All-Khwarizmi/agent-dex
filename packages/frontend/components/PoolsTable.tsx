import Image from "next/image";
import { useTokenMetadata } from "./hooks/useTokenMetadata";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/Table";
import { FormattedPool } from "~~/types/tokens";
import { formatPoolPair } from "~~/utils/tokens";

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

interface PoolsTableProps {
  pools: Pool[];
}

export function PoolsTable({ pools }: PoolsTableProps) {
  // Get unique token addresses from all pools
  const tokenAddresses = Array.from(new Set(pools.flatMap(pool => [pool.token0, pool.token1])));

  const { data: tokenMetadata, isLoading: isLoadingMetadata } = useTokenMetadata(tokenAddresses);

  // Format pools with metadata
  const formattedPools: FormattedPool[] = pools.map(pool => formatPoolPair(pool, tokenMetadata));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Pool</TableHead>
          <TableHead>Token 0 Reserve</TableHead>
          <TableHead>Token 1 Reserve</TableHead>
          <TableHead>Swaps</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {formattedPools.map(pool => (
          <TableRow key={pool.address}>
            <TableCell className="font-medium">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  {pool.token0Logo && (
                    <Image
                      src={pool.token0Logo || "/placeholder.svg"}
                      alt={pool.token0Symbol}
                      width={24}
                      height={24}
                      className="rounded-full border border-background"
                    />
                  )}
                  {pool.token1Logo && (
                    <Image
                      src={pool.token1Logo || "/placeholder.svg"}
                      alt={pool.token1Symbol}
                      width={24}
                      height={24}
                      className="rounded-full border border-background"
                    />
                  )}
                </div>
                <span>
                  {pool.token0Symbol}/{pool.token1Symbol}
                </span>
              </div>
            </TableCell>
            <TableCell>{pool.reserve0.toLocaleString()}</TableCell>
            <TableCell>{pool.reserve1.toLocaleString()}</TableCell>
            <TableCell>{pool.swaps.toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
