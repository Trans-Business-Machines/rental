"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { GuestCards } from "./GuestCards";
import { GuestsTable } from "./GuestsTable";
import { GuestEditDialog } from "./GuestEditDialog";
import { SearchNotFound } from "./SearchNotFound";
import type { Guest } from "@/lib/types/types";

interface GuestListingsProps {
  guests: Guest[];
  tableMode: boolean;
}

function GuestListings({ guests, tableMode }: GuestListingsProps) {
  // Define state to control the Guest Edit Dialog Box
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Define state to keep track of the guest to edit
  const [editGuest, setEditGuest] = useState<Guest | null>(null);

  return (
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
        />
      ) : (
        <GuestCards
          guests={guests}
          setIsDialogOpen={setIsDialogOpen}
          setEditGuest={setEditGuest}
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
  );
}

export default GuestListings;
