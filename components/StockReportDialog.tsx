"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
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
import { useExportStockReport } from "@/hooks/useInventory";
import { CATEGORY_DISPLAY, INVENTORY_CATEGORIES } from "@/lib/inventory-categories";
import { STOCK_LEVELS, type StockLevelFilter } from "@/lib/inventory-stock";
import type { PropertyNames } from "@/lib/types/types";

const CATEGORY_OPTIONS = INVENTORY_CATEGORIES.map((value) => ({
  value,
  label: CATEGORY_DISPLAY[value].label,
})).sort((a, b) => a.label.localeCompare(b.label));

const isStockFilter = (value?: string): value is StockLevelFilter =>
  value === "all" || STOCK_LEVELS.some((level) => level.value === value);

interface StockReportDialogProps {
  properties: PropertyNames;
}

export function StockReportDialog({ properties }: StockReportDialogProps) {
  // The Items tab applies filters with pushState, so the URL (not server
  // props) holds the list's current filters; they're the starting values.
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [propertyId, setPropertyId] = useState("");
  const [category, setCategory] = useState("all");
  const [stock, setStock] = useState<StockLevelFilter>("all");

  const { mutate: exportReport, isPending } = useExportStockReport();

  const handleOpenChange = (next: boolean) => {
    if (next) {
      const urlStock = searchParams.get("stock") ?? undefined;
      // A report covers one property, so no property filter means "none picked yet"
      setPropertyId(searchParams.get("propertyId") ?? "");
      setCategory(searchParams.get("category") ?? "all");
      setStock(isStockFilter(urlStock) ? urlStock : "all");
    }
    setOpen(next);
  };

  const handleReset = () => {
    setPropertyId("");
    setCategory("all");
    setStock("all");
  };

  const handleDownload = () => {
    exportReport(
      { propertyId: Number(propertyId), category, stock },
      { onSuccess: () => setOpen(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-md">
          <Download className="size-4" />
          <span>Stock report</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Stock report</DialogTitle>
          <DialogDescription>
            Download a PDF of one property&apos;s store stock, with stock levels and value.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="stock-report-property">Property</Label>
            <Select value={propertyId} onValueChange={setPropertyId} disabled={isPending}>
              <SelectTrigger id="stock-report-property" className="w-full">
                <SelectValue placeholder="Select a property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id.toString()}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="stock-report-category">Category</Label>
              <Select value={category} onValueChange={setCategory} disabled={isPending}>
                <SelectTrigger id="stock-report-category" className="w-full">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock-report-stock">Stock level</Label>
              <Select
                value={stock}
                onValueChange={(value) => setStock(value as StockLevelFilter)}
                disabled={isPending}
              >
                <SelectTrigger id="stock-report-stock" className="w-full">
                  <SelectValue placeholder="All Stock Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock Levels</SelectItem>
                  {STOCK_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="ghost" onClick={handleReset} disabled={isPending}>
            Reset
          </Button>
          <Button type="button" onClick={handleDownload} disabled={isPending || !propertyId}>
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            <span>{isPending ? "Generating…" : "Download PDF"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
