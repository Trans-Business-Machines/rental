import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Users as UsersTab } from "./users";
import { Invitations as InvitationsTab } from "./invitations";
import type { User, Invitation } from "@/lib/types/types";

interface UserInvitationsSwitchProps {
  users: User[];
  invitations: Invitation[];
  handleResendInvite: (email: string) => void;
}

function UserInvitationsSwitch({
  users,
  invitations,
  handleResendInvite,
}: UserInvitationsSwitchProps) {
  return (
    <div>
      {/* Tabs */}
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
          {/* User Listing goes here */}
          <UsersTab users={users} />
        </TabsContent>
        <TabsContent value="invitations">
          {/* Invitation Listing goes here */}

          <InvitationsTab
            invitations={invitations}
            handleResendInvite={handleResendInvite}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { UserInvitationsSwitch };
