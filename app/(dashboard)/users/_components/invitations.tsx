import { useTableMode } from "@/hooks/useTableMode";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Search } from "lucide-react";
import { InvitationsCards } from "./invitations-cards";
import { InvitationsTable } from "./invitations-table";
import type { Invitation } from "@/lib/types/types";

interface InvitationsProps {
  invitations: Invitation[];
  handleResendInvite: (email: string) => void;
}

function Invitations({ invitations, handleResendInvite }: InvitationsProps) {
  // get the table mode context from useTableMode Hook
  const { tableMode, setTableMode } = useTableMode();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section className="space-y-4">
      <div className=" flex flex-col md:flex-row gap-3 md:items-center md:w-md">
        {/* User filters */}
        <div className="flex-2 flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search invitations by email ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex-1 flex items-center gap-2 mb-2 text-muted-foreground/90 text-sm">
          <Switch
            checked={tableMode}
            onCheckedChange={setTableMode}
            className="cursor-pointer"
          />
          <span>Table mode</span>
        </div>
      </div>

      {/* Invitation cards and table goes here */}

      {tableMode ? (
        <InvitationsTable
          invitations={invitations}
          handleResendInvite={handleResendInvite}
        />
      ) : (
        <InvitationsCards
          invitations={invitations}
          handleResendInvite={handleResendInvite}
        />
      )}
    </section>
  );
}

export { Invitations };
