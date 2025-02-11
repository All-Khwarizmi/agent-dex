import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/Table";

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
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Pool</TableHead>
          <TableHead>Token 0 Reserve</TableHead>
          <TableHead>Token 1 Reserve</TableHead>
          <TableHead>Swaps</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pools.map(pool => (
          <TableRow key={pool.id}>
            <TableCell className="font-medium">
              {pool.token0}/{pool.token1}
            </TableCell>
            <TableCell>{pool.reserve0.toLocaleString()}</TableCell>
            <TableCell>{pool.reserve1.toLocaleString()}</TableCell>
            <TableCell>{pool.swaps.toLocaleString()}</TableCell>
            <TableCell>{new Date(pool.created_at).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
