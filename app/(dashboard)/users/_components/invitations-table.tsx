import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { InvitationCardAndTableProps } from "@/lib/types/types";

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "admin":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    case "user":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
  }
};

function InvitationsTable({
  invitations,
  handleResendInvite,
}: InvitationCardAndTableProps) {
  return (
    <div className="rounded-lg border border-border overflow-hidden pb-12">
      <Table className="px-2">
        <TableHeader>
          <TableRow className="bg-muted capitalize text-left">
            <TableHead className="font-semibold text-foreground">
              Name
            </TableHead>
            <TableHead className="font-semibold text-foreground">
              Email
            </TableHead>
            <TableHead className="font-semibold text-foreground">
              Role
            </TableHead>
            <TableHead className="font-semibold text-foreground">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations
            .filter((i) => !i.acceptedAt)
            .map((i) => (
              <TableRow key={i.email}>
                <TableCell>{i.name ? i.name : "-"}</TableCell>
                <TableCell>{i.email}</TableCell>
                <TableCell>
                  <Badge className={getRoleBadgeColor(i.role)}>{i.role}</Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResendInvite(i.email)}
                  >
                    Resend Invite
                  </Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}

export { InvitationsTable };
