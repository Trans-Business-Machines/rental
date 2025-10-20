"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Edit, Eye, Search } from "lucide-react";
import { BookingEditDialog } from "./booking-edit-dialog";
import { BookingViewDialog } from "./booking-view-dialog";
import { useState } from "react";
import Pagination from "@/components/Pagination";
import type { Booking } from "@/lib/types/types";

interface RecentBookingsTableProps {
  bookings: Booking[];
}

export function RecentBookingsTable({ bookings }: RecentBookingsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBookings = bookings.filter((booking) => {
    const term = searchTerm.toLowerCase();

    return (
      booking.guest.firstName.toLowerCase().includes(term) ||
      booking.guest.lastName.toLowerCase().includes(term) ||
      booking.unit.name.toLowerCase().includes(term)
    );
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>
              Latest guest bookings and reservations
            </CardDescription>
          </div>

          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search a recent booking..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-xs md:w-lg"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg overflow-hidden border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="font-semibold text-foreground">
                  Guest Name
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Property
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
                  Amount
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">
                    {booking.guest.firstName} {booking.guest.lastName}
                  </TableCell>
                  <TableCell>{booking.property.name}</TableCell>
                  <TableCell>{booking.unit.name}</TableCell>
                  <TableCell>
                    {new Date(booking.checkInDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(booking.checkOutDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>${booking.totalAmount}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <BookingViewDialog booking={booking}>
                        <Button variant="ghost" size="icon">
                          <Eye className="size-4" />
                        </Button>
                      </BookingViewDialog>
                      <BookingEditDialog booking={booking}>
                        <Button variant="ghost" size="icon">
                          <Edit className="size-4" />
                        </Button>
                      </BookingEditDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter>
        <Pagination />
      </CardFooter>
    </Card>
  );
}
