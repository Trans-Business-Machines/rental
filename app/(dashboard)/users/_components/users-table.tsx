"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Trash2,
  Shield,
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
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
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

function UsersTable({
  users,
  deleteUserMutationPending,
  revokeSessionsMutationPending,
  unbanUserMutationPending,
  userRoleMutationPending,
  handleDeleteUser,
  handleRevokeAllSessions,
  handleSetRole,
  handleUnbanUser,
  setBanDialogOpen,
  setSelectedUser,
}: UsersTableAndCardsProps) {
  return (
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
                <div className="flex flex-col-reverse gap-2  capitalize items-start">
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role}
                  </Badge>
                  {user.banned && (
                    <Badge className="text-xs bg-chart-5">
                      Banned
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {format(new Date(user.createdAt), "dd/MM/yyyy")}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export { UsersTable };
