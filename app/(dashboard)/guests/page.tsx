"use client";

import { useState } from "react";
import { GuestDialog } from "@/components/GuestDialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useGuests, useGuestStats } from "@/hooks/useGuests";
import {
  Clock,
  Flag,
  Search,
  UserCheck,
  Users,
  ClipboardPaste,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCards, StatCardsProps } from "@/components/StatCards";
import { useTableMode } from "@/hooks/useTableMode";
import { useFilter } from "@/hooks/useFilter";
import { ItemsNotFound } from "@/components/ItemsNotFound";
import { useSearchParams, useRouter } from "next/navigation";
import GuestListings from "@/components/GuestListings";
import Pagination from "@/components/Pagination";
import Link from "next/link";
import type { Guest } from "@/lib/types/types";

export default function GuestsPage() {
  // Define the search term
  const [searchTerm, setSearchTerm] = useState("");

  // Get table mode context from useTableMode Hook
  const { tableMode, setTableMode } = useTableMode();

  // Get URL search params and router object
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get guests and guests stats
  const { guestStats } = useGuestStats();

  const currentPage = Number(searchParams.get("page")) || 1;

  const {
    data: guestsResponse,
    isLoading,
    error,
  } = useGuests(Number(currentPage));

  console.log(guestsResponse?.guests);

  const filteredGuests = useFilter<Guest>({
    items: guestsResponse?.guests ?? [],
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

  if (!isLoading && guestsResponse?.guests.length === 0) {
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

  // function handle page change
  const handlePageChange = (page: number) => {
    // create a new params object using the exisitng searchParams
    // this helps to reserve other existing params
    const params = new URLSearchParams(searchParams);

    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-normal text-foreground">
            Guest Management
          </h1>
          <p className="text-muted-foreground">Manage guest registrations.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 items center">
          <GuestDialog />
          <Button asChild>
            <Link href="/checkout" className="flex items-center gap-3">
              <ClipboardPaste className="size-4 text-white" />
              <span className="text-white">Checkout guest</span>
            </Link>
          </Button>
        </div>
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
      {isLoading && !guestsResponse && (
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
        <Pagination
          currentPage={currentPage}
          handlePageChange={handlePageChange}
          hasNext={guestsResponse?.hasNext || false}
          hasPrev={guestsResponse?.hasPrev || false}
          totalPages={guestsResponse?.totalPages || 1}
        />
      </footer>
    </section>
  );
}
