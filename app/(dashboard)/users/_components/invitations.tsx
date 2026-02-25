"use client";

import { useState } from "react";
import { Inbox } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTableMode } from "@/hooks/useTableMode";
import { ItemsNotFound } from "@/components/ItemsNotFound";
import { SearchNotFound } from "@/components/SearchNotFound";
import { Footer } from "@/components/Footer";
import { InvitationsCards } from "./invitations-cards";
import { InvitationsTable } from "./invitations-table";
import type { Invitation } from "@/lib/types/types";

interface InvitationsProps {
  invitations: Invitation[];
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  currentPage: number;
  isResendPending: boolean;
  handleResendInvite: (email: string) => Promise<void>;
  hasActiveFilters: boolean;
}

function Invitations({
  invitations,
  hasNext,
  hasPrev,
  totalPages,
  currentPage,
  isResendPending,
  handleResendInvite,
  hasActiveFilters,
}: InvitationsProps) {
  const { tableMode, setTableMode } = useTableMode();
  const [resendEmail, setResendEmail] = useState("");
  

  if (invitations.length === 0 && !hasActiveFilters) {
    return (
      <ItemsNotFound
        title="No invitations found!"
        icon={Inbox}
        message="Get started by inviting your first user."
      />
    );
  }

  if (invitations.length === 0 && hasActiveFilters) {
    return (
      <SearchNotFound
        icon={Inbox}
        title="No invitations match the search criteria."
      />
    );
  }

  return (
    <section className="space-y-4">
      {/* Table Mode Toggle */}
      <div className="flex items-center gap-2 text-muted-foreground/90 text-sm">
        <Switch
          checked={tableMode}
          onCheckedChange={setTableMode}
          className="cursor-pointer"
        />
        <span>Table mode</span>
      </div>

      {/* Invitations Display */}
      {tableMode ? (
        <InvitationsTable
          invitations={invitations}
          handleResendInvite={handleResendInvite}
          isResendPending={isResendPending}
          resendEmail={resendEmail}
          setResendEmail={setResendEmail}
        />
      ) : (
        <InvitationsCards
          invitations={invitations}
          isResendPending={isResendPending}
          handleResendInvite={handleResendInvite}
          resendEmail={resendEmail}
          setResendEmail={setResendEmail}
        />
      )}

      {/* Footer Pagination */}
      <Footer
        currentPage={currentPage}
        totalPages={totalPages}
        hasNext={hasNext}
        hasPrev={hasPrev}
        paramName="invitationsPage"
        preserveParams={[
          "tab",
          "invitationsSearch",
          "invitationsStatus",
          "invitationsRole",
        ]}
      />
    </section>
  );
}

export { Invitations };
