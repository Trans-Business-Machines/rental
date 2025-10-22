"use client";

import AdminOnly from "@/components/AdminOnly";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useBanUser,
  useDeleteUser,
  useRevokeUserSessions,
  useSetUserRole,
  useUnbanUser,
  useUsers,
} from "@/hooks/useUsers";
import { Flag, Search, Shield, UserCheck, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { StatCards, StatCardsProps } from "@/components/StatCards";
import { toast } from "sonner";
import type { User } from "@/lib/types/types";
import UserListings from "./_components/user-listings";
import Pagination from "@/components/Pagination";

function UsersPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Invite form state
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "user" as "user" | "admin",
  });

  // Ban form state
  const [banForm, setBanForm] = useState({
    reason: "",
    expiresIn: "7", // days
  });

  // React Query hooks
  const { data: users = [], isLoading, error } = useUsers(searchQuery);
  const banUserMutation = useBanUser();
  const unbanUserMutation = useUnbanUser();
  const deleteUserMutation = useDeleteUser();
  const setUserRoleMutation = useSetUserRole();
  const revokeSessionsMutation = useRevokeUserSessions();

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteForm),
      });
      setInviteDialogOpen(false);
      setInviteForm({ email: "", role: "user" });
      // Optionally show a toast
    } catch (err: any) {
      console.error(err);
      toast.error(err.message);
      // Optionally show error
    }
  };

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

  // Statistics
  const totalUsers = users.length;
  const adminUsers = users.filter((u) => u.role === "admin").length;
  const regularUsers = users.filter((u) => u.role === "user").length;
  const bannedUsers = users.filter((u) => u.banned).length;

  const stats: StatCardsProps[] = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "blue",
    },
    {
      title: "Admins",
      value: adminUsers,
      icon: Shield,
      color: "orange",
    },
    {
      title: "Regular Users",
      value: regularUsers,
      icon: UserCheck,
      color: "",
    },
    {
      title: "Banned Users",
      value: bannedUsers,
      icon: Flag,
      color: "red",
    },
  ];

  // Filter users based on search
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !searchQuery ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  if (error) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-600">
          Error loading users
        </h3>
        <p className="text-muted-foreground">
          There was an error loading the users. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-normal text-foreground">
            User Management
          </h1>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="size-4 mr-1" />
                <span>Invite User</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New User</DialogTitle>
                <DialogDescription>
                  Create a new user account with the specified role.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleInviteUser} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) =>
                      setInviteForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={inviteForm.role}
                    onValueChange={(value: "user" | "admin") =>
                      setInviteForm((prev) => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setInviteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Invite User</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <StatCards stats={stats} />

      {/* Search */}
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
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full size-10 border-b-2 border-primary"></div>
        </div>
      ) : (
        <UserListings
          users={filteredUsers}
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
      )}

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
    </div>
  );
}

export default function UsersPage() {
  return (
    <AdminOnly>
      <UsersPageContent />
    </AdminOnly>
  );
}
