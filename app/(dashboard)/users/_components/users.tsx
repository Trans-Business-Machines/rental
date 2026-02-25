"use client";

import { useState } from "react";
import { User as UserIcon } from "lucide-react";
import { ItemsNotFound } from "@/components/ItemsNotFound";
import { SearchNotFound } from "@/components/SearchNotFound";
import { Footer } from "@/components/Footer";
import { useUnbanUser } from "@/hooks/useUsers";
import { BanDialog } from "./ban-dialog";
import { AlertDialog } from "./alert-dialog";
import UserListings from "./user-listings";
import type { User } from "@/lib/types/types";

interface UsersProps {
  users: User[];
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  currentPage: number;
  hasActiveFilters: boolean;
}

function Users({
  users,
  currentPage,
  hasNext,
  hasPrev,
  totalPages,
  hasActiveFilters,
}: UsersProps) {
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [userToUnban, setUserToUnban] = useState<string | null>(null);

  const unbanUserMutation = useUnbanUser();

  const handleUnBanUserClick = (id: string) => {
    setUserToUnban(id);
    setAlertDialogOpen(true);
  };

  const handleConfirmUnbanUser = () => {
    if (userToUnban) {
      unbanUserMutation.mutate(userToUnban, {
        onSuccess: () => {
          setUserToUnban(null);
          setAlertDialogOpen(false);
        },
      });
    }
  };

  if (users.length === 0 && !hasActiveFilters) {
    return (
      <ItemsNotFound
        title="No users found!"
        icon={UserIcon}
        message="Get started by inviting your first user."
      />
    );
  }

  if (users.length === 0 && hasActiveFilters) {
    return (
      <SearchNotFound
        title="No users match the search criteria."
        icon={UserIcon}
      />
    );
  }

  return (
    <section className="mt-2 space-y-4">
      {/* Users Grid */}
      <UserListings
        users={users}
        handleUnBanUserClick={handleUnBanUserClick}
        setBanDialogOpen={setBanDialogOpen}
        setSelectedUser={setSelectedUser}
        unbanUserMutationPending={unbanUserMutation.isPending}
      />

      {/* Footer Pagination */}
      <Footer
        currentPage={currentPage}
        totalPages={totalPages}
        hasNext={hasNext}
        hasPrev={hasPrev}
        paramName="page"
        preserveParams={["tab", "search", "role", "status"]}
      />

      {/* Alert Dialog for unban user */}
      <AlertDialog
        action="unban"
        open={alertDialogOpen}
        onOpenChange={setAlertDialogOpen}
        actionFn={handleConfirmUnbanUser}
        statement="This will restore the user's account access and allow them to log in to the system again."
        isLoading={unbanUserMutation.isPending}
      />

      {/* Ban User Dialog */}
      <BanDialog
        banDialogOpen={banDialogOpen}
        setBanDialogOpen={setBanDialogOpen}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
      />
    </section>
  );
}

export { Users };
