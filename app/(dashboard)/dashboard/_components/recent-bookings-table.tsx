"use client";

import { useState } from "react";
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
import { Edit, Eye, Search, Calendar } from "lucide-react";
import { BookingEditDialog } from "@/components/booking-edit-dialog";
import { BookingViewDialog } from "./booking-view-dialog";
import { useFilter } from "@/hooks/useFilter";
import { SearchNotFound } from "@/components/SearchNotFound";
import { ItemsNotFound } from "@/components/ItemsNotFound";
import Pagination from "@/components/Pagination";
import { useSearchParams, useRouter } from "next/navigation";
import type { Booking } from "@/lib/types/types";

interface RecentBookingsTableProps {
  bookings: Booking[];
  totalPages: string | number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function RecentBookingsTable({
  bookings,
  totalPages,
  hasNext,
  hasPrev,
}: RecentBookingsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  const filteredBookings = useFilter<Booking>({
    items: bookings,
    searchTerm,
    searchFields: ["guest.firstName", "guest.lastName", "unit.name"],
  });

  if (!bookings || bookings.length === 0) {
    <ItemsNotFound
      title="No recent booking found!"
      message="Go to booking page to create your first booking."
      icon={Calendar}
    />;
  }

  // Get the current page from URL search params
  const currentPage = searchParams.get("recentBookingsPage") || 1;

  const handlePageChange = (page: number) => {
    // create a new params object using the exisitng searchParams
    // this helps to reserve other existing params
    const params = new URLSearchParams(searchParams);

    params.set("recentBookingsPage", page.toString());
    router.push(`?${params.toString()}`);
  };

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
      {filteredBookings.length === 0 ? (
        <SearchNotFound
          title="No booking matches the search criteria."
          icon={Calendar}
        />
      ) : (
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
      )}
      <CardFooter>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
          hasNext={hasNext}
          hasPrev={hasPrev}
        />
      </CardFooter>
    </Card>
  );
}
