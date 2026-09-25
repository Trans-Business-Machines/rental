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
import { Loader2, Undo2, Ban, AlertTriangle } from "lucide-react";
import {
  returnInventoryAssignment,
  closeAssignment,
} from "@/lib/actions/inventory";

interface ReturnDialogAssignment {
  id: string;
  quantity: number;
  returnedQuantity: number;
  outstandingQuantity: number;
  inventoryItem: {
    itemName: string;
    unitOfMeasure: string;
  };
  unit: { name: string };
}

interface ReturnAssignmentDialogProps {
  assignment: ReturnDialogAssignment;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function formatQty(value: number) {
  return Number(value.toFixed(2)).toLocaleString();
}

export function ReturnAssignmentDialog({
  assignment,
  children,
  open,
  onOpenChange,
}: ReturnAssignmentDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * Two distinct outcomes, not two flavours of the same one:
   *   return   — items come back, stock is credited
   *   writeoff — items are gone, stock is NOT credited, assignment closes
   */
  const [mode, setMode] = useState<"return" | "writeoff">("return");

  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const setDialogOpen = isControlled
    ? onOpenChange || (() => {})
    : setInternalOpen;

  const { outstandingQuantity: outstanding } = assignment;
  const uom = assignment.inventoryItem.unitOfMeasure;

  const [quantity, setQuantity] = useState(String(outstanding));
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");

  const parsedQty = Number(quantity);
  const validQty =
    quantity !== "" && !Number.isNaN(parsedQty) && parsedQty > 0;
  const exceeds = validQty && parsedQty > outstanding;
  const isPartial = validQty && !exceeds && parsedQty < outstanding;
  const remainder = isPartial ? outstanding - parsedQty : 0;

  const reset = () => {
    setMode("return");
    setQuantity(String(outstanding));
    setNotes("");
    setReason("");
  };

  const handleReturn = async () => {
    if (!validQty || exceeds) {
      toast.error(`Enter between 0 and ${formatQty(outstanding)} ${uom}.`);
      return;
    }

    setLoading(true);
    const result = await returnInventoryAssignment({
      assignmentId: assignment.id,
      quantity: parsedQty,
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

  const handleWriteOff = async () => {
    if (!reason.trim()) {
      toast.error("A reason is required.", {
        description: "Say briefly what happened to the outstanding items.",
      });
      return;
    }

    setLoading(true);
    const result = await closeAssignment({
      assignmentId: assignment.id,
      reason: reason.trim(),
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
          <DialogTitle>
            {mode === "return" ? "Return" : "Write off"}{" "}
            {assignment.inventoryItem.itemName}
          </DialogTitle>
          <DialogDescription>
            {mode === "return"
              ? `Coming back from ${assignment.unit.name} into the store.`
              : `Closing the assignment without the items returning to stock.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Originally assigned</span>
              <span className="tabular-nums">
                {formatQty(assignment.quantity)} {uom}
              </span>
            </div>
            {assignment.returnedQuantity > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Already returned</span>
                <span className="tabular-nums">
                  {formatQty(assignment.returnedQuantity)} {uom}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between font-medium">
              <span>Still out</span>
              <span className="tabular-nums">
                {formatQty(outstanding)} {uom}
              </span>
            </div>
          </div>

          {mode === "return" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="return-qty">Quantity returned * ({uom})</Label>
                <Input
                  id="return-qty"
                  type="number"
                  min="0"
                  step="0.01"
                  max={outstanding}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
                {exceeds && (
                  <p className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Only {formatQty(outstanding)} {uom} are still out.
                  </p>
                )}
                {/* A partial return leaves the assignment open on purpose */}
                {isPartial && (
                  <p className="text-xs text-muted-foreground">
                    {formatQty(remainder)} {uom} will stay outstanding. Write
                    them off later if they aren&apos;t coming back.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="return-notes">Notes</Label>
                <Textarea
                  id="return-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Returned after guest checkout"
                  rows={2}
                  disabled={loading}
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="writeoff-reason">Reason *</Label>
                <Textarea
                  id="writeoff-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Destroyed in the wash, not recoverable"
                  rows={3}
                  disabled={loading}
                  autoFocus
                />
              </div>
              <p className="text-xs text-muted-foreground">
                All {formatQty(outstanding)} {uom} still out will be written
                off. Stock is not credited back, and this can&apos;t be undone.
              </p>
            </>
          )}

          <div className="flex flex-wrap justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                setMode((m) => (m === "return" ? "writeoff" : "return"))
              }
              disabled={loading}
              className="mr-auto"
            >
              {mode === "return" ? (
                <>
                  <Ban className="mr-2 h-4 w-4" />
                  Write off instead
                </>
              ) : (
                <>
                  <Undo2 className="mr-2 h-4 w-4" />
                  Return instead
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>

            {mode === "return" ? (
              <Button
                type="button"
                onClick={handleReturn}
                disabled={loading || !validQty || exceeds}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Undo2 className="mr-2 h-4 w-4" />
                )}
                Confirm return
              </Button>
            ) : (
              <Button
                type="button"
                variant="destructive"
                onClick={handleWriteOff}
                disabled={loading || !reason.trim()}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Ban className="mr-2 h-4 w-4" />
                )}
                Write off
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}