"use client";

import { useState } from "react";
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
import { Package, Search } from "lucide-react";
import { useTableMode } from "@/hooks/useTableMode";
import { useFilter } from "@/hooks/useFilter";
import { ItemsNotFound } from "./ItemsNotFound";
import { SearchNotFound } from "./SearchNotFound";
import Pagination from "./Pagination";
import type { InvetoryItem } from "@/lib/types/types";

interface InventoryItemsProps {
  items: InvetoryItem[];
}

function InventoryItems({ items }: InventoryItemsProps) {
  // Get table mode context from useTableMode Hook
  const { tableMode, setTableMode } = useTableMode();

  // Define state for search term
  const [searchTerm, setSearchTerm] = useState("");

  // Define state to hold inventory item select filters
  const [selectFilters, setSelectFilters] = useState({
    status: "all",
    category: "all",
  });

  // Filter the inventory items
  const filteredItems = useFilter<InvetoryItem>({
    items,
    searchTerm,
    searchFields: ["itemName"],
    selectFilters,
  });

  if (items.length === 0 || !items) {
    return (
      <ItemsNotFound
        title="No inventory items found!"
        message="Get started by adding your first inventory item."
        icon={Package}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 text-muted-foreground/90 text-sm py-1">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search inventory by name . . ."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-black"
          />
        </div>

        {/* Select Filters */}
        <Select
          defaultValue="all"
          value={selectFilters.status}
          onValueChange={(value) => {
            setSelectFilters((prev) => ({ ...prev, status: value }));
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="discontinued">Discontinued</SelectItem>
          </SelectContent>
        </Select>

        <Select
          defaultValue="all"
          value={selectFilters.category}
          onValueChange={(value) => {
            setSelectFilters((prev) => ({ ...prev, category: value }));
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
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

        <Switch
          checked={tableMode}
          onCheckedChange={setTableMode}
          className="cursor-pointer"
        />
        <span>Table mode</span>
      </div>

      {filteredItems.length === 0 ? (
        <SearchNotFound
          title="No Item matches the search criteria"
          icon={Package}
        />
      ) : tableMode ? (
        <InventoryItemsTable items={filteredItems} />
      ) : (
        <InventoryItemsCards items={filteredItems} />
      )}

      <div className="mt-6">
        <Pagination />
      </div>
    </div>
  );
}

export { InventoryItems };
