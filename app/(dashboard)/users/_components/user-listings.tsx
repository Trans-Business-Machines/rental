"use client";

import { Users } from "lucide-react";
import { UserCards } from "./user-cards";
import { UsersTable } from "./users-table";
import { Switch } from "@/components/ui/switch";
import { useTableMode } from "@/hooks/useTableMode";
import type { UsersTableAndCardsProps } from "@/lib/types/types";

function UserListings({
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
  const { tableMode, setTableMode } = useTableMode();

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium">No users found</h3>
        <p className="text-muted-foreground">
          Get started by inviting your first user
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 mb-2 text-muted-foreground/90 text-sm">
        <Switch
          checked={tableMode}
          onCheckedChange={setTableMode}
          className="cursor-pointer"
        />
        <span>Table mode</span>
      </div>

      {tableMode ? (
        <UsersTable
          users={users}
          handleDeleteUser={handleDeleteUser}
          handleRevokeAllSessions={handleRevokeAllSessions}
          handleSetRole={handleSetRole}
          handleUnbanUser={handleUnbanUser}
          setBanDialogOpen={setBanDialogOpen}
          setSelectedUser={setSelectedUser}
          deleteUserMutationPending={deleteUserMutationPending}
          revokeSessionsMutationPending={revokeSessionsMutationPending}
          unbanUserMutationPending={unbanUserMutationPending}
          userRoleMutationPending={userRoleMutationPending}
        />
      ) : (
        <UserCards
          users={users}
          handleDeleteUser={handleDeleteUser}
          handleRevokeAllSessions={handleRevokeAllSessions}
          handleSetRole={handleSetRole}
          handleUnbanUser={handleUnbanUser}
          setBanDialogOpen={setBanDialogOpen}
          setSelectedUser={setSelectedUser}
          deleteUserMutationPending={deleteUserMutationPending}
          revokeSessionsMutationPending={revokeSessionsMutationPending}
          unbanUserMutationPending={unbanUserMutationPending}
          userRoleMutationPending={userRoleMutationPending}
        />
      )}
    </section>
  );
}

export default UserListings;
