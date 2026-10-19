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
import { Plus, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { InventoryAssignmentForm } from "./InventoryAssignmentForm";
import {
  getAssignableItems,
  getAllUnitsForAssignment,
} from "@/lib/actions/inventory";

interface InventoryAssignmentDialogProps {
  preselectedItemId?: string;
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

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  /**
   * Fetched here rather than in the form so nothing loads until the
   * dialog opens. Scoped to one property when we already know it.
   */
  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["assignable-items", preselectedPropertyId ?? "all"],
    queryFn: () => getAssignableItems(preselectedPropertyId),
    enabled: isOpen,
    staleTime: 30_000,
  });

  const { data: units = [], isLoading: unitsLoading } = useQuery({
    queryKey: ["assignment-units"],
    queryFn: () => getAllUnitsForAssignment(),
    enabled: isOpen,
    staleTime: 5 * 60_000,
  });

  const loading = itemsLoading || unitsLoading;

  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
  };

  const defaultTrigger = (
    <Button size="sm" className="gap-2">
      <Plus className="h-4 w-4" />
      Assign Items
    </Button>
  );

  // Controlled callers (e.g. a row's dropdown menu) open it themselves,
  // so only fall back to the default button when uncontrolled.
  const triggerNode =
    trigger ?? children ?? (controlledOpen === undefined ? defaultTrigger : null);

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {triggerNode && <DialogTrigger asChild>{triggerNode}</DialogTrigger>}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Inventory Item</DialogTitle>
          <DialogDescription>
            Send stock from a property&apos;s store to one of its units.
            Laundry, housekeeping and office supplies aren&apos;t listed here because they&apos;re tracked
            with usage logs instead.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading available stock…
          </div>
        ) : (
          <InventoryAssignmentForm
            items={items}
            units={units}
            preselectedUnitId={preselectedUnitId}
            preselectedPropertyId={preselectedPropertyId}
            preselectedItemId={preselectedItemId}
            onSuccess={handleSuccess}
            onCancel={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}