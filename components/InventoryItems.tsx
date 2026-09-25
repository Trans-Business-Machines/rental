"use client";

import { useState, useTransition } from "react";
import { InventoryItemsTable } from "./InventoryItemsTable";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Package, Search, Loader } from "lucide-react";
import { ItemsNotFound } from "./ItemsNotFound";
import { SearchNotFound } from "./SearchNotFound";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import type { InventoryItem, PropertyNames } from "@/lib/types/types";

/**
 * Category is a fixed enum now, so the options live here rather than
 * being derived from whatever strings happen to be in the database.
 */
const CATEGORY_OPTIONS = [
  { value: "electronics", label: "Electronics" },
  { value: "furniture", label: "Furniture" },
  { value: "bedroom", label: "Bedroom" },
  { value: "cutlery", label: "Cutlery" },
  { value: "linens", label: "Linens" },
  { value: "kitchen_consumables", label: "Kitchen consumables" },
  { value: "laundry", label: "Laundry" },
] as const;

interface InventoryItemsFilters {
  search: string;
  status: string;
  category: string;
  propertyId: string;
  lowStock: boolean;
}

interface InventoryItemsProps {
  items: InventoryItem[];
  properties: PropertyNames;
  totalPages: string | number;
  hasNext: boolean;
  hasPrev: boolean;
  currentPage: number;
  initialFilters: InventoryItemsFilters;
}

function InventoryItems({
  items,
  properties,
  hasNext,
  hasPrev,
  totalPages,
  currentPage,
  initialFilters,
}: InventoryItemsProps) {
  const router = useRouter();

  const [isApplyPending, startApplyTransition] = useTransition();
  const [isClearPending, startClearTransition] = useTransition();

  const isPending = isApplyPending || isClearPending;

  const [filters, setFilters] = useState<InventoryItemsFilters>(initialFilters);

  const hasActiveFilters =
    initialFilters.search !== "" ||
    initialFilters.status !== "all" ||
    initialFilters.category !== "all" ||
    initialFilters.propertyId !== "all" ||
    initialFilters.lowStock;

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
    if (filters.propertyId !== "all") {
      params.set("propertyId", filters.propertyId);
    }
    if (filters.lowStock) {
      params.set("lowStock", "true");
    }

    startApplyTransition(() => {
      router.push(`/inventory?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "all",
      category: "all",
      propertyId: "all",
      lowStock: false,
    });

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
      <header className="mb-4 flex flex-col gap-5 py-1 text-sm text-muted-foreground">
        <div className="flex flex-col gap-4 pr-5 md:flex-row md:gap-2">
          {/* Search Bar */}
          <div className="relative flex-1 md:flex-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              placeholder="Search inventory by name . . ."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="w-full pl-10 text-black"
              disabled={isPending}
            />
          </div>

          {/* Property — inventory is property-scoped, so each store filters separately */}
          <Select
            value={filters.propertyId}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, propertyId: value }))
            }
            disabled={isPending}
          >
            <SelectTrigger className="w-full text-black/70 hover:cursor-pointer md:flex-1">
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">
                All Properties
              </SelectItem>
              {properties.map((property) => (
                <SelectItem
                  key={property.id}
                  value={property.id.toString()}
                  className="cursor-pointer"
                >
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.category}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, category: value }))
            }
            disabled={isPending}
          >
            <SelectTrigger className="w-full text-black/70 hover:cursor-pointer md:flex-1">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">
                All Categories
              </SelectItem>
              {CATEGORY_OPTIONS.map((category) => (
                <SelectItem
                  key={category.value}
                  value={category.value}
                  className="cursor-pointer"
                >
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.status}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, status: value }))
            }
            disabled={isPending}
          >
            <SelectTrigger className="w-full text-black/70 hover:cursor-pointer md:flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">
                All Status
              </SelectItem>
              <SelectItem value="active" className="cursor-pointer">
                Active
              </SelectItem>
              <SelectItem value="discontinued" className="cursor-pointer">
                Discontinued
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-0">
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
              className="cursor-pointer bg-chart-5 px-12 hover:bg-red-600"
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

          {/* Pairs with the restock button in each row */}
          <div className="flex items-center gap-2">
            <Switch
              id="low-stock"
              checked={filters.lowStock}
              onCheckedChange={(checked) =>
                setFilters((prev) => ({ ...prev, lowStock: checked }))
              }
              disabled={isPending}
              className="cursor-pointer"
            />
            <Label htmlFor="low-stock" className="cursor-pointer">
              Needs restocking only
            </Label>
          </div>
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
        <InventoryItemsTable items={items} />
      )}

      <Footer
        currentPage={currentPage}
        hasNext={hasNext}
        hasPrev={hasPrev}
        totalPages={totalPages}
        paramName="page"
        preserveParams={[
          "tab",
          "search",
          "status",
          "category",
          "propertyId",
          "lowStock",
        ]}
      />
    </section>
  );
}

export { InventoryItems };