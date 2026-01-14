import { useState } from "react";
import { UserCards } from "./user-cards";
import { UsersTable } from "./users-table";
import { Switch } from "@/components/ui/switch";
import { useTableMode } from "@/hooks/useTableMode";
import { useDeleteUser } from "@/hooks/useUsers";
import { AlertDialog } from "@/components/AlertDialog";
import type { Role, User } from "@/lib/types/types";

interface UserListingsProps {
  users: User[];
  unbanUserMutationPending: boolean;
  handleUnBanUserClick: (userId: string) => void;
  setSelectedUser: (user: User) => void;
  setBanDialogOpen: (open: boolean) => void;
}

function UserListings({
  users,
  unbanUserMutationPending,
  setBanDialogOpen,
  setSelectedUser,
  handleUnBanUserClick,
}: UserListingsProps) {
  const { tableMode, setTableMode } = useTableMode();
  const deleteMutation = useDeleteUser();

  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [userData, setUserData] = useState<{
    userId: string;
    role: Role;
  } | null>(null);

  const handleClick = (userInfo: { userId: string; role: Role }) => {
    setUserData(userInfo);
    setIsAlertDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (userData !== null) {
      await deleteMutation.mutateAsync(userData);
      setUserData(null);
      setIsAlertDialogOpen(false);
    }
  };

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
          handleClick={handleClick}
          handleUnBanUserClick={handleUnBanUserClick}
          setBanDialogOpen={setBanDialogOpen}
          setSelectedUser={setSelectedUser}
          unbanUserMutationPending={unbanUserMutationPending}
        />
      ) : (
        <UserCards
          users={users}
          handleClick={handleClick}
          handleUnBanUserClick={handleUnBanUserClick}
          setBanDialogOpen={setBanDialogOpen}
          setSelectedUser={setSelectedUser}
          unbanUserMutationPending={unbanUserMutationPending}
        />
      )}

      <AlertDialog
        open={isAlertDialogOpen}
        onOpenChange={setIsAlertDialogOpen}
        action="delete"
        actionFn={handleConfirm}
        isLoading={deleteMutation.isPending}
        item="user"
        statement="This action can't be undone and will permanently remove this user from the application."
      />
    </section>
  );
}

export default UserListings;
