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
import { StatCards } from "@/components/StatCards";
import { useUsers } from "@/hooks/useUsers";
import { useInvitations, useResendInvite } from "@/hooks/useInvitations";
import { useState } from "react";
import { UserInvitationsSwitch } from "./_components/user-invitations-switch";
import { toast } from "sonner";
import { Users, UserPlus, Shield, UserCheck, Flag } from "lucide-react";
import type { StatCardsProps } from "@/components/StatCards";

function UsersPageContent() {
  // State to keep track of the invite user Dialog box
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  // Invite form state
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    role: "user" as "user" | "admin",
  });

  // Get users and invitations via react Query hook
  const { data: users = [], isLoading, error } = useUsers();
  const { invitations, invitationsError, invitationsPending } =
    useInvitations();

  // Resend Invite mutation
  const { resendInvite } = useResendInvite();

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteForm),
      });
      setInviteDialogOpen(false);
      setInviteForm({ email: "", role: "user", name: "" });
      // Optionally show a toast
    } catch (err: any) {
      console.error(err);
      toast.error(err.message);
      // Optionally show error
    }
  };

  const handleResendInvite = (email: string) => {
    resendInvite(email);
  };

  if (error || invitationsError) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-600">
          Error loading users or invitations
        </h3>
        <p className="text-muted-foreground">
          There was an error loading the users. Please try again.
        </p>
      </div>
    );
  }

  if (!isLoading && users.length === 0) {
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

  if (!invitationsPending && invitations && invitations.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium">No invitations found</h3>
        <p className="text-muted-foreground">
          Get started by inviting your first user
        </p>
      </div>
    );
  }

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

  return (
    <section className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
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
              <form onSubmit={handleInviteUser} className="space-y-3">
                {/* Name input */}
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={inviteForm.name}
                    onChange={(e) =>
                      setInviteForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                {/* Email input */}
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

                {/* Role Input */}
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={inviteForm.role}
                    onValueChange={(value: "user" | "admin") =>
                      setInviteForm((prev) => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    className="bg-chart-5 hover:bg-chart-5/90"
                    onClick={() => setInviteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                    size="sm"
                    className="bg-chart-1 hover:bg-chart-1/90"
                  >
                    Invite User
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <StatCards stats={stats} />

      {users && invitations ? (
        <UserInvitationsSwitch
          users={users}
          invitations={invitations}
          handleResendInvite={handleResendInvite}
        />
      ) : (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full size-10 border-b-2 border-primary"></div>
        </div>
      )}
    </section>
  );
}

export default function UsersPage() {
  return (
    <AdminOnly>
      <UsersPageContent />
    </AdminOnly>
  );
}
