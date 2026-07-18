import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Trash2,
  Shield,
  ShieldUser,
  ShieldBan,
  LogOut,
  Check as Unban,
  Ban,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useSetUserRole, useRevokeUserSessions } from "@/hooks/useUsers";
import { usePermissions } from "@/hooks/usePermissions";
import { AlertDialog } from "./alert-dialog";
import type { Role, UsersTableAndCardsProps } from "@/lib/types/types";

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "admin":
      return "bg-amber-100 text-amber-800";
    case "user":
      return "bg-blue-100 text-blue-800";
    case "superAdmin":
      return "bg-red-100 text-red-800";
    case "agent":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

type DialogAction = "promote" | "demote" | "revoke";

interface DialogState {
  open: boolean;
  userId: string | null;
  action: DialogAction | null;
  role: Role | null;
}

function UsersTable({
  users,
  unbanUserMutationPending,
  handleClick,
  handleUnBanUserClick,
  setBanDialogOpen,
  setSelectedUser,
}: UsersTableAndCardsProps) {
  const { isSuperAdmin } = usePermissions();

  const roleUpdateMutation = useSetUserRole();
  const sessionRevokeMutation = useRevokeUserSessions();

  const [dialogState, setDialogState] = useState<DialogState>({
    open: false,
    userId: null,
    action: null,
    role: null,
  });

  /* ------------ Dialog Handlers ------------ */
  const openDialog = (
    userId: string,
    action: DialogAction,
    role: Role | null = null,
  ) => {
    setDialogState({
      open: true,
      userId,
      action,
      role,
    });
  };

  const closeDialog = () => {
    setDialogState({
      open: false,
      userId: null,
      action: null,
      role: null,
    });
  };

  const handleConfirmAction = async () => {
    const { userId, action, role } = dialogState;

    if (!userId || !action) return;

    try {
      if (action === "promote" || action === "demote") {
        if (!role) return;
        await roleUpdateMutation.mutateAsync({ userId, role });
      } else if (action === "revoke") {
        await sessionRevokeMutation.mutateAsync(userId);
      }
    } finally {
      closeDialog();
    }
  };

  /* ------------ Dialog Statement ------------ */
  const getDialogStatement = (): string => {
    const { action, role } = dialogState;

    switch (action) {
      case "promote":
        if (role === "superAdmin") {
          return "This user will have full system access including managing other admins and deleting properties. This is the highest privilege level.";
        }
        return "This user will have to create, read, and update permissions. They will also be able to manage regular users.";

      case "demote":
        if (role === "agent") {
          return "This user will only be able to view properties,units and make booking requests.";
        }
        return "This user will be demoted to admin role with limited privileges. They will no longer be able to manage other admins or delete properties.";

      case "revoke":
        return "All active sessions for this user will be terminated. They will be logged out from all devices and will need to sign in again.";

      default:
        return "";
    }
  };

  const isDialogLoading =
    roleUpdateMutation.isPending || sessionRevokeMutation.isPending;

  return (
    <>
      <div className="rounded-lg border border-border overflow-hidden pb-6">
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
                Email Verified
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Role
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Date Joined
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="font-medium">
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    className={`${user.emailVerified ? "bg-primary" : "bg-chart-5"}`}
                  >
                    {user.emailVerified ? "Verified" : "Not Verified"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-row gap-2 capitalize items-start">
                    {user.banned && (
                      <Badge className="text-xs bg-chart-5">Banned</Badge>
                    )}
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role === "superAdmin"
                        ? user.role.replace("A", " A")
                        : user.role}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(user.createdAt), "dd/MM/yyyy")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="border-none cursor-pointer opacity-90"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {isSuperAdmin && (
                        <>
                          <DropdownMenuGroup>
                            {user.role !== "superAdmin" && !user.banned && (
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() =>
                                  openDialog(user.id, "promote", "superAdmin")
                                }
                                disabled={roleUpdateMutation.isPending}
                              >
                                <ShieldUser className="size-4 mr-2" />
                                <span>Make super admin</span>
                              </DropdownMenuItem>
                            )}

                            {user.role === "user" && !user.banned && (
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() =>
                                  openDialog(user.id, "promote", "admin")
                                }
                                disabled={roleUpdateMutation.isPending}
                              >
                                <Shield className="size-4 mr-2" />
                                <span>Make admin</span>
                              </DropdownMenuItem>
                            )}

                            {user.role === "superAdmin" && !user.banned && (
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() =>
                                  openDialog(user.id, "demote", "admin")
                                }
                                disabled={roleUpdateMutation.isPending}
                              >
                                <Shield className="size-4 mr-2" />
                                <span>Demote to admin</span>
                              </DropdownMenuItem>
                            )}

                            {user.role !== "agent" && !user.banned && (
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() =>
                                  openDialog(user.id, "demote", "agent")
                                }
                                disabled={roleUpdateMutation.isPending}
                              >
                                <ShieldBan className="size-4 mr-2" />
                                <span>Demote to agent</span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuGroup>
                          {!user.banned && <DropdownMenuSeparator />}
                        </>
                      )}

                      {user.banned ? (
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => handleUnBanUserClick(user.id)}
                          disabled={unbanUserMutationPending}
                        >
                          <Unban className="size-4 mr-2" />
                          Unban User
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => {
                            setSelectedUser(user);
                            setBanDialogOpen(true);
                          }}
                        >
                          <Ban className="size-4 mr-2" />
                          Ban User
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => openDialog(user.id, "revoke")}
                        disabled={sessionRevokeMutation.isPending}
                      >
                        <LogOut className="size-4 mr-2" />
                        Revoke All Sessions
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        className="hover:bg-red-500/20  focus:bg-red-500/20 cursor-pointer group"
                        onClick={() =>
                          handleClick({
                            userId: user.id,
                            role: user.role as Role,
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                        <span className="group-hover:text-red-500 text-red-500">
                          Delete user
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={dialogState.open}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        action={dialogState.action ?? "promote"}
        statement={getDialogStatement()}
        actionFn={handleConfirmAction}
        isLoading={isDialogLoading}
      />
    </>
  );
}

export { UsersTable };
