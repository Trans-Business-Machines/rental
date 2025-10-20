"use client";

import { BookingCards } from "./BookingCards";
import { BookingsTable } from "./BookingsTable";
import { Calendar } from "lucide-react";
import { Switch } from "./ui/switch";
import { useState } from "react";
import { BookingEditDialog } from "@/app/(dashboard)/dashboard/_components/booking-edit-dialog";
import { useTableMode } from "@/hooks/useTableMode";
import type { Booking } from "@/lib/types/types";

interface BookingsProps {
  bookings: Booking[];
}

function Bookings({ bookings }: BookingsProps) {
  // Get table mode context from useTableMode Hook
  const { tableMode, setTableMode } = useTableMode();

  // Define state to control the Booking Edit Dialog Box
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Define state to hold the booking to edit
  const [editBooking, setEditBooking] = useState<Booking | null>(null);

  if (bookings.length === 0 || !bookings) {
    return (
      <div className="text-center py-8">
        <Calendar className="size-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium">No bookings found!</h3>
        <p className="text-muted-foreground">
          Get started by creating your first booking.
        </p>
      </div>
    );
  }
  return (
    <>
      <div>
        <div className="flex items-center gap-2 mb-2 text-muted-foreground/90 text-sm">
          <Switch
            checked={tableMode}
            onCheckedChange={setTableMode}
            className="cursor-pointer"
          />
          <span>Table mode</span>
        </div>

        {tableMode ? (
          <BookingsTable
            bookings={bookings}
            setEditBooking={setEditBooking}
            setIsDialogOpen={setIsDialogOpen}
          />
        ) : (
          <BookingCards
            bookings={bookings}
            setEditBooking={setEditBooking}
            setIsDialogOpen={setIsDialogOpen}
          />
        )}
      </div>

      {isDialogOpen && editBooking && (
        <BookingEditDialog
          booking={editBooking}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </>
  );
}

export { Bookings };
