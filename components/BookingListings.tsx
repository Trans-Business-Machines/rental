import { useState } from "react";
import { BookingCards } from "./BookingCards";
import { BookingsTable } from "./BookingsTable";
import { useTableMode } from "@/hooks/useTableMode";
import { useSoftDeleteBooking } from "@/hooks/useBookings";
import { AlertDialog } from "@/components/AlertDialog";
import { Footer } from "@/components/Footer";
import { usePermissions } from "@/hooks/usePermissions";
import type { Booking } from "@/lib/types/types";

interface BookingListingsProps {
  filteredBookings: Booking[];
  currentPage: string | number;
  totalPages: string | number;
  hasNext: boolean;
  hasPrev: boolean;
  setEditBooking: (booking: Booking) => void;
  setIsDialogOpen: (open: boolean) => void;
}

function BookingListings({
  filteredBookings,
  setEditBooking,
  currentPage,
  hasNext,
  hasPrev,
  totalPages,
  setIsDialogOpen,
}: BookingListingsProps) {
  // Get table mode context from useTableMode Hook
  const { tableMode } = useTableMode();

  const { isAgent } = usePermissions();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<number | null>(null);
  const { mutateAsync, isPending } = useSoftDeleteBooking();

  const handleClick = (bookingId: number) => {
    setBookingToDelete(bookingId);
    setDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (bookingToDelete) {
      try {
        await mutateAsync(bookingToDelete);
      } finally {
        setDialogOpen(false);
        setBookingToDelete(null);
      }
    }
  };

  return (
    <>
      {tableMode ? (
        <BookingsTable
          bookings={filteredBookings}
          isAgent={isAgent}
          setEditBooking={setEditBooking}
          setIsDialogOpen={setIsDialogOpen}
          handleClick={handleClick}
        />
      ) : (
        <BookingCards
          bookings={filteredBookings}
          isAgent={isAgent}
          setEditBooking={setEditBooking}
          setIsDialogOpen={setIsDialogOpen}
          handleClick={handleClick}
        />
      )}

      <AlertDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        actionFn={handleConfirm}
        action="archive"
        isLoading={isPending}
        item="booking"
        statement="Once archived only a super admin can restore this booking."
      />

      <Footer
        currentPage={currentPage}
        totalPages={totalPages}
        hasNext={hasNext}
        hasPrev={hasPrev}
        paramName="page"
        preserveParams={["search", "status", "propertyId"]}
      />
    </>
  );
}

export { BookingListings };
