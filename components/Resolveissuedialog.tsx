"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
import { Loader2, CheckCircle2, Info } from "lucide-react";
import { resolveItemIssue } from "@/lib/actions/inventory";
import type { IssueResolution } from "@/prisma/generated/client";

type Resolution = Exclude<IssueResolution, "pending">;

const RESOLUTIONS: { value: Resolution; label: string; hint: string }[] = [
  {
    value: "repair",
    label: "Repaired",
    hint: "Fixed and back in service.",
  },
  {
    value: "replace",
    label: "Replaced",
    hint: "A new one was bought to take its place.",
  },
  {
    value: "discard",
    label: "Discarded",
    hint: "Written off permanently — not repaired, not replaced.",
  },
];

interface ResolveIssueDialogIssue {
  id: string;
  issueType: string;
  quantityAffected: number;
  description: string;
  reportedAt: Date | string;
  /** Null means the problem was found in the store, not in a unit. */
  assignmentId: string | null;
  reportedBy: { name: string };
  inventoryItem: {
    itemName: string;
    unitOfMeasure: string;
  };
  assignment?: { unit: { name: string } } | null;
}

interface ResolveIssueDialogProps {
  issue: ResolveIssueDialogIssue;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function formatQty(value: number) {
  return Number(value.toFixed(2)).toLocaleString();
}

export function ResolveIssueDialog({
  issue,
  children,
  open,
  onOpenChange,
}: ResolveIssueDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const setDialogOpen = isControlled
    ? onOpenChange || (() => {})
    : setInternalOpen;

  const [resolution, setResolution] = useState<Resolution | "">("");
  const [notes, setNotes] = useState("");
  const [cost, setCost] = useState("");
  const [logReplacement, setLogReplacement] = useState(true);

  const isStoreIssue = issue.assignmentId === null;
  const uom = issue.inventoryItem.unitOfMeasure;
  const selected = RESOLUTIONS.find((r) => r.value === resolution);

  /**
   * What the resolution does to stock, mirroring resolveItemIssue.
   *
   * A store issue was deducted when it was reported, so repairing
   * credits it back and discarding leaves it written off. A unit issue
   * never moved stock, so nothing moves now either — the assignment is
   * what settles it.
   */
  const stockEffect = (() => {
    if (!resolution) return null;

    if (!isStoreIssue) {
      return `Store stock is unchanged. These ${uom} are still out at ${
        issue.assignment?.unit.name ?? "the unit"
      } — close the assignment to settle them.`;
    }

    switch (resolution) {
      case "repair":
        return `${formatQty(issue.quantityAffected)} ${uom} will be credited back to the store.`;
      case "replace":
        return logReplacement
          ? `A stock receipt will be recorded and ${formatQty(issue.quantityAffected)} ${uom} added to the store.`
          : "No stock will be added. Record a restock separately when the replacement arrives.";
      case "discard":
        return "Stock stays written off. This was already deducted when the issue was reported.";
      default:
        return null;
    }
  })();

  const reset = () => {
    setResolution("");
    setNotes("");
    setCost("");
    setLogReplacement(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resolution) {
      toast.error("Select how this was resolved.");
      return;
    }

    setLoading(true);

    const result = await resolveItemIssue({
      issueId: issue.id,
      resolution,
      resolutionNotes: notes.trim() || undefined,
      cost: cost ? Number(cost) : undefined,
      logReplacementAsRestock:
        resolution === "replace" ? logReplacement : false,
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
            Resolve issue — {issue.inventoryItem.itemName}
          </DialogTitle>
          <DialogDescription>
            Closing this issue records what was done and who did it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* The original report, so it doesn't have to be remembered */}
          <div className="space-y-1.5 rounded-md border border-border bg-muted/50 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="destructive" className="capitalize">
                {issue.issueType.replace(/_/g, " ")}
              </Badge>
              <span className="text-sm font-medium">
                {formatQty(issue.quantityAffected)} {uom}
              </span>
              <span className="text-xs text-muted-foreground">
                {isStoreIssue
                  ? "in the store"
                  : `at ${issue.assignment?.unit.name ?? "a unit"}`}
              </span>
            </div>
            <p className="text-sm">{issue.description}</p>
            <p className="text-xs text-muted-foreground">
              Reported by {issue.reportedBy.name}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resolution">How was it resolved? *</Label>
            <Select
              value={resolution}
              onValueChange={(v) => setResolution(v as Resolution)}
              disabled={loading}
            >
              <SelectTrigger id="resolution" className="w-full">
                <SelectValue placeholder="Select a resolution" />
              </SelectTrigger>
              <SelectContent>
                {RESOLUTIONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selected && (
              <p className="text-xs text-muted-foreground">{selected.hint}</p>
            )}
          </div>

          {/* Only meaningful for a store-side replacement */}
          {resolution === "replace" && isStoreIssue && (
            <div className="flex items-start gap-2 rounded-md border border-border p-3">
              <Checkbox
                id="log-replacement"
                checked={logReplacement}
                onCheckedChange={(checked) =>
                  setLogReplacement(checked === true)
                }
                disabled={loading}
                className="mt-0.5 cursor-pointer"
              />
              <Label
                htmlFor="log-replacement"
                className="cursor-pointer text-sm font-normal leading-snug"
              >
                The replacement has arrived — add it to stock and record a
                receipt.
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  Leave unticked if it&apos;s still on order.
                </span>
              </Label>
            </div>
          )}

          {stockEffect && (
            <div className="flex gap-2 rounded-md border border-border bg-muted/50 p-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{stockEffect}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="resolution-cost">Cost incurred (KES)</Label>
            <Input
              id="resolution-cost"
              type="number"
              min="0"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="0"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              What the repair or replacement cost. Leave blank if nothing was
              spent.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resolution-notes">Resolution notes</Label>
            <Textarea
              id="resolution-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Screen replaced by Hotpoint under warranty"
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
            <Button type="submit" disabled={loading || !resolution}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Resolve
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
