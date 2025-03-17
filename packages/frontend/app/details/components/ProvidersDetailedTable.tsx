import { formatUnits } from "viem";
import { Address } from "~~/components/scaffold-eth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~~/components/ui/Table";

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

interface ProvidersDetailedTableProps {
  providers: DetailedLiquidityProvider[];
}

export function ProvidersDetailedTable({ providers }: ProvidersDetailedTableProps) {
  console.log(providers);
  return (
    <Table >
      <TableHeader>
        <TableRow>
          <TableHead>Address</TableHead>
          <TableHead>Total Shares</TableHead>
          <TableHead>Active Pools</TableHead>
          <TableHead>Joined</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {providers.map(provider => (
          <TableRow key={provider.id}>
            <TableCell className="font-medium">
              <Address address={provider.address} />
            </TableCell>
            <TableCell>{provider.totalShares}</TableCell>
            <TableCell>
              <pre>{JSON.stringify(provider.poolLiquidity)}</pre>
            </TableCell>
            <TableCell>{new Date(provider.created_at).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
