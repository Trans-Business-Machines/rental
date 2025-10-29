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
