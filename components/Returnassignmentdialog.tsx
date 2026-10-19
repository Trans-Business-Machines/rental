"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
  writeOffAssignmentIssues,
} from "@/lib/actions/inventory";
import { InfoBanner } from "@/components/InfoBanner";
import { useRefreshOpenIssueCount } from "@/hooks/useInventory";

interface OpenIssue {
  id: string;
  issueType: string;
  quantityAffected: number;
  description: string;
}

interface ReturnDialogAssignment {
  id: string;
  quantity: number;
  returnedQuantity: number;
  writtenOffQuantity: number;
  outstandingQuantity: number;
  /** Outstanding minus what open issues hold. */
  returnableQuantity: number;
  openIssues: OpenIssue[];
  inventoryItem: {
    id: string;
    itemName: string;
    unitOfMeasure: string;
  };
  unit: { name: string };
}

type Mode = "return" | "writeoff";

interface ReturnAssignmentDialogProps {
  assignment: ReturnDialogAssignment;
  /** Open straight into write-off, e.g. from a row's "Write off" button. */
  initialMode?: Mode;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function formatQty(value: number) {
  return Number(value.toFixed(2)).toLocaleString();
}

export function ReturnAssignmentDialog({
  assignment,
  initialMode = "return",
  children,
  open,
  onOpenChange,
}: ReturnAssignmentDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const refreshOpenIssueCount = useRefreshOpenIssueCount();

  /**
   * Two distinct outcomes, not two flavours of the same one:
   *   return   — good items come back, stock is credited
   *   writeoff — items under an open issue are gone, stock is NOT
   *              credited; the good ones stay in the unit
   */
  const [mode, setMode] = useState<Mode>(initialMode);

  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const setDialogOpen = isControlled
    ? onOpenChange || (() => {})
    : setInternalOpen;

  const {
    outstandingQuantity: outstanding,
    returnableQuantity: returnable,
    openIssues,
  } = assignment;
  const uom = assignment.inventoryItem.unitOfMeasure;
  const underIssue = outstanding - returnable;

  const [quantity, setQuantity] = useState(String(returnable));
  const [notes, setNotes] = useState("");
  // Every open issue is ticked by default — the usual case is writing
  // off everything that was reported.
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    openIssues.map((i) => i.id),
  );

  const parsedQty = Number(quantity);
  const validQty = quantity !== "" && !Number.isNaN(parsedQty) && parsedQty > 0;
  const exceeds = validQty && parsedQty > returnable;
  const isPartial = validQty && !exceeds && parsedQty < outstanding;
  const remainder = isPartial ? outstanding - parsedQty : 0;

  const writeOffTotal = openIssues
    .filter((i) => selectedIds.includes(i.id))
    .reduce((sum, i) => sum + i.quantityAffected, 0);

  const reset = () => {
    setMode(initialMode);
    setQuantity(String(returnable));
    setNotes("");
    setSelectedIds(openIssues.map((i) => i.id));
  };

  const toggleIssue = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id),
    );
  };

  const handleReturn = async () => {
    if (!validQty || exceeds) {
      toast.error(`Enter between 0 and ${formatQty(returnable)} ${uom}.`);
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
    if (selectedIds.length === 0) {
      toast.error("Tick at least one issue to write off.");
      return;
    }

    setLoading(true);
    const result = await writeOffAssignmentIssues({
      assignmentId: assignment.id,
      issueIds: selectedIds,
      notes: notes.trim() || undefined,
    });
    setLoading(false);

    if (!result.success) {
      toast.error(result.message, { description: result.nextStep });
      return;
    }

    toast.success(result.message);
    refreshOpenIssueCount();
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

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "return" ? "Return" : "Write off"}{" "}
            {assignment.inventoryItem.itemName}
          </DialogTitle>
          <DialogDescription>
            {mode === "return"
              ? `Coming back from ${assignment.unit.name} into the store.`
              : `Gone for good from ${assignment.unit.name}. The good ones stay in the unit.`}
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
            {assignment.writtenOffQuantity > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Written off</span>
                <span className="tabular-nums">
                  {formatQty(assignment.writtenOffQuantity)} {uom}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between font-medium">
              <span>Still in the unit</span>
              <span className="tabular-nums">
                {formatQty(outstanding)} {uom}
              </span>
            </div>
            {underIssue > 0 && (
              <div className="flex items-center justify-between text-destructive">
                <span>Under an open issue</span>
                <span className="tabular-nums">
                  {formatQty(underIssue)} {uom}
                </span>
              </div>
            )}
          </div>

          {mode === "return" ? (
            returnable > 0 ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="return-qty">
                    Quantity returned * ({uom})
                  </Label>
                  <Input
                    id="return-qty"
                    type="number"
                    min="0"
                    step="0.01"
                    max={returnable}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    disabled={loading}
                    autoFocus
                  />
                  {exceeds && (
                    <p className="flex items-center gap-1.5 text-xs text-destructive">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Only {formatQty(returnable)} {uom} can be returned.
                    </p>
                  )}
                  {/* A partial return leaves the assignment open on purpose */}
                  {isPartial && (
                    <p className="text-xs text-muted-foreground">
                      {formatQty(remainder)} {uom} will stay in the unit.
                    </p>
                  )}
                </div>

                {underIssue > 0 && (
                  <InfoBanner>
                    {formatQty(underIssue)} {uom} under an open issue stay in
                    the unit until the issue is resolved. Use &ldquo;Write off
                    instead&rdquo; if they&apos;re gone for good.
                  </InfoBanner>
                )}

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
              <InfoBanner>
                Everything still in {assignment.unit.name} is under an open
                issue. Write it off, or resolve the issue from the item&apos;s
                page if it was repaired.
              </InfoBanner>
            )
          ) : openIssues.length > 0 ? (
            <>
              <div className="space-y-2">
                <Label>Which items are gone? *</Label>
                <div className="space-y-2">
                  {openIssues.map((issue) => (
                    <label
                      key={issue.id}
                      htmlFor={`writeoff-${issue.id}`}
                      className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3"
                    >
                      <Checkbox
                        id={`writeoff-${issue.id}`}
                        checked={selectedIds.includes(issue.id)}
                        onCheckedChange={(checked) =>
                          toggleIssue(issue.id, checked === true)
                        }
                        disabled={loading}
                        className="mt-0.5"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="destructive" className="capitalize">
                            {issue.issueType.replace(/_/g, " ")}
                          </Badge>
                          <span className="text-sm font-medium tabular-nums">
                            {formatQty(issue.quantityAffected)} {uom}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {issue.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="writeoff-notes">Notes</Label>
                <Textarea
                  id="writeoff-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Not repairable, binned"
                  rows={2}
                  disabled={loading}
                />
              </div>

              {writeOffTotal > 0 && (
                <InfoBanner>
                  {formatQty(writeOffTotal)} {uom} will be written off and the
                  issues marked discarded. Stock isn&apos;t credited back.
                  {outstanding - writeOffTotal > 0
                    ? ` ${formatQty(outstanding - writeOffTotal)} ${uom} stay in the unit.`
                    : " Nothing will be left out, so the assignment closes."}
                </InfoBanner>
              )}
            </>
          ) : (
            <InfoBanner>
              Nothing here is under an open issue. Every write-off starts as a
              reported issue, so{" "}
              <Link
                href={`/inventory/${assignment.inventoryItem.id}`}
                className="font-medium underline"
              >
                report what&apos;s damaged or missing
              </Link>{" "}
              first, then write it off.
            </InfoBanner>
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
              className="flex-0"
            >
              Cancel
            </Button>

            {mode === "return" ? (
              <Button
                type="button"
                onClick={handleReturn}
                className="flex-1"
                disabled={loading || returnable <= 0 || !validQty || exceeds}
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
                className="flex-1"
                disabled={loading || selectedIds.length === 0}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Ban className="mr-2 h-4 w-4" />
                )}
                Write off
                {writeOffTotal > 0 && ` ${formatQty(writeOffTotal)} ${uom}`}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
