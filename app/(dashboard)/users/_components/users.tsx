import { useState } from "react";
import type { User } from "@/lib/types/types";
import {
  useBanUser,
  useDeleteUser,
  useRevokeUserSessions,
  useSetUserRole,
  useUnbanUser,
} from "@/hooks/useUsers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import UserListings from "./user-listings";
import Pagination from "@/components/Pagination";

interface UsersProps {
  users: User[];
}

function Users({ users }: UsersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Ban form state
  const [banForm, setBanForm] = useState({
    reason: "",
    expiresIn: "7", // days
  });

  const banUserMutation = useBanUser();
  const unbanUserMutation = useUnbanUser();
  const deleteUserMutation = useDeleteUser();
  const setUserRoleMutation = useSetUserRole();
  const revokeSessionsMutation = useRevokeUserSessions();

  const handleBanUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const expiresIn = parseInt(banForm.expiresIn) * 24 * 60 * 60; // Convert days to seconds

    banUserMutation.mutate(
      {
        userId: selectedUser.id,
        reason: banForm.reason || undefined,
        expiresIn,
      },
      {
        onSuccess: () => {
          setBanDialogOpen(false);
          setBanForm({ reason: "", expiresIn: "7" });
          setSelectedUser(null);
        },
      }
    );
  };

  const handleUnbanUser = async (userId: string) => {
    unbanUserMutation.mutate(userId);
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }
    deleteUserMutation.mutate(userId);
  };

  const handleRevokeAllSessions = async (userId: string) => {
    revokeSessionsMutation.mutate(userId);
  };

  const handleSetRole = async (userId: string, role: "user" | "admin") => {
    setUserRoleMutation.mutate({ userId, role });
  };

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
        <Select defaultValue="all">
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Grid */}

      <UserListings
        users={users}
        handleDeleteUser={handleDeleteUser}
        handleRevokeAllSessions={handleRevokeAllSessions}
        handleSetRole={handleSetRole}
        handleUnbanUser={handleUnbanUser}
        setBanDialogOpen={setBanDialogOpen}
        setSelectedUser={setSelectedUser}
        deleteUserMutationPending={deleteUserMutation.isPending}
        revokeSessionsMutationPending={revokeSessionsMutation.isPending}
        unbanUserMutationPending={unbanUserMutation.isPending}
        userRoleMutationPending={setUserRoleMutation.isPending}
      />

      <footer className="my-4">
        <Pagination />
      </footer>

      {/* Ban User Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Ban {selectedUser?.name} from accessing the system.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBanUser} className="space-y-4">
            <div>
              <Label htmlFor="reason">Ban Reason (Optional)</Label>
              <Input
                id="reason"
                value={banForm.reason}
                onChange={(e) =>
                  setBanForm((prev) => ({ ...prev, reason: e.target.value }))
                }
                placeholder="Enter reason for ban..."
                disabled={banUserMutation.isPending}
              />
            </div>
            <div>
              <Label htmlFor="expiresIn">Ban Duration</Label>
              <Select
                value={banForm.expiresIn}
                onValueChange={(value) =>
                  setBanForm((prev) => ({ ...prev, expiresIn: value }))
                }
                disabled={banUserMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Day</SelectItem>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setBanDialogOpen(false)}
                disabled={banUserMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={banUserMutation.isPending}
              >
                {banUserMutation.isPending ? "Banning..." : "Ban User"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export { Users };
