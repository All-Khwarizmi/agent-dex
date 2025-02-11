import { Address } from "~~/components/scaffold-eth";
import { Badge } from "~~/components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~~/components/ui/Table";

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

interface UsersDetailedTableProps {
  users: DetailedUser[];
}

export function UsersDetailedTable({ users }: UsersDetailedTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Address</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Swaps</TableHead>
          <TableHead>Joined</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map(user => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">
              <Address address={user.address} />
            </TableCell>
            <TableCell>{user.name || "Anonymous"}</TableCell>
            <TableCell>{user.email || "N/A"}</TableCell>
            <TableCell>
              <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
            </TableCell>
            <TableCell>{user.swaps.toLocaleString()}</TableCell>
            <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
