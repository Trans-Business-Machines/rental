"use client";

import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { format, differenceInDays } from "date-fns";
import { MoreHorizontal, Eye, SquarePen } from "lucide-react";
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
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import type {
  BookingsTableAndCardsProps,
  BookingStatus,
} from "@/lib/types/types";
import Link from "next/link";

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

function BookingsTable({
  bookings,
  setEditBooking,
  setIsDialogOpen,
}: BookingsTableAndCardsProps) {
  return (
    <div className="rounded-lg border border-border overflow-hidden pb-6">
      <Table className="px-2">
        <TableHeader>
          <TableRow className="bg-muted capitalize text-left">
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
              total nights
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
          {bookings.map((booking) => (
            <TableRow key={booking.id} className="font-medium capitalize">
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
                    <DropdownMenuItem
                      asChild
                      className="hover:bg-primary/30 focus:bg-primary/30 cursor-pointer"
                    >
                      <Link
                        href={`/bookings/${booking.id}`}
                        className="flex gap-2 items-center"
                      >
                        <Eye className="size-4 text-muted-foreground" />
                        <span className="text-accent-foreground">
                          View details
                        </span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setEditBooking(booking);
                        setIsDialogOpen(true);
                      }}
                      className="hover:bg-primary/30 focus:bg-primary/30 cursor-pointer"
                    >
                      <div className="flex gap-2 items-center">
                        <SquarePen className="size-4 text-muted-foreground" />
                        <span className="text-accent-foreground">
                          Edit booking
                        </span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export { BookingsTable };
