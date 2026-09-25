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
import { Loader2, PackagePlus, TrendingUp } from "lucide-react";
import { restockItem } from "@/lib/actions/inventory";

interface RestockDialogItem {
  id: string;
  itemName: string;
  unitOfMeasure: string;
  availableQuantity: number;
  restockAt: number;
  unitCost: number | null;
}

interface RestockDialogProps {
  item: RestockDialogItem;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** Trim trailing zeros: 2.50 -> 2.5, 40.00 -> 40 */
function formatQty(value: number) {
  return Number(value.toFixed(2)).toLocaleString();
}

export function RestockDialog({
  item,
  children,
  open,
  onOpenChange,
}: RestockDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const setDialogOpen = isControlled
    ? onOpenChange || (() => {})
    : setInternalOpen;

  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [notes, setNotes] = useState("");

  const parsedQty = Number(quantity);
  const validQty = quantity !== "" && !Number.isNaN(parsedQty) && parsedQty > 0;

  // Preview so the person can sanity-check before committing a stock change.
  const projected = validQty
    ? item.availableQuantity + parsedQty
    : item.availableQuantity;

  const clearsThreshold =
    validQty &&
    item.availableQuantity <= item.restockAt &&
    projected > item.restockAt;

  const reset = () => {
    setQuantity("");
    setUnitCost("");
    setNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validQty) {
      toast.error("Enter how much stock was received.", {
        description: `A positive amount in ${item.unitOfMeasure}, for example 10.`,
      });
      return;
    }

    setLoading(true);

    const result = await restockItem({
      inventoryItemId: item.id,
      quantity: parsedQty,
      unitCost: unitCost ? Number(unitCost) : undefined,
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
          <DialogTitle>Restock {item.itemName}</DialogTitle>
          <DialogDescription>
            Records what was received and adds it to the store balance.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current position, so nobody has to leave the dialog to check */}
          <div className="flex items-center justify-between rounded-md border border-border bg-muted/50 px-3 py-2">
            <span className="text-sm text-muted-foreground">
              Currently in store
            </span>
            <span className="text-sm font-medium tabular-nums">
              {formatQty(item.availableQuantity)} {item.unitOfMeasure}
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="restock-qty">
              Quantity received * ({item.unitOfMeasure})
            </Label>
            <Input
              id="restock-qty"
              type="number"
              min="0"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              disabled={loading}
              autoFocus
              required
            />
          </div>

          {validQty && (
            <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
              <TrendingUp className="h-4 w-4 shrink-0 text-green-600" />
              <span>
                New balance:{" "}
                <span className="font-medium tabular-nums">
                  {formatQty(projected)} {item.unitOfMeasure}
                </span>
                {clearsThreshold && (
                  <span className="text-muted-foreground">
                    {" "}
                    — above the restock threshold
                  </span>
                )}
              </span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="restock-cost">Unit cost (KES)</Label>
            <Input
              id="restock-cost"
              type="number"
              min="0"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              placeholder={
                item.unitCost != null ? String(item.unitCost) : "Optional"
              }
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              What you paid this time. Kept on the receipt for purchase history,
              and becomes the item&apos;s current cost.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="restock-notes">Notes</Label>
            <Textarea
              id="restock-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Monthly replenishment"
              rows={2}
              disabled={loading}
            />
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
            <Button type="submit" disabled={loading || !validQty}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <PackagePlus className="mr-2 h-4 w-4" />
              )}
              Record receipt
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
