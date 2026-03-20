"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GuestDialog } from "@/components/GuestDialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGuests, useGuestStats } from "@/hooks/useGuests";
import {
  Clock,
  Search,
  UserCheck,
  Users,
  ClipboardPaste,
  Loader2,
} from "lucide-react";
import { StatCards, StatCardsProps } from "@/components/StatCards";
import { useTableMode } from "@/hooks/useTableMode";
import { ItemsNotFound } from "@/components/ItemsNotFound";
import { SearchNotFound } from "@/components/SearchNotFound";
import { cn } from "@/lib/utils";
import { ArchivedGuestsTable } from "@/components/ArchivedGuestsTable";
import { usePermissions } from "@/hooks/usePermissions";
import GuestListings from "@/components/GuestListings";
import Link from "next/link";

interface GuestFilters {
  search: string;
  status: string;
}

export default function GuestsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get URL params
  const page = Number(searchParams.get("page")) || 1;
  const urlSearch = searchParams.get("search") || "";
  const urlStatus = searchParams.get("status") || "all";

  // Separate transitions for apply and clear
  const [isApplyPending, startApplyTransition] = useTransition();
  const [isClearPending, startClearTransition] = useTransition();
  const isPending = isApplyPending || isClearPending;

  // Local state for filter inputs (before Apply is clicked)
  const [filters, setFilters] = useState<GuestFilters>({
    search: urlSearch,
    status: urlStatus,
  });

  // Sync local filters with URL on mount and URL changes
  useEffect(() => {
    setFilters({
      search: urlSearch,
      status: urlStatus,
    });
  }, [urlSearch, urlStatus]);

  // Get table mode context from useTableMode Hook
  const { tableMode, setTableMode } = useTableMode();

  // Define the state for toggling archived
  const [showArchived, setShowArchived] = useState(false);

  // Get role of the current session user
  const { isSuperAdmin, isUser, isAdmin } = usePermissions();

  // Get guests with URL filters
  const {
    data: guestsResponse,
    isLoading,
    error,
  } = useGuests({ page, search: urlSearch, status: urlStatus });

  // Get guest stats
  const { guestStats } = useGuestStats();

  const isAdminOrUser = isSuperAdmin || isAdmin || isUser;

  // Check if there are any active filters in the URL
  const hasActiveFilters = urlSearch !== "" || urlStatus !== "all";

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

    startApplyTransition(() => {
      router.push(`/guests?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    // Reset local state
    setFilters({
      search: "",
      status: "all",
    });

    startClearTransition(() => {
      router.push("/guests?page=1");
    });
  };

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
          {isAdminOrUser && <GuestDialog />}
        </div>
        <div className="text-center py-8">
          <p className="text-destructive">
            Error loading guests. Please try again.
          </p>
        </div>
      </div>
    );
  }

  if (!isLoading && guestsResponse?.guests.length === 0 && !hasActiveFilters) {
    return (
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-normal text-foreground">
              Guest Management
            </h1>
            <p className="text-muted-foreground">Manage guest registrations.</p>
          </div>
          {isAdminOrUser && <GuestDialog />}
        </header>

        <StatCards stats={stats} />

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
      <header className="flex flex-col gap-4 md:flex-row md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-normal text-foreground">
            Guest Management
          </h1>
          <p className="text-muted-foreground">Manage guest registrations.</p>
        </div>

        {isAdminOrUser && (
          <div className="flex gap-3">
            <GuestDialog />
            <Button asChild>
              <Link href="/checkout" className="flex items-center gap-3">
                <ClipboardPaste className="size-4 text-white" />
                <span className="text-white">Checkout guest</span>
              </Link>
            </Button>
          </div>
        )}
      </header>

      {/* Statistics Cards */}
      <StatCards stats={stats} />

      {/* Search and Filters */}
      <article className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search guests by name, email, or phone..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              disabled={isPending || isLoading}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={filters.status}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, status: value }))
            }
            disabled={isPending || isLoading}
          >
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              {/*  <SelectItem value="blacklisted">Blacklisted</SelectItem> */}
            </SelectContent>
          </Select>
        </div>

        {/* Filter Buttons and Toggles */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={applyFilters}
              disabled={isPending || isLoading}
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
              disabled={isPending || isLoading}
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
            <div className="flex items-center gap-2">
              <Switch
                checked={tableMode}
                disabled={showArchived || isPending || isLoading}
                onCheckedChange={setTableMode}
                className="cursor-pointer"
              />
              <span className="text-muted-foreground text-sm">Table mode</span>
            </div>

            {isSuperAdmin && (
              <div className="flex items-center gap-2">
                <Switch
                  checked={showArchived}
                  onCheckedChange={setShowArchived}
                  disabled={isPending || isLoading}
                  className="cursor-pointer"
                />
                <span
                  className={cn(
                    "text-muted-foreground text-sm",
                    showArchived && "font-bold text-black",
                  )}
                >
                  Show Archived
                </span>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading guests...</p>
        </div>
      )}

      {/* Content */}
      {!isLoading && (
        <div className={isPending ? "opacity-50 pointer-events-none" : ""}>
          {showArchived ? (
            <ArchivedGuestsTable />
          ) : guestsResponse?.guests.length === 0 && hasActiveFilters ? (
            <SearchNotFound
              title="No guests match the search criteria."
              icon={Users}
            />
          ) : (
            <GuestListings
              guests={guestsResponse?.guests ?? []}
              tableMode={tableMode}
              currentPage={page}
              hasNext={guestsResponse?.hasNext || false}
              hasPrev={guestsResponse?.hasPrev || false}
              totalPages={guestsResponse?.totalPages || 1}
            />
          )}
        </div>
      )}
    </section>
  );
}
