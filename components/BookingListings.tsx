import { useState } from "react";
import { BookingCards } from "./BookingCards";
import { BookingsTable } from "./BookingsTable";
import { useTableMode } from "@/hooks/useTableMode";
import { useSoftDeleteBooking } from "@/hooks/useBookings";
import { AlertDialog } from "@/components/AlertDialog";
import Pagination from "./Pagination";
import type { Booking } from "@/lib/types/types";

interface BookingListingsProps {
  filteredBookings: Booking[];
  currentPage: string | number;
  totalPages: string | number;
  hasNext: boolean;
  hasPrev: boolean;
  handlePageChange: (page: number) => void;
  setEditBooking: (booking: Booking) => void;
  setIsDialogOpen: (open: boolean) => void;
}

function BookingListings({
  filteredBookings,
  setEditBooking,
  currentPage,
  handlePageChange,
  hasNext,
  hasPrev,
  totalPages,
  setIsDialogOpen,
}: BookingListingsProps) {
  // Get table mode context from useTableMode Hook
  const { tableMode } = useTableMode();

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
          setEditBooking={setEditBooking}
          setIsDialogOpen={setIsDialogOpen}
          handleClick={handleClick}
        />
      ) : (
        <BookingCards
          bookings={filteredBookings}
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

      <footer className="flex items-center justify-between pt-4 w-full">
        <Pagination
          currentPage={currentPage}
          handlePageChange={handlePageChange}
          totalPages={totalPages}
          hasNext={hasNext}
          hasPrev={hasPrev}
        />
      </footer>
    </>
  );
}

export { BookingListings };
