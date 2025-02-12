import { Address } from "./scaffold-eth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/Table";

interface LiquidityProvider {
  id: number;
  address: string;
  totalShares: number;
  poolLiquidity: Record<string, number>;
  created_at: Date;
}

interface ProvidersTableProps {
  providers: LiquidityProvider[];
}

export function ProvidersTable({ providers }: ProvidersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Address</TableHead>
          <TableHead>Total Shares</TableHead>
          <TableHead>Pools</TableHead>
          <TableHead>Joined</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {providers.map(provider => (
          <TableRow key={provider.id}>
            <TableCell className="font-medium">
              <Address address={provider.address} />
            </TableCell>
            <TableCell>{provider.totalShares.toLocaleString()}</TableCell>
            <TableCell>{Object.keys(provider.poolLiquidity).length}</TableCell>
            <TableCell>{new Date(provider.created_at).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
