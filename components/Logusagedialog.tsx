"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Droplets, TrendingDown, TriangleAlert } from "lucide-react";
import { logItemUsage } from "@/lib/actions/inventory";

interface LogUsageDialogItem {
  id: string;
  itemName: string;
  unitOfMeasure: string;
  availableQuantity: number;
  restockAt: number;
}

interface LogUsageDialogProps {
  item: LogUsageDialogItem;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function formatQty(value: number) {
  return Number(value.toFixed(2)).toLocaleString();
}

export function LogUsageDialog({
  item,
  children,
  open,
  onOpenChange,
}: LogUsageDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const setDialogOpen = isControlled
    ? onOpenChange || (() => {})
    : setInternalOpen;

  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  const parsedQty = Number(quantity);
  const validQty = quantity !== "" && !Number.isNaN(parsedQty) && parsedQty > 0;
  const exceeds = validQty && parsedQty > item.availableQuantity;

  // Preview before committing, since usage can't be undone.
  const remaining =
    validQty && !exceeds
      ? item.availableQuantity - parsedQty
      : item.availableQuantity;

  const dropsBelowThreshold =
    validQty && !exceeds && remaining <= item.restockAt;

  const reset = () => {
    setQuantity("");
    setNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validQty || exceeds) {
      toast.error(
        `Enter between 0 and ${formatQty(item.availableQuantity)} ${item.unitOfMeasure}.`,
      );
      return;
    }

    setLoading(true);

    const result = await logItemUsage({
      inventoryItemId: item.id,
      quantityUsed: parsedQty,
      notes: notes.trim() || undefined,
    });

    setLoading(false);

    if (!result.success) {
      toast.error(result.message, { description: result.nextStep });
      return;
    }

    toast.success(result.message);
    reset();
    setDialogOpen(false);
  };

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(next) => {
        if (!next) reset();
        setDialogOpen(next);
      }}
    >
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}

      <DialogContent className="w-11/12 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log usage — {item.itemName}</DialogTitle>
          <DialogDescription>
            Records what housekeeping consumed and takes it out of the store
            balance.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between rounded-md border border-border bg-muted/50 px-3 py-2">
            <span className="text-sm text-muted-foreground">
              Currently in store
            </span>
            <span className="text-sm font-medium tabular-nums">
              {formatQty(item.availableQuantity)} {item.unitOfMeasure}
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="usage-qty">
              Quantity used * ({item.unitOfMeasure})
            </Label>
            <Input
              id="usage-qty"
              type="number"
              min="0"
              step="0.01"
              max={item.availableQuantity}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              disabled={loading}
              autoFocus
              required
            />
            {exceeds && (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <TriangleAlert className="h-3.5 w-3.5" />
                Only {formatQty(item.availableQuantity)} {item.unitOfMeasure} in
                store.
              </p>
            )}
          </div>

          {validQty && !exceeds && (
            <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
              <TrendingDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span>
                Remaining:{" "}
                <span className="font-medium tabular-nums">
                  {formatQty(remaining)} {item.unitOfMeasure}
                </span>
                {dropsBelowThreshold && (
                  <span className="text-amber-600">
                    {" "}
                    — at or below the restock threshold
                  </span>
                )}
              </span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="usage-notes">Notes</Label>
            <Textarea
              id="usage-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Full property wash, NL-A1 and NL-A2 linens"
              rows={2}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Usage isn&apos;t tied to a unit, so a note is the only record of
              what the batch covered.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !validQty || exceeds}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Droplets className="mr-2 h-4 w-4" />
              )}
              Log usage
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
