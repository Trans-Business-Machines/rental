"use client";

import AdminOnly from "@/components/AdminOnly";
import { Button } from "@/components/ui/button";
import { StatCards } from "@/components/StatCards";
import { useUsers, useUserStats } from "@/hooks/useUsers";
import { useInvitations, useResendInvite } from "@/hooks/useInvitations";
import { Users, UserPlus, Shield, UserCheck, Flag } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Users as UsersTab } from "./_components/users";
import { Invitations as InvitationsTab } from "./_components/invitations";
import { InviteUserDialog } from "./_components/invite-user-dialog";
import type { StatCardsProps } from "@/components/StatCards";

function UsersPageContent() {
  // Get search params from the URL and the router object as well.
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get invitations current page and users current page
  const InvitationsCurrentPage =
    Number(searchParams.get("invitationspage")) || 1;
  const UsersCurrentPage = Number(searchParams.get("userspage")) || 1;

  // Get usersStats, users, and invitations via custom hooks
  const { userStats } = useUserStats();
  const { data: usersData, error } = useUsers({
    page: UsersCurrentPage,
  });

  const { invitationsData, invitationsError } = useInvitations({
    currentPage: InvitationsCurrentPage,
  });

  // Get the Resend Invite mutation from useResendInvite hook.
  const { resendInvite } = useResendInvite();

  const handleResendInvite = (email: string) => {
    resendInvite(email);
  };

  const handleInvitationPageChange = (page: number) => {
    // create a new params object using the exisitng searchParams
    // this helps to reserve other existing params
    const params = new URLSearchParams(searchParams);

    params.set("invitationspage", page.toString());
    router.push(`?${params.toString()}`);
  };

  const handleUsersPageChange = (page: number) => {
    // create a new params object using the exisitng searchParams
    // this helps to reserve other existing params
    const params = new URLSearchParams(searchParams);

    params.set("userspage", page.toString());
    router.push(`?${params.toString()}`);
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
          <Button>
            <UserPlus className="size-4 mr-1" />
            <span>Invite User</span>
          </Button>
        </InviteUserDialog>
      </header>

      <StatCards stats={stats} />

      {usersData !== undefined && invitationsData !== undefined ? (
        <div>
          <Tabs defaultValue="users" className="my-4">
            <TabsList className="w-2/3 lg:max-w-xl">
              <TabsTrigger value="users" className="cursor-pointer">
                Users
              </TabsTrigger>
              <TabsTrigger value="invitations" className="cursor-pointer">
                Invitations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <UsersTab
                users={usersData.users}
                currentPage={usersData.currentPage}
                hasNext={usersData.hasNext}
                hasPrev={usersData.hasPrev}
                totalPages={usersData.totalPages}
                handleUsersPageChange={handleUsersPageChange}
              />
            </TabsContent>

            <TabsContent value="invitations">
              <InvitationsTab
                invitations={invitationsData.invitations}
                hasNext={invitationsData.hasNext}
                hasPrev={invitationsData.hasPrev}
                totalPages={invitationsData.totalPages}
                currentPage={invitationsData.currentPage}
                handleResendInvite={handleResendInvite}
                handleInvitationPageChange={handleInvitationPageChange}
              />
            </TabsContent>
          </Tabs>
        </div>
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
