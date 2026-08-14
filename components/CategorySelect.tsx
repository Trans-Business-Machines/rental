"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * The single source of truth for inventory categories.
 *
 * Kept in alphabetical order — add or remove entries here and every category
 * dropdown (add form, edit form, and the items filter) picks up the change.
 */
export const INVENTORY_CATEGORIES = [
  "Amenities",
  "Bathroom",
  "Bedroom Accessories",
  "Bedroom Amenities",
  "Cutlery",
  "Electronics",
  "Furniture",
  "House Keeping",
  "Kitchen Accessories",
  "Kitchen Consumables",
  "Lighting",
  "Office",
  "Other",
  "Room Accessories",
] as const;

export type InventoryCategory = (typeof INVENTORY_CATEGORIES)[number];

/** Value used by the filter to mean "no category filter". */
export const ALL_CATEGORIES_VALUE = "all";

interface CategorySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  /** Adds an "All Categories" option — used by the inventory items filter. */
  includeAllOption?: boolean;
  placeholder?: string;
  disabled?: boolean;
  /** Applied to the trigger. */
  className?: string;
}

export function CategorySelect({
  value,
  onValueChange,
  includeAllOption = false,
  placeholder = "Select category",
  disabled = false,
  className,
}: CategorySelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={cn("w-full cursor-pointer", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {includeAllOption && (
          <SelectItem value={ALL_CATEGORIES_VALUE} className="cursor-pointer">
            All Categories
          </SelectItem>
        )}
        {INVENTORY_CATEGORIES.map((category) => (
          <SelectItem
            key={category}
            value={category}
            className="cursor-pointer"
          >
            {category}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
