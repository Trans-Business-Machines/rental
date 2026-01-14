import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, User as UserIcon } from "lucide-react";
import { useFilter } from "@/hooks/useFilter";
import { ItemsNotFound } from "@/components/ItemsNotFound";
import { SearchNotFound } from "@/components/SearchNotFound";
import { usePermissions } from "@/hooks/usePermissions";
import { useUnbanUser } from "@/hooks/useUsers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BanDialog } from "./ban-dialog";
import { AlertDialog } from "./alert-dialog";
import UserListings from "./user-listings";
import Pagination from "@/components/Pagination";
import type { User } from "@/lib/types/types";

interface UsersProps {
  users: User[];
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  currentPage: number;
  handleUsersPageChange: (page: number) => void;
}

function Users({
  users,
  currentPage,
  hasNext,
  hasPrev,
  totalPages,
  handleUsersPageChange,
}: UsersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [userToUnban, setUserToUnban] = useState<string | null>(null);

  // State for Select filters
  const [selectFilters, setSelectFilters] = useState({
    role: "all",
    status: "all",
  });

  // Get the current session user role
  const { isSuperAdmin } = usePermissions();

  const unbanUserMutation = useUnbanUser();

  const filteredUsers = useFilter<User>({
    items: users,
    searchTerm: searchQuery,
    searchFields: ["name", "email"],
    selectFilters: { role: selectFilters.role, banned: selectFilters.status },
  });

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

  if (!users || users.length === 0) {
    return (
      <ItemsNotFound
        title="No users found!"
        icon={UserIcon}
        message="Get started by inviting your first user."
      />
    );
  }

  return (
    <section className="mt-2 space-y-4">
      {/* User filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          defaultValue="all"
          value={selectFilters.role}
          onValueChange={(value) => {
            setSelectFilters((prev) => ({ ...prev, role: value }));
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
            {isSuperAdmin && (
              <SelectItem value="super Admin">Super Admin</SelectItem>
            )}
          </SelectContent>
        </Select>

        <Select
          defaultValue="all"
          value={selectFilters.status}
          onValueChange={(value) => {
            setSelectFilters((prev) => ({ ...prev, status: value }));
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="false">Active</SelectItem>
            <SelectItem value="true">Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <SearchNotFound
          title="No user matches your search criteria."
          icon={UserIcon}
        />
      ) : (
        <UserListings
          users={filteredUsers}
          handleUnBanUserClick={handleUnBanUserClick}
          setBanDialogOpen={setBanDialogOpen}
          setSelectedUser={setSelectedUser}
          unbanUserMutationPending={unbanUserMutation.isPending}
        />
      )}

      <footer className="my-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          hasNext={hasNext}
          hasPrev={hasPrev}
          handlePageChange={handleUsersPageChange}
        />
      </footer>

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
