"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangeField, toDay } from "@/components/DateRangeField";
import { useExportGuests } from "@/hooks/useGuests";

interface ExportGuestsDialogProps {
  initialStatus?: string;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "verified", label: "Verified" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
] as const;

type StatusValue = (typeof STATUS_OPTIONS)[number]["value"];

const isStatusValue = (value?: string): value is StatusValue =>
  STATUS_OPTIONS.some((option) => option.value === value);

export function ExportGuestsDialog({ initialStatus }: ExportGuestsDialogProps) {
  const defaultStatus: StatusValue = isStatusValue(initialStatus) ? initialStatus : "all";

  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<StatusValue>(defaultStatus);
  const [addedOn, setAddedOn] = useState<DateRange | undefined>();

  const { mutate: exportGuests, isPending } = useExportGuests();

  const handleOpenChange = (next: boolean) => {
    // Re-sync with the page's current status filter each time the dialog opens
    if (next) setStatus(defaultStatus);
    setOpen(next);
  };

  const handleReset = () => {
    setStatus("all");
    setAddedOn(undefined);
  };

  const handleDownload = () => {
    exportGuests(
      {
        status,
        addedFrom: toDay(addedOn?.from),
        addedTo: toDay(addedOn?.to),
      },
      { onSuccess: () => setOpen(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-md">
          <Download className="size-4" />
          <span>Export</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Export guests</DialogTitle>
          <DialogDescription>
            Download guests as an Excel (.xlsx) file. Leave a filter empty to include everything.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="export-guest-status">Verification status</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as StatusValue)}
              disabled={isPending}
            >
              <SelectTrigger id="export-guest-status" className="w-full">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DateRangeField
            id="export-guest-added"
            label="Date added"
            value={addedOn}
            onChange={setAddedOn}
            disabled={isPending}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="ghost" onClick={handleReset} disabled={isPending}>
            Reset
          </Button>
          <Button type="button" onClick={handleDownload} disabled={isPending}>
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            <span>{isPending ? "Preparing…" : "Download"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
