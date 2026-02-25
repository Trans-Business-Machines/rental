"use client";

import { useState, useTransition } from "react";
import { InventoryItemsCards } from "./InventoryItemsCards";
import { InventoryItemsTable } from "./InventoryItemsTable";
import { Switch } from "./ui/switch";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Package, Search, Loader } from "lucide-react";
import { useTableMode } from "@/hooks/useTableMode";
import { ItemsNotFound } from "./ItemsNotFound";
import { SearchNotFound } from "./SearchNotFound";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import type { InventoryItem } from "@/lib/types/types";

interface InventoryItemsFilters {
  search: string;
  status: string;
  category: string;
}

interface InventoryItemsProps {
  items: InventoryItem[];
  totalPages: string | number;
  hasNext: boolean;
  hasPrev: boolean;
  currentPage: number;
  initialFilters: InventoryItemsFilters;
}

function InventoryItems({
  items,
  hasNext,
  hasPrev,
  totalPages,
  currentPage,
  initialFilters,
}: InventoryItemsProps) {
  // Get table mode context from useTableMode Hook
  const { tableMode, setTableMode } = useTableMode();

  // Get the router object
  const router = useRouter();

  const [isApplyPending, startApplyTransition] = useTransition();
  const [isClearPending, startClearTransition] = useTransition();

  // Combined pending state for disabling inputs
  const isPending = isApplyPending || isClearPending;

  // Local state for filter inputs (before Apply is clicked)
  const [filters, setFilters] = useState<InventoryItemsFilters>(initialFilters);

  // Check if there are any active filters in the URL
  const hasActiveFilters =
    initialFilters.search !== "" ||
    initialFilters.status !== "all" ||
    initialFilters.category !== "all";

  /*  -------------- URL update handlers -------------- */
  const applyFilters = () => {
    const params = new URLSearchParams();
    params.set("tab", "inventory");
    params.set("page", "1");

    if (filters.search) {
      params.set("search", filters.search);
    }
    if (filters.status !== "all") {
      params.set("status", filters.status);
    }
    if (filters.category !== "all") {
      params.set("category", filters.category);
    }

    startApplyTransition(() => {
      router.push(`/inventory?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    // Reset local state
    setFilters({
      search: "",
      status: "all",
      category: "all",
    });

    // Update URL
    startClearTransition(() => {
      router.push("/inventory?tab=inventory&page=1");
    });
  };

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
      <header className="flex flex-col  gap-5 mb-4 text-muted-foreground text-sm py-1">
        <div className="flex flex-col gap-4 md:flex-row md:gap-2 pr-5">
          {/* Search Bar */}
          <div className="relative flex-1 md:flex-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search inventory by name . . ."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="pl-10 text-black w-full"
              disabled={isPending}
            />
          </div>

          {/* Select Filters */}

          <Select
            value={filters.status}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, status: value }))
            }
            disabled={isPending}
          >
            <SelectTrigger className="w-full md:flex-1 text-black/70">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="discontinued">Discontinued</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.category}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, category: value }))
            }
            disabled={isPending}
          >
            <SelectTrigger className="w-full md:flex-1 text-black/70">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Furniture">Furniture</SelectItem>
              <SelectItem value="Electronics">Electronics</SelectItem>
              <SelectItem value="Cutlery">Cutlery</SelectItem>
              <SelectItem value="Bathroom">Bathroom</SelectItem>
              <SelectItem value="Lighting">Lighting</SelectItem>
              <SelectItem value="Kitchen Accessories">
                Kitchen Accessories
              </SelectItem>
              <SelectItem value="Bedroom Accessories">
                Bedroom Accessories
              </SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:gap-0 md:justify-between">
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

          <div className="flex items-center gap-1">
            <Switch
              checked={tableMode}
              onCheckedChange={setTableMode}
              className="cursor-pointer"
              aria-label="table mode switch"
            />
            <span>Table mode</span>
          </div>
        </div>
      </header>

      {items.length === 0 && !hasActiveFilters ? (
        <SearchNotFound
          title="No Item matches the search criteria"
          icon={Package}
        />
      ) : tableMode ? (
        <InventoryItemsTable items={items} />
      ) : (
        <InventoryItemsCards items={items} />
      )}

      <Footer
        currentPage={currentPage}
        hasNext={hasNext}
        hasPrev={hasPrev}
        totalPages={totalPages}
        paramName="page"
        preserveParams={["tab", "search", "status", "category"]}
      />
    </section>
  );
}

export { InventoryItems };
