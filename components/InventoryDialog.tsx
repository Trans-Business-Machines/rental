"use client";

import { InventoryForm } from "@/components/InventoryForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";

interface InventoryDialogProps {
  properties: { id: number; name: string }[];
  children?: React.ReactNode;
}

export function InventoryDialog({ properties, children }: InventoryDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="flex justify-start items-center cursor-pointer">
            <Plus className="size-4 mr-1 text-white" />
            <span className="text-white">Add Item</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Inventory Item</DialogTitle>
        </DialogHeader>
        <InventoryForm
          properties={properties}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}