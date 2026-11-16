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
import { useExportBookings } from "@/hooks/useBookings";
import { DateRangeField, toDay } from "@/components/DateRangeField";
import type { PropertyNames } from "@/lib/types/types";

interface ExportBookingsDialogProps {
  properties: PropertyNames;
  initialStatus?: string;
  initialPropertyId?: string;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "reserved", label: "Reserved" },
  { value: "checked_in", label: "Checked In" },
  { value: "checked_out", label: "Checked Out" },
  { value: "cancelled", label: "Cancelled" },
] as const;

type StatusValue = (typeof STATUS_OPTIONS)[number]["value"];

const isStatusValue = (value?: string): value is StatusValue =>
  STATUS_OPTIONS.some((option) => option.value === value);


export function ExportBookingsDialog({
  properties,
  initialStatus,
  initialPropertyId,
}: ExportBookingsDialogProps) {
  const defaultStatus: StatusValue = isStatusValue(initialStatus) ? initialStatus : "all";
  const defaultPropertyId = initialPropertyId ?? "all";

  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<StatusValue>(defaultStatus);
  const [propertyId, setPropertyId] = useState(defaultPropertyId);
  const [bookedOn, setBookedOn] = useState<DateRange | undefined>();

  const { mutate: exportBookings, isPending } = useExportBookings();

  const handleOpenChange = (next: boolean) => {
    // Re-sync with the page's current list filters each time the dialog opens
    if (next) {
      setStatus(defaultStatus);
      setPropertyId(defaultPropertyId);
    }
    setOpen(next);
  };

  const handleReset = () => {
    setStatus("all");
    setPropertyId("all");
    setBookedOn(undefined);
  };

  const handleDownload = () => {
    exportBookings(
      {
        status,
        propertyId,
        createdFrom: toDay(bookedOn?.from),
        createdTo: toDay(bookedOn?.to),
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
          <DialogTitle>Export bookings</DialogTitle>
          <DialogDescription>
            Download bookings as an Excel (.xlsx) file. Leave a filter empty to include everything.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="export-property">Property</Label>
              <Select value={propertyId} onValueChange={setPropertyId} disabled={isPending}>
                <SelectTrigger id="export-property" className="w-full">
                  <SelectValue placeholder="All Properties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id.toString()}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="export-status">Booking status</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as StatusValue)}
                disabled={isPending}
              >
                <SelectTrigger id="export-status" className="w-full">
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
          </div>

          <DateRangeField
            id="export-booked-on"
            label="Booking date"
            value={bookedOn}
            onChange={setBookedOn}
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
