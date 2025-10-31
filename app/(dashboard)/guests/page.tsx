"use client";

import { GuestDialog } from "@/components/GuestDialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useGuests, useGuestStats } from "@/hooks/useGuests";
import { Clock, Flag, Search, UserCheck, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { StatCards, StatCardsProps } from "@/components/StatCards";
import { useTableMode } from "@/hooks/useTableMode";
import GuestListings from "@/components/GuestListings";
import Pagination from "@/components/Pagination";

export default function GuestsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(
    () => searchParams.get("search") || ""
  );

  // Get table mode context from useTableMode Hook
  const { tableMode, setTableMode } = useTableMode();
  const initializedRef = useRef(false);

  // Get search parameters from URL
  const search = searchParams.get("search") || "";
  const nationality = searchParams.get("nationality") || "";
  const verification = searchParams.get("verification") || "";

  // Get guests and guests stats
  const { guestStats } = useGuestStats();
  const {
    data: guests = [],
    isLoading,
    error,
  } = useGuests(search, nationality, verification);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "" || value === "all") {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      return params.toString();
    },
    [searchParams]
  );

  // Debounced search handler
  const debouncedSearch = useDebouncedCallback((term: string) => {
    const queryString = createQueryString("search", term);
    router.push(`/guests?${queryString}`);
  }, 300);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    debouncedSearch(value);
  };

  // Initialize search value from URL only once
  if (!initializedRef.current && search !== "") {
    setSearchValue(search);
    initializedRef.current = true;
  }

  const stats: StatCardsProps[] = [
    {
      title: "Total Guests",
      value: guestStats?.total || 0,
      icon: Users,
      color: "blue",
    },
    {
      title: "Verified Guests",
      value: guestStats?.verified || 0,
      icon: UserCheck,
      color: "green",
    },
    {
      title: "Pending",
      value: guestStats?.pending || 0,
      icon: Clock,
      color: "orange",
    },
    {
      title: "Blacklisted",
      value: guestStats?.blacklisted || 0,
      icon: Flag,
      color: "red",
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-normal text-foreground">
              Guest Management
            </h1>
            <p className="text-muted-foreground">
              Manage guest registrations, bookings, and check-ins
            </p>
          </div>
          <GuestDialog />
        </div>
        <div className="text-center py-8">
          <p className="text-destructive">
            Error loading guests. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-normal text-foreground">
            Guest Management
          </h1>
          <p className="text-muted-foreground">Manage guest registrations.</p>
        </div>

        <GuestDialog />
      </header>

      {/* Statistics Cards */}
      <StatCards stats={stats} />

      {/* Search and Filters */}
      <div className="flex items-center space-x-4 ">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search guests..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
            disabled={isLoading}
            autoFocus
          />
        </div>
        <div className="self-center flex items-center gap-2">
          <Switch
            checked={tableMode}
            onCheckedChange={setTableMode}
            className="cursor-pointer"
          />
          <span className="text-muted-foreground text-sm">Table mode</span>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading guests...</p>
        </div>
      )}

      {/* Guests Grid */}
      {!isLoading && <GuestListings guests={guests} tableMode={tableMode} />}

      {!isLoading && guests.length === 0 && (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No guests found</h3>
          <p className="text-muted-foreground">
            {search
              ? "Try adjusting your search criteria"
              : "Get started by adding your first guest"}
          </p>
        </div>
      )}

      {/* Pagination */}
      <footer className="flex items-center justify-between pt-4 w-full">
        <Pagination />
      </footer>
    </section>
  );
}
