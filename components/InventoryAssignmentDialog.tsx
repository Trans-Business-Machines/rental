"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import { InventoryAssignmentForm } from "./InventoryAssignmentForm";

interface InventoryAssignmentDialogProps {
  preselectedItemId?: number;
  preselectedUnitId?: number;
  preselectedPropertyId?: number;
  trigger?: React.ReactNode;
  children?: React.ReactNode;
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function InventoryAssignmentDialog({
  preselectedItemId,
  trigger,
  preselectedPropertyId,
  children,
  onSuccess,
  preselectedUnitId,
  open: controlledOpen,
  onOpenChange,
}: InventoryAssignmentDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const defaultTrigger = (
    <Button size="sm" className="gap-2">
      <Plus className="h-4 w-4" />
      Assign Items
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {(trigger || children) && (
        <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      )}
      <DialogContent className="max-h-[90vh] w-9/12 md:w-[40rem] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Inventory Item</DialogTitle>
          <DialogDescription>
            Assign inventory items from the store to a specific unit. Supports
            bulk assignments with individual serial numbers and notes.
          </DialogDescription>
        </DialogHeader>
        <InventoryAssignmentForm
          preselectedUnitId={preselectedUnitId}
          preselectedPropertyId={preselectedPropertyId}
          preselectedItemId={preselectedItemId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
