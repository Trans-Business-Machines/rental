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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Edit, Eye, Search, Calendar, Loader2 } from "lucide-react";
import { BookingEditDialog } from "@/components/booking-edit-dialog";
import { BookingViewDialog } from "./booking-view-dialog";
import { SearchNotFound } from "@/components/SearchNotFound";
import { ItemsNotFound } from "@/components/ItemsNotFound";
import { Footer } from "@/components/Footer";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { format } from "date-fns";
import { formatPrice } from "@/lib/utils";
import type { Booking } from "@/lib/types/types";

interface BookingFilters {
  search: string;
  status: string;
}

interface RecentBookingsTableProps {
  bookings: Booking[];
  totalPages: string | number;
  hasNext: boolean;
  hasPrev: boolean;
  currentPage: number;
  initialFilters: BookingFilters;
}

export function RecentBookingsTable({
  bookings,
  totalPages,
  hasNext,
  hasPrev,
  currentPage,
  initialFilters,
}: RecentBookingsTableProps) {
  const { searchValue, isSearching, handleSearchChange, handleStatusChange } =
    useDebouncedSearch({ tab: "bookings" });

  const hasActiveFilters =
    initialFilters.search !== "" || initialFilters.status !== "all";

  if (bookings.length === 0 && !hasActiveFilters) {
    return (
      <ItemsNotFound
        title="No recent bookings found!"
        message="Go to booking page to create your first booking."
        icon={Calendar}
      />
    );
  }

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

          <div className="flex flex-col sm:flex-row items-center gap-2">
            {/* Search Input */}
            <div className="relative  w-full md:w-64 lg:w-96">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by guest name, property or unit..."
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8 w-full"
              />
              {isSearching && (
                <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            {/* Status Filter */}
            <Select
              value={initialFilters.status}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="checked_in">Checked In</SelectItem>
                <SelectItem value="checked_out">Checked Out</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      {bookings.length === 0 && hasActiveFilters ? (
        <SearchNotFound
          title="No bookings match the search criteria."
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
                    Payment Code
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
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
                    <TableCell>{formatPrice(booking.totalAmount)}</TableCell>
                    <TableCell>{booking.paymentCode}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BookingViewDialog booking={booking}>
                          <Button variant="ghost" size="icon">
                            <Eye className="size-4" />
                          </Button>
                        </BookingViewDialog>

                        {["pending", "reserved"].includes(booking.status) && (
                          <BookingEditDialog booking={booking}>
                            <Button variant="ghost" size="icon">
                              <Edit className="size-4" />
                            </Button>
                          </BookingEditDialog>
                        )}
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
        <Footer
          currentPage={currentPage}
          totalPages={totalPages}
          hasNext={hasNext}
          hasPrev={hasPrev}
          paramName="page"
          preserveParams={["tab", "search", "status"]}
        />
      </CardFooter>
    </Card>
  );
}
