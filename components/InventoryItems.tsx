"use client";

import { useEffect, useState } from "react";
import { InventoryItemsTable } from "./InventoryItemsTable";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Package, Search, Loader } from "lucide-react";
import { ItemsNotFound } from "./ItemsNotFound";
import { SearchNotFound } from "./SearchNotFound";
import { InfiniteScrollSentinel } from "@/components/InfiniteScrollSentinel";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { useInventoryItemsInfinite } from "@/hooks/useInventory";
import type { getInventoryItemsBatch } from "@/lib/actions/inventory";
import type { PropertyNames } from "@/lib/types/types";
import { CATEGORY_DISPLAY, INVENTORY_CATEGORIES } from "@/lib/inventory-categories";

/** Built from the enum config, so a new category appears here automatically. */
const CATEGORY_OPTIONS = INVENTORY_CATEGORIES.map((value) => ({
  value,
  label: CATEGORY_DISPLAY[value].label,
})).sort((a, b) => a.label.localeCompare(b.label));

export interface InventoryItemsFilters {
  search: string;
  status: string;
  category: string;
  propertyId: string;
}

const DEFAULT_FILTERS: InventoryItemsFilters = {
  search: "",
  status: "all",
  category: "all",
  propertyId: "all",
};

/** The URL is the source of truth for applied filters, so they're shareable. */
function filtersFromParams(params: URLSearchParams): InventoryItemsFilters {
  return {
    search: params.get("search") || DEFAULT_FILTERS.search,
    status: params.get("status") || DEFAULT_FILTERS.status,
    category: params.get("category") || DEFAULT_FILTERS.category,
    propertyId: params.get("propertyId") || DEFAULT_FILTERS.propertyId,
  };
}

interface InventoryItemsProps {
  properties: PropertyNames;
  /** First batch the server rendered for `initialFilters`. */
  initialBatch: Awaited<ReturnType<typeof getInventoryItemsBatch>> | null;
  initialFilters: InventoryItemsFilters;
}

function InventoryItems({
  properties,
  initialBatch,
  initialFilters,
}: InventoryItemsProps) {
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
  } = useInventoryItemsInfinite(
    {
      search: applied.search,
      status: applied.status,
      category: applied.category,
      propertyId:
        applied.propertyId !== "all" ? Number(applied.propertyId) : undefined,
    },
    // Only valid for the filters the server rendered with.
    appliedKey === JSON.stringify(initialFilters) ? initialBatch : null,
  );

  const items = data?.pages.flatMap((batch) => batch.items) ?? [];
  const total = data?.pages[0]?.total ?? null;

  // Filter inputs before Apply is clicked
  const [filters, setFilters] = useState<InventoryItemsFilters>(applied);
  const [lastAction, setLastAction] = useState<"apply" | "clear">("apply");

  // Back and forward change the URL, so pull the inputs along with it.
  useEffect(() => {
    setFilters(JSON.parse(appliedKey));
  }, [appliedKey]);

  const isPending = isPlaceholderData;
  const isApplyPending = isPending && lastAction === "apply";
  const isClearPending = isPending && lastAction === "clear";

  const hasActiveFilters = appliedKey !== JSON.stringify(DEFAULT_FILTERS);

  /*  -------------- URL update handlers -------------- */
  // pushState updates useSearchParams without a server round trip; the
  // query refetches because its key follows the URL.
  const pushParams = (params: URLSearchParams) => {
    window.history.pushState(null, "", `?${params.toString()}`);
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    params.set("tab", "inventory");

    if (filters.search) {
      params.set("search", filters.search);
    }
    if (filters.status !== "all") {
      params.set("status", filters.status);
    }
    if (filters.category !== "all") {
      params.set("category", filters.category);
    }
    if (filters.propertyId !== "all") {
      params.set("propertyId", filters.propertyId);
    }

    setLastAction("apply");
    pushParams(params);
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setLastAction("clear");
    pushParams(new URLSearchParams({ tab: "inventory" }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader className="size-4 animate-spin" />
        Loading inventory
      </div>
    );
  }

  if (isError && !data) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-sm text-muted-foreground">
        Couldn&apos;t load inventory items.
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

  if (items.length === 0 && !hasActiveFilters) {
    return (
      <ItemsNotFound
        title="No inventory items found!"
        message="Get started by adding your first inventory item."
        icon={Package}
      />
    );
  }

  return (
    <section>
      <header className="flex flex-1 flex-col gap-4 mt-2 mb-4">
        <article className="flex flex-col gap-4 md:flex-row md:gap-2 lg:pr-8">
          {/* Search Bar */}
          <div className="relative md:flex-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              placeholder="Search inventory by name . . ."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="pl-10"
            />
          </div>

          {/* Property: inventory is property scoped, so each store filters separately */}
          <div className="md:flex-1">
            <Select
              value={filters.propertyId}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, propertyId: value }))
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

          {/* Category Filter */}
          <div className="md:flex-1">
            <Select
              value={filters.category}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, category: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORY_OPTIONS.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="md:flex-1">
            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="discontinued">Discontinued</SelectItem>
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
                <Loader className="size-4 animate-spin" />
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
                <Loader className="size-4 animate-spin" />
                Clearing
              </span>
            ) : (
              "Clear filters"
            )}
          </Button>
        </div>
      </header>

      {/*
        This branch was previously unreachable — it duplicated the early
        return's condition, so a search with no matches rendered an empty
        table instead of the not-found card.
      */}
      {items.length === 0 && hasActiveFilters ? (
        <SearchNotFound
          title="No item matches the search criteria"
          icon={Package}
        />
      ) : (
        <>
          <InventoryItemsTable items={items} />
          <InfiniteScrollSentinel
            loaded={items.length}
            total={total}
            noun="items"
            // Placeholder rows belong to the previous filters.
            hasNextPage={hasNextPage && !isPlaceholderData}
            isFetchingNextPage={isFetchingNextPage}
            isError={isError}
            fetchNextPage={fetchNextPage}
          />
        </>
      )}
    </section>
  );
}

export { InventoryItems };