import { Badge } from "./ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/Table";

interface User {
  id: number;
  address: string;
  name: string | null;
  email: string | null;
  swaps: number;
  status: "active" | "inactive" | "pending";
  created_at: Date;
}

interface UsersTableProps {
  users: User[];
}

export function UsersTable({ users }: UsersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Address</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Swaps</TableHead>
          <TableHead>Joined</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map(user => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.address}</TableCell>
            <TableCell>{user.name || "Anonymous"}</TableCell>
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
