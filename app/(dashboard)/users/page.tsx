"use client";

import { useState, useTransition, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AdminOnly from "@/components/AdminOnly";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatCards } from "@/components/StatCards";
import { useUsers, useUserStats } from "@/hooks/useUsers";
import { useInvitations, useResendInvite } from "@/hooks/useInvitations";
import { usePermissions } from "@/hooks/usePermissions";
import {
  Users,
  UserPlus,
  Shield,
  UserCheck,
  Flag,
  Search,
  Loader2,
} from "lucide-react";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Users as UsersTab } from "./_components/users";
import { Invitations as InvitationsTab } from "./_components/invitations";
import { InviteUserDialog } from "./_components/invite-user-dialog";
import type { StatCardsProps } from "@/components/StatCards";

interface UserFilters {
  search: string;
  role: string;
  status: string;
}

interface InvitationFilters {
  search: string;
  status: string;
}

function UsersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current user's role
  const { isSuperAdmin } = usePermissions();

  // Get URL params
  const tab = searchParams.get("tab") || "users";

  // Users tab params
  const usersPage = Number(searchParams.get("page")) || 1;
  const usersSearch = searchParams.get("search") || "";
  const usersRole = searchParams.get("role") || "all";
  const usersStatus = searchParams.get("status") || "all";

  // Invitations tab params
  const invitationsPage = Number(searchParams.get("invitationsPage")) || 1;
  const invitationsSearch = searchParams.get("invitationsSearch") || "";
  const invitationsStatus = searchParams.get("invitationsStatus") || "all";

  // Transitions for users filters
  const [isUsersApplyPending, startUsersApplyTransition] = useTransition();
  const [isUsersClearPending, startUsersClearTransition] = useTransition();
  const isUsersPending = isUsersApplyPending || isUsersClearPending;

  // Transitions for invitations filters
  const [isInvitationsApplyPending, startInvitationsApplyTransition] =
    useTransition();
  const [isInvitationsClearPending, startInvitationsClearTransition] =
    useTransition();
  const isInvitationsPending =
    isInvitationsApplyPending || isInvitationsClearPending;

  // Local state for users  inputs
  const [userFilters, setUserFilters] = useState<UserFilters>({
    search: usersSearch,
    role: usersRole,
    status: usersStatus,
  });

  // Local state for invitations  inputs
  const [invitationFilters, setInvitationFilters] = useState<InvitationFilters>(
    {
      search: invitationsSearch,
      status: invitationsStatus,
    },
  );

  // Sync users filters with URL
  useEffect(() => {
    setUserFilters({
      search: usersSearch,
      role: usersRole,
      status: usersStatus,
    });
  }, [usersSearch, usersRole, usersStatus]);

  // Sync invitations filters with URL
  useEffect(() => {
    setInvitationFilters({
      search: invitationsSearch,
      status: invitationsStatus,
    });
  }, [invitationsSearch, invitationsStatus]);

  // Check for active filters
  const hasActiveUserFilters =
    usersSearch !== "" || usersRole !== "all" || usersStatus !== "all";

  const hasActiveInvitationFilters =
    invitationsSearch !== "" || invitationsStatus !== "all";

  // Get users stats from the DB
  const { userStats } = useUserStats();

  // Get users from the DB with filters
  const { data: usersData, error } = useUsers({
    page: usersPage,
    search: usersSearch,
    role: usersRole,
    status: usersStatus,
  });

  // Get invitations with filters (will be updated later)
  const { invitationsData, invitationsError } = useInvitations({
    currentPage: invitationsPage,
    search: invitationsSearch,
    status: invitationsStatus,
  });

  // Get the Resend Invite mutation
  const { resendInvite, isPending: isResendPending } = useResendInvite();

  const handleResendInvite = async (email: string) => {
    await resendInvite(email);
  };

  /* ------------ Users Filter Handlers ------------ */
  const applyUserFilters = () => {
    const params = new URLSearchParams();
    params.set("tab", "users");
    params.set("page", "1");

    if (userFilters.search) {
      params.set("search", userFilters.search);
    }
    if (userFilters.role !== "all") {
      params.set("role", userFilters.role);
    }
    if (userFilters.status !== "all") {
      params.set("status", userFilters.status);
    }

    startUsersApplyTransition(() => {
      router.push(`/users?${params.toString()}`);
    });
  };

  const clearUserFilters = () => {
    setUserFilters({
      search: "",
      role: "all",
      status: "all",
    });

    startUsersClearTransition(() => {
      router.push("/users?tab=users&page=1");
    });
  };

  /* ------------ Invitations Filter Handlers ------------ */
  const applyInvitationFilters = () => {
    const params = new URLSearchParams();
    params.set("tab", "invitations");
    params.set("invitationsPage", "1");

    if (invitationFilters.search) {
      params.set("invitationsSearch", invitationFilters.search);
    }
    if (invitationFilters.status !== "all") {
      params.set("invitationsStatus", invitationFilters.status);
    }

    startInvitationsApplyTransition(() => {
      router.push(`/users?${params.toString()}`);
    });
  };

  const clearInvitationFilters = () => {
    setInvitationFilters({
      search: "",
      status: "all",
    });

    startInvitationsClearTransition(() => {
      router.push("/users?tab=invitations&invitationsPage=1");
    });
  };

  /* ------------ Tab Change Handler ------------ */
  const handleTabChange = (value: string) => {
    if (value === "users") {
      router.push("/users?tab=users&page=1");
    } else {
      router.push("/users?tab=invitations&invitationsPage=1");
    }
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

  const stats: StatCardsProps[] = [
    {
      title: "Total Users",
      value: userStats?.total || 0,
      icon: Users,
      color: "blue",
    },
    {
      title: "Admins",
      value: userStats?.admins || 0,
      icon: Shield,
      color: "orange",
    },
    {
      title: "Regular Users",
      value: userStats?.regular || 0,
      icon: UserCheck,
      color: "",
    },
    {
      title: "Banned Users",
      value: userStats?.banned || 0,
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
        <InviteUserDialog>
          <Button className="cursor-pointer px-4">
            <UserPlus className="size-4 mr-1 text-white" />
            <span>Invite User</span>
          </Button>
        </InviteUserDialog>
      </header>

      <StatCards stats={stats} />

      {usersData !== undefined && invitationsData !== undefined ? (
        <Tabs value={tab} onValueChange={handleTabChange} className="my-4">
          <TabsList className="w-2/3 lg:max-w-xl">
            <TabsTrigger value="users" className="cursor-pointer">
              Users
            </TabsTrigger>
            <TabsTrigger value="invitations" className="cursor-pointer">
              Invitations
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            {/* Users Search and Filters */}
            <div className="flex flex-col gap-4 pt-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={userFilters.search}
                    onChange={(e) =>
                      setUserFilters((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }))
                    }
                    disabled={isUsersPending}
                    className="pl-10"
                  />
                </div>

                {/* Role Filter (only for superAdmin) */}
                {isSuperAdmin && (
                  <Select
                    value={userFilters.role}
                    onValueChange={(value) =>
                      setUserFilters((prev) => ({ ...prev, role: value }))
                    }
                    disabled={isUsersPending}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="superAdmin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {/* Status Filter */}
                <Select
                  value={userFilters.status}
                  onValueChange={(value) =>
                    setUserFilters((prev) => ({ ...prev, status: value }))
                  }
                  disabled={isUsersPending}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={applyUserFilters}
                  disabled={isUsersPending}
                  className="cursor-pointer px-8"
                >
                  {isUsersApplyPending ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    "Apply filters"
                  )}
                </Button>
                <Button
                  onClick={clearUserFilters}
                  disabled={isUsersPending}
                  className="cursor-pointer px-8 bg-chart-5 hover:bg-red-600"
                >
                  {isUsersClearPending ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Clearing...
                    </>
                  ) : (
                    "Clear filters"
                  )}
                </Button>
              </div>
            </div>

            {/* Users Listings */}
            <div
              className={isUsersPending ? "opacity-50 pointer-events-none" : ""}
            >
              <UsersTab
                users={usersData.users}
                currentPage={usersData.currentPage}
                hasNext={usersData.hasNext}
                hasPrev={usersData.hasPrev}
                totalPages={usersData.totalPages}
                hasActiveFilters={hasActiveUserFilters}
              />
            </div>
          </TabsContent>

          {/* Invitations Tab */}
          <TabsContent value="invitations" className="space-y-4">
            {/* Invitations Search and Filters */}
            <div className="flex flex-col gap-4 pt-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search invitations by name or email..."
                    value={invitationFilters.search}
                    onChange={(e) =>
                      setInvitationFilters((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }))
                    }
                    disabled={isInvitationsPending}
                    className="pl-10"
                  />
                </div>

                {/* Status Filter */}
                <Select
                  value={invitationFilters.status}
                  onValueChange={(value) =>
                    setInvitationFilters((prev) => ({ ...prev, status: value }))
                  }
                  disabled={isInvitationsPending}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={applyInvitationFilters}
                  disabled={isInvitationsPending}
                  className="cursor-pointer px-8"
                >
                  {isInvitationsApplyPending ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    "Apply filters"
                  )}
                </Button>
                <Button
                  onClick={clearInvitationFilters}
                  disabled={isInvitationsPending}
                  className="cursor-pointer px-8 bg-chart-5 hover:bg-red-600"
                >
                  {isInvitationsClearPending ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Clearing...
                    </>
                  ) : (
                    "Clear filters"
                  )}
                </Button>
              </div>
            </div>

            {/* Invitations Listings */}
            <div
              className={
                isInvitationsPending ? "opacity-50 pointer-events-none" : ""
              }
            >
              <InvitationsTab
                invitations={invitationsData.invitations}
                hasNext={invitationsData.hasNext}
                hasPrev={invitationsData.hasPrev}
                totalPages={invitationsData.totalPages}
                currentPage={invitationsData.currentPage}
                handleResendInvite={handleResendInvite}
                isResendPending={isResendPending}
                hasActiveFilters={hasActiveInvitationFilters}
              />
            </div>
          </TabsContent>
        </Tabs>
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
