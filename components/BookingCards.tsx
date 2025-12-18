"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Building,
  Calendar,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Clock,
  ClipboardPaste,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import type { BookingsTableAndCardsProps } from "@/lib/types/types";
import { getStatusColor } from "./BookingsTable";
import { useRouter } from "next/navigation";
import { deleteBooking } from "@/lib/actions/bookings";
import { DeleteDialog } from "@/components/BookingDeleteDialog";
import { toast } from "sonner";
import Link from "next/link";

function BookingCards({
  bookings,
  setEditBooking,
  setIsDialogOpen,
}: BookingsTableAndCardsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<number | null>(null);

  const router = useRouter();

  const handleDeleteClick = (bookingId: number) => {
    setBookingToDelete(bookingId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (bookingToDelete) {
      try {
        await deleteBooking(bookingToDelete);
        toast.success("Booking deleted successfully.");
      } catch (error) {
        console.log("Error deleting booking: ", error);
        toast.error("Delete booking failed, try again.");
      } finally {
        setDeleteDialogOpen(false);
        setBookingToDelete(null);
      }
    }
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bookings.map((booking) => {
          const guestInitials =
            booking.guest.firstName[0].toUpperCase() +
            booking.guest.lastName[0].toUpperCase();

          const numOfNights = Math.max(
            1,
            differenceInDays(
              new Date(booking.checkOutDate),
              new Date(booking.checkInDate)
            )
          );

          return (
            <Card
              key={booking.id}
              className="group shadow-sm hover:shadow-md  transition-all duration-200 border-0 bg-card"
            >
              <CardHeader className="pb-3">
                <article className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-12">
                      <AvatarFallback>{guestInitials}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-foreground leading-none">
                        {booking.guest.firstName} {booking.guest.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {booking.guest.email}
                      </p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        className="hover:bg-primary/30 focus:bg-primary/30 cursor-pointer"
                        asChild
                      >
                        <Link href={`/bookings/${booking.id}`}>
                          <Eye className="size-4" />
                          <span>View Details</span>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        disabled={
                          booking.status === "cancelled" ||
                          booking.status === "checked_out"
                        }
                        onClick={() => {
                          setEditBooking(booking);
                          setIsDialogOpen(true);
                        }}
                        className="hover:bg-primary/30 focus:bg-primary/30 cursor-pointer"
                      >
                        <Edit className="size-4" />
                        <span>Edit Booking</span>
                      </DropdownMenuItem>

                      {booking.status === "checked_in" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              router.push(`/checkout/${booking.id}`);
                            }}
                            className="hover:bg-primary/30 focus:bg-primary/30 cursor-pointer"
                          >
                            <div className="flex gap-2 items-center">
                              <ClipboardPaste className="size-4 text-muted-foreground" />
                              <span className="text-accent-foreground">
                                Checkout guest
                              </span>
                            </div>
                          </DropdownMenuItem>
                        </>
                      )}

                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(booking.id)}
                        disabled={
                          booking.status === "pending" ||
                          booking.status === "reserved" ||
                          booking.status === "checked_in"
                        }
                        className="hover:bg-destructive/30 focus:bg-destructive/30 cursor-pointer"
                      >
                        <div className="flex gap-2 items-center">
                          <Trash2 className="size-4 text-destructive" />
                          <span className="text-destructive">
                            Delete booking
                          </span>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </article>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="size-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">
                      {booking.property.name}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="font-medium text-foreground">
                      {booking.unit.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Created At - </span>
                    <span className="text-muted-foreground">
                      {format(new Date(booking.createdAt), "PPp")}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Check-in</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">
                        {format(new Date(booking.checkInDate), "dd/MM/yyyy")}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Check-out</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">
                        {format(new Date(booking.checkOutDate), "dd/MM/yyyy")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t  border-border pt-2">
                  <Badge
                    variant="secondary"
                    className={`${getStatusColor(booking.status)} capitalize`}
                  >
                    {booking.status.includes("_")
                      ? booking.status.replace("_", " ")
                      : booking.status}
                  </Badge>

                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{`${numOfNights} ${numOfNights === 1 ? "night" : "nights"}`}</p>
                    <p className="font-semibold text-foreground">
                      ${booking.totalAmount}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

export { BookingCards };
