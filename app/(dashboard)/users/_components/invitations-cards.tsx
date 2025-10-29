import { Card, CardHeader, CardTitle } from "@/components/ui/card";
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

function InvitationsCards({
  invitations,
  handleResendInvite,
}: InvitationCardAndTableProps) {
  return (
    <div className="h-48 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {invitations
        .filter((i) => !i.acceptedAt)
        .map((invite) => (
          <Card
            key={invite.email}
            className="hover:shadow-lg transition-shadow border-dashed border-2 border-blue-400"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{invite.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {invite.email}
                  </p>
                  <p className="text-xs text-blue-600">Invitation Pending</p>
                  <div className=" mt-2">
                    <Badge className={getRoleBadgeColor(invite.role)}>
                      {invite.role}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleResendInvite(invite.email)}
                >
                  Resend Invite
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
    </div>
  );
}

export { InvitationsCards };
