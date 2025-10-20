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

interface InventoryItem {
  id: number;
  category: string;
  itemName: string;
  description: string;
  quantity: number;
  purchasePrice?: number;
  currentValue?: number;
  supplier?: string | null;
  warrantyExpiry?: Date | null;
  status: string;
  assignableOnBooking?: boolean;
}

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
      <DialogContent className=" w-11/12  lg:max-w-3xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Inventory Item</DialogTitle>
        </DialogHeader>
        <InventoryForm
          item={item}
          onSuccess={() => setDialogOpen(false)}
          onCancel={() => setDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
