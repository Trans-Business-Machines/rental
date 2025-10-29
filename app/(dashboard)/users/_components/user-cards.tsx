import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Trash2,
  Shield,
  LogOut,
  Check as Unban,
  Mail,
  Calendar,
  Ban,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { UsersTableAndCardsProps } from "@/lib/types/types";

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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

function UserCards({
  users,
  deleteUserMutationPending,
  revokeSessionsMutationPending,
  unbanUserMutationPending,
  userRoleMutationPending,
  handleDeleteUser,
  handleRevokeAllSessions,
  handleSetRole,
  setBanDialogOpen,
  setSelectedUser,
  handleUnbanUser,
}: UsersTableAndCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {users.map((user) => (
        <Card key={user.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
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
                  <CardTitle className="text-lg">{user.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {user.role === "admin" ? "Administrator" : "Regular User"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <Badge className={getRoleBadgeColor(user.role)}>
                  {user.role}
                </Badge>
                {user.banned && (
                  <Badge variant="destructive" className="text-xs">
                    Banned
                  </Badge>
                )}

                <div className="flex space-x-2 pt-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-none cursor-pointer opacity-90"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={() =>
                          handleSetRole(
                            user.id,
                            user.role === "admin" ? "user" : "admin"
                          )
                        }
                        disabled={userRoleMutationPending}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => handleRevokeAllSessions(user.id)}
                        disabled={revokeSessionsMutationPending}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Revoke All Sessions
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {user.banned ? (
                        <DropdownMenuItem
                          onClick={() => handleUnbanUser(user.id)}
                          disabled={unbanUserMutationPending}
                        >
                          <Unban className="h-4 w-4 mr-2" />
                          Unban User
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setBanDialogOpen(true);
                          }}
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Ban User
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={deleteUserMutationPending}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
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
                  {user.emailVerified ? "Email Verified" : "Email Not Verified"}
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

            {/* Action Buttons */}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export { UserCards };
