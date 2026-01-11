"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { format, differenceInDays } from "date-fns";
import {
  MoreHorizontal,
  Loader2,
  Inbox,
  RotateCcw,
  Trash2,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "./ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import {
  useSoftDeletedBookings,
  useRestoreBooking,
  useDeleteBooking,
} from "@/hooks/useBookings";
import { AlertDialog } from "@/components/AlertDialog";
import type { BookingStatus } from "@/lib/types/types";

export const getStatusColor = (status: BookingStatus): string => {
  switch (status) {
    case "pending":
      return "bg-chart-3/10 text-chart-3 border-chart-3";
    case "reserved":
      return "bg-chart-4/10 text-chart-4 border-chart-4";
    case "checked_in":
      return "bg-chart-2/10 text-chart-2 border-chart-2";
    case "checked_out":
      return "bg-chart-5/10 text-chart-5 border-chart-5";
    case "cancelled":
      return "bg-destructive/10 text-destructive border-destructive";
    default:
      return "bg-muted text-muted-foreground";
  }
};

interface DialogState {
  open: boolean;
  action: "restore" | "delete" | null;
  bookingId: number | null;
}

function ArchivedBookingsTable() {
  const [dialogState, setDialogState] = useState<DialogState>({
    open: false,
    action: null,
    bookingId: null,
  });

  const { data: bookings, isPending } = useSoftDeletedBookings();

  const { mutateAsync: restoreBooking, isPending: isRestorePending } =
    useRestoreBooking();

  const { mutateAsync: hardDeleteBooking, isPending: isDeletePending } =
    useDeleteBooking();

  /* ------------ Dialog Handlers ------------ */
  const openRestoreDialog = (bookingId: number) => {
    setDialogState({
      open: true,
      action: "restore",
      bookingId,
    });
  };

  const openDeleteDialog = (bookingId: number) => {
    setDialogState({
      open: true,
      action: "delete",
      bookingId,
    });
  };

  const closeDialog = () => {
    setDialogState({
      open: false,
      action: null,
      bookingId: null,
    });
  };

  const handleConfirm = async () => {
    if (!dialogState.bookingId) return;

    try {
      if (dialogState.action === "restore") {
        await restoreBooking(dialogState.bookingId);
      } else if (dialogState.action === "delete") {
        await hardDeleteBooking(dialogState.bookingId);
      }
    } finally {
      closeDialog();
    }
  };

  /* ------------ Loading State ------------ */
  if (isPending) {
    return (
      <div className="grid place-items-center p-6">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin size-4" />
          <p>Loading archived bookings...</p>
        </div>
      </div>
    );
  }

  /* ------------ Empty State ------------ */
  if (bookings && bookings.length === 0) {
    return (
      <div className="grid place-items-center p-6">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Inbox className="size-6" />
          <p>No archived bookings found.</p>
        </div>
      </div>
    );
  }

  /* ------------ Dialog Statement ------------ */
  const getDialogStatement = () => {
    if (dialogState.action === "restore") {
      return "When a booking is restored it will be visible to other users.";
    }
    return "This action can't be undone and the booking will be permanently removed.";
  };

  return (
    <>
      <div className="rounded-lg border border-border overflow-hidden pb-6">
        <Table className="px-2">
          <TableHeader>
            <TableRow className="capitalize text-left">
              <TableHead className="font-semibold text-foreground">
                Guest Name
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Apartment
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Unit
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Check-in
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Check-out
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Total Nights
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Status
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(bookings ?? []).map((booking) => (
              <TableRow
                key={booking.id}
                className="font-medium capitalize bg-red-50"
              >
                <TableCell>
                  {booking.guest.firstName} {booking.guest.lastName}
                </TableCell>
                <TableCell>{booking.property.name}</TableCell>
                <TableCell>{booking.unit.name}</TableCell>
                <TableCell>
                  {format(new Date(booking.checkInDate), "dd/MM/yyyy")}
                </TableCell>
                <TableCell>
                  {format(new Date(booking.checkOutDate), "dd/MM/yyyy")}
                </TableCell>
                <TableCell>
                  {differenceInDays(
                    new Date(booking.checkOutDate),
                    new Date(booking.checkInDate)
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={`${getStatusColor(booking.status)} capitalize`}
                  >
                    {booking.status.includes("_")
                      ? booking.status.replace("_", " ")
                      : booking.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 cursor-pointer p-0"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="hover:bg-blue-500/20 focus:bg-blue-500/20 cursor-pointer gap-2"
                        disabled={isRestorePending || isDeletePending}
                        onClick={() => openRestoreDialog(booking.id)}
                      >
                        <RotateCcw className="size-4 text-blue-500" />
                        <span className="text-blue-500">Restore</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="hover:bg-red-500/20 focus:bg-red-500/20 cursor-pointer gap-2"
                        disabled={isRestorePending || isDeletePending}
                        onClick={() => openDeleteDialog(booking.id)}
                      >
                        <Trash2 className="size-4 text-red-500" />
                        <span className="text-red-500">Delete Permanently</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={dialogState.open}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        item="booking"
        action={dialogState.action ?? "delete"}
        actionFn={handleConfirm}
        isLoading={isRestorePending || isDeletePending}
        statement={getDialogStatement()}
      />
    </>
  );
}

export { ArchivedBookingsTable };
