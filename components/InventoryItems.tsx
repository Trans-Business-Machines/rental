"use client";

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
import type { InvetoryItem } from "@/lib/types/types";
import { useTableMode } from "@/hooks/useTableMode";
import Pagination from "./Pagination";

interface InventoryItemsProps {
  items: InvetoryItem[];
}

function InventoryItems({ items }: InventoryItemsProps) {
  // Get table mode context from useTableMode Hook
  const { tableMode, setTableMode } = useTableMode();

  if (items.length === 0 || !items) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium">No inventory items found</h3>
        <p className="text-muted-foreground">
          Get started by adding your first inventory item
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2 text-muted-foreground/90 text-sm">
        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Search inventory ..." className="pl-10" />
          </div>

          <Select defaultValue="all">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="discontinued">Discontinued</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
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
        </div>
        <Switch
          checked={tableMode}
          onCheckedChange={setTableMode}
          className="cursor-pointer"
        />
        <span>Table mode</span>
      </div>

      {tableMode ? (
        <InventoryItemsTable items={items} />
      ) : (
        <InventoryItemsCards items={items} />
      )}
      <div className="mt-6">
        <Pagination />
      </div>
    </div>
  );
}

export { InventoryItems };
