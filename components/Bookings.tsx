"use client";

import { useState } from "react";
import { BookingCards } from "./BookingCards";
import { BookingsTable } from "./BookingsTable";
import { Calendar } from "lucide-react";
import { Switch } from "./ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookingEditDialog } from "@/app/(dashboard)/dashboard/_components/booking-edit-dialog";
import { useTableMode } from "@/hooks/useTableMode";
import { Search } from "lucide-react";
import { useFilter } from "@/hooks/useFilter";
import { SearchNotFound } from "./SearchNotFound";
import { ItemsNotFound } from "./ItemsNotFound";
import { useSearchParams, useRouter } from "next/navigation";
import Pagination from "./Pagination";
import type { Booking, PropertyNames } from "@/lib/types/types";

interface BookingsProps {
  bookings: Booking[];
  properties: PropertyNames;
  totalPages: string | number;
  hasNext: boolean;
  hasPrev: boolean;
}

function Bookings({
  bookings,
  properties,
  hasNext,
  hasPrev,
  totalPages,
}: BookingsProps) {
  // Get table mode context from useTableMode Hook
  const { tableMode, setTableMode } = useTableMode();

  // Define state to control the Booking Edit Dialog Box
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Define state to hold the booking to edit
  const [editBooking, setEditBooking] = useState<Booking | null>(null);

  // Define state to hold the search term
  const [searchTerm, setSearchTerm] = useState("");

  // Get searchParams and the router objects
  const searchParams = useSearchParams();
  const router = useRouter();

  // State to manage select filters
  const [selectFilters, setSelectFilter] = useState({
    bookingStatus: "all",
    propertyName: "all",
  });

  // Filter bookings based of the search term and select filters if applicable
  const filteredBookings = useFilter<Booking>({
    items: bookings,
    searchTerm,
    searchFields: ["guest.firstName", "guest.lastName", "unit.name"],
    selectFilters: {
      status: selectFilters.bookingStatus,
      "property.name": selectFilters.propertyName,
    },
  });

  // Get the current page from URL search params
  const currentPage = searchParams.get("page") || 1;

  if (bookings.length === 0 || !bookings) {
    return (
      <ItemsNotFound
        title="No bookings found!"
        icon={Calendar}
        message="Get started by creating your first booking."
      />
    );
  }

  // define the handle page change function
  const handlePageChange = (page: number) => {
    // create a new params object using the exisitng searchParams
    // this helps to reserve other existing params
    const params = new URLSearchParams(searchParams);

    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <>
      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search bookings by guest or unit . . ."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          defaultValue="all"
          value={selectFilters.bookingStatus}
          onValueChange={(value) => {
            setSelectFilter((prev) => ({ ...prev, bookingStatus: value }));
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="checked-in">Checked In</SelectItem>
            <SelectItem value="checked-out">Checked Out</SelectItem>
          </SelectContent>
        </Select>

        <Select
          defaultValue="all"
          value={selectFilters.propertyName}
          onValueChange={(value) => {
            setSelectFilter((prev) => ({ ...prev, propertyName: value }));
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            {properties.map((property) => (
              <SelectItem key={property.id} value={property.name}>
                {property.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2 text-muted-foreground/90 text-sm">
          <Switch
            checked={tableMode}
            onCheckedChange={setTableMode}
            className="cursor-pointer"
          />
          <span>Table mode</span>
        </div>

        {filteredBookings.length === 0 ? (
          <SearchNotFound
            title="No booking matches the search criteria."
            icon={Calendar}
          />
        ) : tableMode ? (
          <BookingsTable
            bookings={filteredBookings}
            setEditBooking={setEditBooking}
            setIsDialogOpen={setIsDialogOpen}
          />
        ) : (
          <BookingCards
            bookings={filteredBookings}
            setEditBooking={setEditBooking}
            setIsDialogOpen={setIsDialogOpen}
          />
        )}
      </div>

      {/* Pagination */}
      <footer className="flex items-center justify-between pt-4 w-full">
        <Pagination
          currentPage={currentPage}
          handlePageChange={handlePageChange}
          totalPages={totalPages}
          hasNext={hasNext}
          hasPrev={hasPrev}
        />
      </footer>

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
