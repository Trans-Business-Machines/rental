import { useTableMode } from "@/hooks/useTableMode";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Search, Inbox } from "lucide-react";
import { ItemsNotFound } from "@/components/ItemsNotFound";
import { InvitationsCards } from "./invitations-cards";
import { InvitationsTable } from "./invitations-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFilter } from "@/hooks/useFilter";
import { SearchNotFound } from "@/components/SearchNotFound";
import { usePermissions } from "@/hooks/usePermissions";
import Pagination from "@/components/Pagination";
import type { Invitation } from "@/lib/types/types";

interface InvitationsProps {
  invitations: Invitation[];
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  currentPage: number;
  isResendPending: boolean;
  handleInvitationPageChange: (page: number) => void;
  handleResendInvite: (email: string) => Promise<void>;
}

function Invitations({
  invitations,
  hasNext,
  hasPrev,
  totalPages,
  currentPage,
  isResendPending,
  handleResendInvite,
  handleInvitationPageChange,
}: InvitationsProps) {
  // get the table mode context from useTableMode Hook
  const { tableMode, setTableMode } = useTableMode();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectFilters, setSelectFilters] = useState({
    role: "all",
  });

  const [resendEmail, setResendEmail] = useState("");

  const filteredInvitations = useFilter<Invitation>({
    items: invitations,
    searchTerm: searchQuery,
    searchFields: ["email", "name"],
    selectFilters: { role: selectFilters.role },
  });

  const { isSuperAdmin } = usePermissions();

  if (!invitations || invitations.length === 0) {
    return (
      <ItemsNotFound
        title="No invitations found!"
        icon={Inbox}
        message="Get started by inviting your first user."
      />
    );
  }

  return (
    <section className="space-y-4">
      <div className=" flex flex-col md:flex-row gap-3 md:items-center md:w-sm lg:w-3xl">
        {/* User filters */}
        <div className="flex-2 flex items-center space-x-4">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search invitations by email or name . . ."
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
              <SelectItem value="user">User</SelectItem>
              {isSuperAdmin && <SelectItem value="admin">Admin</SelectItem>}
              {isSuperAdmin && (
                <SelectItem value="superAdmin">Super Admin</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 flex items-center gap-2 text-muted-foreground/90 text-sm">
          <Switch
            checked={tableMode}
            onCheckedChange={setTableMode}
            className="cursor-pointer"
          />
          <span>Table mode</span>
        </div>
      </div>

      {filteredInvitations.length === 0 ? (
        <SearchNotFound
          icon={Inbox}
          title="No invitation matches your search criteria."
          className="pt-3"
        />
      ) : tableMode ? (
        <InvitationsTable
          invitations={filteredInvitations}
          handleResendInvite={handleResendInvite}
          isResendPending={isResendPending}
          resendEmail={resendEmail}
          setResendEmail={setResendEmail}
        />
      ) : (
        <InvitationsCards
          invitations={filteredInvitations}
          isResendPending={isResendPending}
          handleResendInvite={handleResendInvite}
          resendEmail={resendEmail}
          setResendEmail={setResendEmail}
        />
      )}

      <footer className="mt-4">
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          hasNext={hasNext}
          hasPrev={hasPrev}
          handlePageChange={handleInvitationPageChange}
        />
      </footer>
    </section>
  );
}

export { Invitations };
