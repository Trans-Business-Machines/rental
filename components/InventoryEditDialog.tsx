"use client";

import { InventoryForm } from "@/components/InventoryForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import type { InventoryItem } from "@/lib/types/types";

interface InventoryEditDialogProps {
  item: InventoryItem;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function InventoryEditDialog({
  item,
  children,
  open,
  onOpenChange,
}: InventoryEditDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const setDialogOpen = isControlled
    ? onOpenChange || (() => {})
    : setInternalOpen;

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {item.itemName}</DialogTitle>
        </DialogHeader>
        <InventoryForm
          // The property select is disabled while editing, so the item's
          // own property is the only entry the form needs.
          properties={[item.property]}
          item={{
            id: item.id,
            propertyId: item.propertyId,
            category: item.category,
            itemName: item.itemName,
            description: item.description,
            unitOfMeasure: item.unitOfMeasure,
            restockAt: item.restockAt,
            unitCost: item.unitCost,
          }}
          hasHistory={item.hasHistory}
          onSuccess={() => setDialogOpen(false)}
          onCancel={() => setDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}