"use client";

import { useState } from "react";
import { InventoryItemsCards } from "./InventoryItemsCards";
import { InventoryItemsTable } from "./InventoryItemsTable";
import { Switch } from "./ui/switch";
import { Package } from "lucide-react";
import type { InvetoryItem } from "@/lib/types/types";

interface InventoryItemsProps {
  items: InvetoryItem[];
}

function InventoryItems({ items }: InventoryItemsProps) {
  const [tableMode, setTableMode] = useState(true);

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
    </div>
  );
}

export { InventoryItems };
