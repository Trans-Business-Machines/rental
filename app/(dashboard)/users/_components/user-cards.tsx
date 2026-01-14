import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Trash2,
  Shield,
  ShieldUser,
  ShieldBan,
  LogOut,
  Check as Unban,
  Mail,
  Calendar,
  Ban,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useSetUserRole, useRevokeUserSessions } from "@/hooks/useUsers";
import { usePermissions } from "@/hooks/usePermissions";
import { AlertDialog } from "./alert-dialog";
import type { UsersTableAndCardsProps, Role } from "@/lib/types/types";

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "admin":
      return "bg-amber-100 text-amber-800";
    case "user":
      return "bg-blue-100 text-blue-800";
    case "superAdmin":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatDate = (dateString: string) => {
  return format(new Date(dateString), "dd/MM/yyyy");
};

type DialogAction = "promote" | "demote" | "revoke";

interface DialogState {
  open: boolean;
  userId: string | null;
  action: DialogAction | null;
  role: Role | null;
}

function UserCards({
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
    role: Role | null = null
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
        if (role === "user") {
          return "This user will lose all administrative privileges and will only be able to view properties and units.";
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <article className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="text-lg">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg capitalize">
                      {user.name}
                    </CardTitle>
                    <div className="space-x-2">
                      {user.banned && (
                        <Badge variant="destructive" className="text-xs">
                          Banned
                        </Badge>
                      )}
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role === "superAdmin"
                          ? user.role.replace("A", " A")
                          : user.role}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="border-none cursor-pointer opacity-90 rotate-90"
                      >
                        <MoreHorizontal className="h-4 w-4" />
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

                            {user.role !== "user" && !user.banned && (
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() =>
                                  openDialog(user.id, "demote", "user")
                                }
                                disabled={roleUpdateMutation.isPending}
                              >
                                <ShieldBan className="size-4 mr-2" />
                                <span>Demote to user</span>
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
                </div>
              </article>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Information */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{user.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Joined {formatDate(user.createdAt)}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {user.emailVerified
                      ? "Email Verified"
                      : "Email Not Verified"}
                  </span>
                </div>
              </div>

              {/* Ban Information */}
              {user.banned && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Banned
                  </p>
                  {user.banReason && (
                    <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                      Reason: {user.banReason}
                    </p>
                  )}
                  {user.banExpires && (
                    <p className="text-xs text-red-600 dark:text-red-300">
                      Expires: {formatDate(user.banExpires)}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
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

export { UserCards };
