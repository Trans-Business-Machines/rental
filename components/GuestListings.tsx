"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { GuestCards } from "./GuestCards";
import { GuestsTable } from "./GuestsTable";
import { GuestEditDialog } from "./GuestEditDialog";
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

  // Return empty ui when guest list is 0
  if (guests.length === 0 || !guests) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium">No guests found</h3>
        <p className="text-muted-foreground">
          Get started by adding your first guest
        </p>
      </div>
    );
  }

  return (
    <div>
      {tableMode ? (
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
