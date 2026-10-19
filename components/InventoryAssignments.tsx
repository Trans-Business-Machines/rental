"use client";

import { useEffect, useState } from "react";
import { InventoryAssignmentsList } from "@/components/InventoryAssignmentsList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfiniteScrollSentinel } from "@/components/InfiniteScrollSentinel";
import { useSearchParams } from "next/navigation";
import { useAssignmentsInfinite } from "@/hooks/useInventory";
import type {
  AssignmentFilter,
  getInventoryAssignments,
} from "@/lib/actions/inventory";
import type { PropertyNames } from "@/lib/types/types";

export interface InventoryAssignmentsFilters {
  search: string;
  propertyId: string;
  unitId: string;
  status: AssignmentFilter;
}

// Opens on what's out in units right now; history is one filter away.
const DEFAULT_FILTERS: InventoryAssignmentsFilters = {
  search: "",
  propertyId: "all",
  unitId: "all",
  status: "outstanding",
};

/** The URL is the source of truth for applied filters, so they're shareable. */
function filtersFromParams(
  params: URLSearchParams,
): InventoryAssignmentsFilters {
  return {
    search: params.get("search") || DEFAULT_FILTERS.search,
    propertyId: params.get("propertyId") || DEFAULT_FILTERS.propertyId,
    unitId: params.get("unitId") || DEFAULT_FILTERS.unitId,
    // Not "status": the items tab owns that param on the same page.
    status:
      (params.get("assignmentStatus") as AssignmentFilter) ||
      DEFAULT_FILTERS.status,
  };
}

interface InventoryAssignmentsProps {
  properties: PropertyNames;
  /** First batch the server rendered for `initialFilters`. */
  initialBatch: Awaited<ReturnType<typeof getInventoryAssignments>> | null;
  initialFilters: InventoryAssignmentsFilters;
}

function InventoryAssignments({
  properties,
  initialBatch,
  initialFilters,
}: InventoryAssignmentsProps) {
  const searchParams = useSearchParams();
  const applied = filtersFromParams(searchParams);
  const appliedKey = JSON.stringify(applied);

  const {
    data,
    isPending: isLoading,
    isError,
    isPlaceholderData,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useAssignmentsInfinite(
    applied,
    // Only valid for the filters the server rendered with.
    appliedKey === JSON.stringify(initialFilters) ? initialBatch : null,
  );

  const assignments = data?.pages.flatMap((batch) => batch.assignments) ?? [];
  const total = data?.pages[0]?.total ?? null;

  // Filter inputs before Apply is clicked
  const [filters, setFilters] = useState<InventoryAssignmentsFilters>(applied);
  const [lastAction, setLastAction] = useState<"apply" | "clear">("apply");

  // Back and forward change the URL, so pull the inputs along with it.
  useEffect(() => {
    setFilters(JSON.parse(appliedKey));
  }, [appliedKey]);

  const isPending = isPlaceholderData;
  const isApplyPending = isPending && lastAction === "apply";
  const isClearPending = isPending && lastAction === "clear";

  const hasActiveFilters = appliedKey !== JSON.stringify(DEFAULT_FILTERS);

  const propertyUnits = properties.find(
    (p) => p.id.toString() === filters.propertyId,
  )?.units;

  // ----------- URL handlers -----------
  // pushState updates useSearchParams without a server round trip; the
  // query refetches because its key follows the URL.
  const pushParams = (params: URLSearchParams) => {
    window.history.pushState(null, "", `?${params.toString()}`);
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    params.set("tab", "assignments");

    if (filters.search) {
      params.set("search", filters.search);
    }
    if (filters.status !== DEFAULT_FILTERS.status) {
      params.set("assignmentStatus", filters.status);
    }
    if (filters.propertyId !== "all") {
      params.set("propertyId", filters.propertyId);
    }

    if (filters.unitId !== "all") {
      params.set("unitId", filters.unitId);
    }

    setLastAction("apply");
    pushParams(params);
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setLastAction("clear");
    pushParams(new URLSearchParams({ tab: "assignments" }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader className="size-4 animate-spin" />
        Loading assignments
      </div>
    );
  }

  if (isError && !data) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-sm text-muted-foreground">
        Couldn&apos;t load assignments.
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={() => refetch()}
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <section>
      {/* Assignment Filters */}
      <header className="flex flex-col  gap-4 flex-1 mt-2 mb-4">
        <article className="flex flex-col md:flex-row gap-4 md:gap-2 lg:pr-8">
          {/* ItemName filter */}
          <div className="relative md:flex-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search assignments by item name . . ."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="md:flex-1">
            <Select
              value={filters.status}
              onValueChange={(value: AssignmentFilter) =>
                setFilters((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="outstanding">Active (in units)</SelectItem>
                <SelectItem value="needs_attention">Needs attention</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
                <SelectItem value="written_off">Written off</SelectItem>
                <SelectItem value="issued">Consumed</SelectItem>
                <SelectItem value="all">All Status</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Property Filter */}
          <div className="md:flex-1">
            <Select
              defaultValue="all"
              value={filters.propertyId}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  propertyId: value,
                  unitId: "all",
                }))
              }
            >
              <SelectTrigger className="w-full">
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

          {/* Unit Filter */}
          <div className="md:flex-1">
            <Select
              disabled={filters.propertyId === "all"}
              value={filters.unitId}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, unitId: value }))
              }
            >
              <SelectTrigger className="w-full text-black">
                <SelectValue placeholder="All Units" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Units</SelectItem>
                {propertyUnits?.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id.toString()}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </article>

        <div className="flex items-center gap-2">
          <Button
            onClick={applyFilters}
            disabled={isPending}
            className="cursor-pointer px-12"
          >
            {isApplyPending ? (
              <span className="flex items-center gap-2">
                <Loader className="size-4  animate-spin" />
                Searching
              </span>
            ) : (
              "Apply filters"
            )}
          </Button>
          <Button
            onClick={clearFilters}
            disabled={isPending}
            className="cursor-pointer px-12 bg-chart-5 hover:bg-red-600"
          >
            {isClearPending ? (
              <span className="flex items-center gap-2">
                <Loader className="size-4  animate-spin" />
                Clearing
              </span>
            ) : (
              "Clear filters"
            )}
          </Button>
        </div>
      </header>

      {/* Assignments List */}
      <InventoryAssignmentsList
        assignments={assignments}
        totalAssignments={total ?? assignments.length}
        emptyTitle={
          hasActiveFilters
            ? undefined
            : "Nothing is out in units right now. Set the status to All Status to see past assignments."
        }
      />

      {assignments.length > 0 && (
        <InfiniteScrollSentinel
          loaded={assignments.length}
          total={total}
          noun="assignments"
          // Placeholder rows belong to the previous filters.
          hasNextPage={hasNextPage && !isPlaceholderData}
          isFetchingNextPage={isFetchingNextPage}
          isError={isError}
          fetchNextPage={fetchNextPage}
        />
      )}
    </section>
  );
}

export { InventoryAssignments };
