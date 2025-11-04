"use client";

import { GuestDialog } from "@/components/GuestDialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useGuests, useGuestStats } from "@/hooks/useGuests";
import { Clock, Flag, Search, UserCheck, Users } from "lucide-react";
import { useState } from "react";
import { StatCards, StatCardsProps } from "@/components/StatCards";
import { useTableMode } from "@/hooks/useTableMode";
import { useFilter } from "@/hooks/useFilter";
import { ItemsNotFound } from "@/components/ItemsNotFound";
import GuestListings from "@/components/GuestListings";
import Pagination from "@/components/Pagination";
import type { Guest } from "@/lib/types/types";

export default function GuestsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Get table mode context from useTableMode Hook
  const { tableMode, setTableMode } = useTableMode();

  // Get guests and guests stats
  const { guestStats } = useGuestStats();
  const { data: guests = [], isLoading, error } = useGuests();

  const filteredGuests = useFilter<Guest>({
    items: guests,
    searchTerm,
    searchFields: ["firstName", "lastName"],
  });

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

  if (!isLoading && guests.length === 0) {
    return (
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-normal text-foreground">
              Guest Management
            </h1>
            <p className="text-muted-foreground">Manage guest registrations.</p>
          </div>

          <GuestDialog />
        </header>
        <ItemsNotFound
          title="No guests found!"
          message="Get Started by creating your first guest."
          icon={Users}
        />
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
      {!isLoading && (
        <GuestListings guests={filteredGuests} tableMode={tableMode} />
      )}

      {/* Pagination */}
      <footer className="flex items-center justify-between pt-4 w-full">
        <Pagination />
      </footer>
    </section>
  );
}
