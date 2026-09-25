"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, TriangleAlert, Info } from "lucide-react";
import { reportItemIssue } from "@/lib/actions/inventory";
import type { IssueType } from "@/prisma/generated/client";

const ISSUE_TYPES: { value: IssueType; label: string; hint: string }[] = [
  {
    value: "damaged",
    label: "Damaged",
    hint: "Broken or impaired but still physically present.",
  },
  {
    value: "missing",
    label: "Missing",
    hint: "Not where it should be — lost, taken, or unaccounted for.",
  },
  {
    value: "worn_out",
    label: "Worn out",
    hint: "Past useful life through normal wear rather than an incident.",
  },
];

/** An assignment the issue can be attached to — items out in a unit. */
interface IssueAssignmentOption {
  id: string;
  quantity: number;
  returnedQuantity: number;
  unit: { name: string };
}

interface ReportIssueDialogItem {
  id: string;
  itemName: string;
  unitOfMeasure: string;
  availableQuantity: number;
}

interface ReportIssueDialogProps {
  item: ReportIssueDialogItem;
  /** Outstanding assignments. Omit to only allow store-side reports. */
  assignments?: IssueAssignmentOption[];
  /** Pre-select an assignment when reporting from an assignment row. */
  preselectedAssignmentId?: string;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const STORE_VALUE = "store";

function formatQty(value: number) {
  return Number(value.toFixed(2)).toLocaleString();
}

export function ReportIssueDialog({
  item,
  assignments = [],
  preselectedAssignmentId,
  children,
  open,
  onOpenChange,
}: ReportIssueDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const setDialogOpen = isControlled
    ? onOpenChange || (() => {})
    : setInternalOpen;

  const [location, setLocation] = useState(
    preselectedAssignmentId ?? STORE_VALUE,
  );
  const [issueType, setIssueType] = useState<IssueType | "">("");
  const [quantity, setQuantity] = useState("1");
  const [description, setDescription] = useState("");

  const selectedAssignment =
    location === STORE_VALUE
      ? null
      : (assignments.find((a) => a.id === location) ?? null);

  const selectedType = ISSUE_TYPES.find((t) => t.value === issueType);

  /**
   * The cap depends on where the problem is. In the store it's the
   * available balance; in a unit it's what's still out on that
   * assignment. Both are enforced server-side too.
   */
  const maxQuantity = selectedAssignment
    ? selectedAssignment.quantity - selectedAssignment.returnedQuantity
    : item.availableQuantity;

  const parsedQty = Number(quantity);
  const validQty = quantity !== "" && !Number.isNaN(parsedQty) && parsedQty > 0;
  const exceeds = validQty && parsedQty > maxQuantity;

  const reset = () => {
    setLocation(preselectedAssignmentId ?? STORE_VALUE);
    setIssueType("");
    setQuantity("1");
    setDescription("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!issueType) {
      toast.error("Select what kind of issue this is.");
      return;
    }

    if (!description.trim()) {
      toast.error("A description is required.", {
        description:
          "Describe what happened so whoever resolves it has context.",
      });
      return;
    }

    if (!validQty || exceeds) {
      toast.error(
        `Enter between 0 and ${formatQty(maxQuantity)} ${item.unitOfMeasure}.`,
      );
      return;
    }

    setLoading(true);

    const result = await reportItemIssue({
      inventoryItemId: item.id,
      assignmentId: selectedAssignment?.id,
      issueType,
      quantityAffected: parsedQty,
      description: description.trim(),
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
          <DialogTitle>Report an issue — {item.itemName}</DialogTitle>
          <DialogDescription>
            Logged as open until someone records how it was resolved.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {assignments.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="issue-location">Where was it found? *</Label>
              <Select
                value={location}
                onValueChange={(value) => {
                  setLocation(value);
                  setQuantity("1");
                }}
                disabled={loading}
              >
                <SelectTrigger id="issue-location" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={STORE_VALUE}>
                    In the store ({formatQty(item.availableQuantity)}{" "}
                    {item.unitOfMeasure} available)
                  </SelectItem>
                  {assignments.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.unit.name} —{" "}
                      {formatQty(a.quantity - a.returnedQuantity)}{" "}
                      {item.unitOfMeasure} out
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="issue-type">Issue type *</Label>
            <Select
              value={issueType}
              onValueChange={(v) => setIssueType(v as IssueType)}
              disabled={loading}
            >
              <SelectTrigger id="issue-type" className="w-full">
                <SelectValue placeholder="Select an issue type" />
              </SelectTrigger>
              <SelectContent>
                {ISSUE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedType && (
              <p className="text-xs text-muted-foreground">
                {selectedType.hint}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="issue-qty">
                Quantity affected * ({item.unitOfMeasure})
              </Label>
              <span className="text-xs text-muted-foreground">
                max {formatQty(maxQuantity)}
              </span>
            </div>
            <Input
              id="issue-qty"
              type="number"
              min="0"
              step="0.01"
              max={maxQuantity}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={loading}
              required
            />
            {exceeds && (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <TriangleAlert className="h-3.5 w-3.5" />
                Only {formatQty(maxQuantity)} {item.unitOfMeasure}{" "}
                {selectedAssignment
                  ? `are out at ${selectedAssignment.unit.name}`
                  : "are in the store"}
                .
              </p>
            )}
          </div>

          {/*
            THE DEDUCTION RULE, made visible.

            Store issue  -> stock drops now; it was counted as available
                            and it isn't.
            Unit issue   -> no stock change; it already left the store on
                            assignment. Deducting again would double-count.
          */}
          {validQty && !exceeds && (
            <div className="flex gap-2 rounded-md border border-border bg-muted/50 p-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                {selectedAssignment ? (
                  <>
                    Store stock is unchanged — these {item.unitOfMeasure} left
                    when they were assigned to {selectedAssignment.unit.name}.
                    Closing the assignment settles them.
                  </>
                ) : (
                  <>
                    {formatQty(parsedQty)} {item.unitOfMeasure} will come out of
                    the store balance now, leaving{" "}
                    {formatQty(item.availableQuantity - parsedQty)}. Resolving
                    as a repair credits it back.
                  </>
                )}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="issue-description">What happened? *</Label>
            <Textarea
              id="issue-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Cracked screen after guest impact"
              rows={3}
              disabled={loading}
              required
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
            <Button
              type="submit"
              disabled={loading || !issueType || !validQty || exceeds}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <TriangleAlert className="mr-2 h-4 w-4" />
              )}
              Report issue
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
