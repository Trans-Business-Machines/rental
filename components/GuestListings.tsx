"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { GuestCards } from "./GuestCards";
import { GuestsTable } from "./GuestsTable";
import { GuestEditDialog } from "./GuestEditDialog";
import { SearchNotFound } from "./SearchNotFound";
import { useSoftDeleteGuest } from "@/hooks/useGuests";
import { AlertDialog } from "@/components/AlertDialog";
import Pagination from "@/components/Pagination";
import type { Guest } from "@/lib/types/types";

interface GuestListingsProps {
  guests: Guest[];
  currentPage: string | number;
  totalPages: string | number;
  tableMode: boolean;
  hasNext: boolean;
  hasPrev: boolean;
  handlePageChange: (page: number) => void;
}

function GuestListings({
  guests,
  tableMode,
  currentPage,
  hasNext,
  hasPrev,
  totalPages,
  handlePageChange,
}: GuestListingsProps) {
  // Define state to control the Guest Edit Dialog Box
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [editGuest, setEditGuest] = useState<Guest | null>(null);
  const [guestToArchive, setGuestToArchive] = useState<number | null>(null);
  const { mutateAsync, isPending } = useSoftDeleteGuest();

  const handleClick = (guestId: number) => {
    setGuestToArchive(guestId);
    setIsAlertDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (guestToArchive) {
      try {
        await mutateAsync(guestToArchive);
      } finally {
        setGuestToArchive(null);
        setIsAlertDialogOpen(false);
      }
    }
  };

  return (
    <>
      <div>
        {guests.length === 0 ? (
          <SearchNotFound
            title="No guests matches the search criteria."
            icon={Users}
          />
        ) : tableMode ? (
          <GuestsTable
            guests={guests}
            setIsDialogOpen={setIsDialogOpen}
            setEditGuest={setEditGuest}
            handleClick={handleClick}
            isArchivePending={isPending}
          />
        ) : (
          <GuestCards
            guests={guests}
            setIsDialogOpen={setIsDialogOpen}
            setEditGuest={setEditGuest}
            handleClick={handleClick}
            isArchivePending={isPending}
          />
        )}

        {isDialogOpen && editGuest && (
          <GuestEditDialog
            setIsDialogOpen={setIsDialogOpen}
            isDialogOpen={isDialogOpen}
            guest={editGuest}
          />
        )}
      </div>

      <AlertDialog
        open={isAlertDialogOpen}
        onOpenChange={setIsAlertDialogOpen}
        actionFn={handleConfirm}
        action="archive"
        isLoading={isPending}
        item="guest"
        statement="Once archived only a super admin can restore this guest."
      />

      <footer className="flex items-center justify-between pt-4 w-full">
        <Pagination
          currentPage={currentPage}
          handlePageChange={handlePageChange}
          hasNext={hasNext}
          hasPrev={hasPrev}
          totalPages={totalPages}
        />
      </footer>
    </>
  );
}

export default GuestListings;
