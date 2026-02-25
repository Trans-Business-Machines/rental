// components/Bookings.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Search, Loader2 } from "lucide-react";
import { Switch } from "./ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookingEditDialog } from "@/components/booking-edit-dialog";
import { useTableMode } from "@/hooks/useTableMode";
import { SearchNotFound } from "./SearchNotFound";
import { ItemsNotFound } from "./ItemsNotFound";
import { usePermissions } from "@/hooks/usePermissions";
import { ArchivedBookingsTable } from "./ArchivedBookings";
import { BookingListings } from "./BookingListings";
import { cn } from "@/lib/utils";
import type { Booking, PropertyNames } from "@/lib/types/types";

interface BookingFilters {
  search: string;
  status: string;
  propertyId: string;
}

interface BookingsProps {
  bookings: Booking[];
  properties: PropertyNames;
  totalPages: string | number;
  hasNext: boolean;
  hasPrev: boolean;
  currentPage: number;
  initialFilters: BookingFilters;
}

function Bookings({
  bookings,
  properties,
  hasNext,
  hasPrev,
  totalPages,
  currentPage,
  initialFilters,
}: BookingsProps) {
  const router = useRouter();

  // Separate transitions for apply and clear
  const [isApplyPending, startApplyTransition] = useTransition();
  const [isClearPending, startClearTransition] = useTransition();
  const isPending = isApplyPending || isClearPending;

  // Get table mode context from useTableMode Hook
  const { tableMode, setTableMode } = useTableMode();

  // Get the current session user role
  const { isSuperAdmin } = usePermissions();

  // Define state to control the Booking Edit Dialog Box
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Define state to toggle archived bookings
  const [showArchived, setShowArchived] = useState(false);

  // Define state to hold the booking to edit
  const [editBooking, setEditBooking] = useState<Booking | null>(null);

  // Local state for filter inputs (before Apply is clicked)
  const [filters, setFilters] = useState<BookingFilters>(initialFilters);

  // Check if there are any active filters in the URL
  const hasActiveFilters =
    initialFilters.search !== "" ||
    initialFilters.status !== "all" ||
    initialFilters.propertyId !== "all";

  /* ------------ URL Update Handlers ------------ */
  const applyFilters = () => {
    const params = new URLSearchParams();
    params.set("page", "1"); // Reset to page 1 when applying filters

    if (filters.search) {
      params.set("search", filters.search);
    }
    if (filters.status !== "all") {
      params.set("status", filters.status);
    }
    if (filters.propertyId !== "all") {
      params.set("propertyId", filters.propertyId);
    }

    startApplyTransition(() => {
      router.push(`/bookings?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    // Reset local state
    setFilters({
      search: "",
      status: "all",
      propertyId: "all",
    });

    startClearTransition(() => {
      router.push("/bookings?page=1");
    });
  };

  if (bookings.length === 0 && !hasActiveFilters) {
    return (
      <ItemsNotFound
        title="No bookings found!"
        icon={Calendar}
        message="Get started by creating your first booking."
      />
    );
  }

  return (
    <>
      {/* Search and Filters */}
      <article className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search bookings by guest or unit..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              disabled={isPending}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={filters.status}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, status: value }))
            }
            disabled={isPending}
          >
            <SelectTrigger className="w-full sm:w-40">
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

          {/* Property Filter */}
          <Select
            value={filters.propertyId}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, propertyId: value }))
            }
            disabled={isPending}
          >
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id.toString()}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filter Buttons and Toggles */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={applyFilters}
              disabled={isPending}
              className="cursor-pointer px-8"
            >
              {isApplyPending ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Applying...
                </>
              ) : (
                "Apply filters"
              )}
            </Button>
            <Button
              onClick={clearFilters}
              disabled={isPending}
              className="cursor-pointer px-8 bg-chart-5 hover:bg-red-600"
            >
              {isClearPending ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Clearing...
                </>
              ) : (
                "Clear filters"
              )}
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Switch
                checked={tableMode}
                disabled={showArchived || isPending}
                onCheckedChange={setTableMode}
                className="cursor-pointer"
              />
              <span>Table mode</span>
            </div>

            {isSuperAdmin && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Switch
                  checked={showArchived}
                  onCheckedChange={setShowArchived}
                  disabled={isPending}
                  className="cursor-pointer"
                />
                <span
                  className={cn(
                    showArchived ? "font-bold text-black" : "font-normal",
                  )}
                >
                  Show Archived
                </span>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Bookings Content */}
      <section className={isPending ? "opacity-50 pointer-events-none" : ""}>
        {showArchived ? (
          <ArchivedBookingsTable />
        ) : bookings.length === 0 && hasActiveFilters ? (
          <SearchNotFound
            title="No booking matches the search criteria."
            icon={Calendar}
          />
        ) : (
          <BookingListings
            currentPage={currentPage}
            filteredBookings={bookings}
            hasNext={hasNext}
            hasPrev={hasPrev}
            setEditBooking={setEditBooking}
            setIsDialogOpen={setIsDialogOpen}
            totalPages={totalPages}
          />
        )}
      </section>

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
