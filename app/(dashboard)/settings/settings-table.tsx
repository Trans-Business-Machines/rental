// components/SettingsTable.tsx
"use client";

import { useState } from "react";
import { useSettings } from "@/hooks/useSettings";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Loader2 } from "lucide-react";
import { formatPrice, getDurationLabel } from "@/lib/utils";
import { PricingEditDialog } from "./price-edit-dialog";
import type { UnitTypePricing } from "@/lib/types/types";

function SettingsTable() {
  const { data: pricings, isLoading, error, refetch } = useSettings();
  const [selectedPricing, setSelectedPricing] =
    useState<UnitTypePricing | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleEdit = (pricing: UnitTypePricing) => {
    setSelectedPricing(pricing);
    setIsEditOpen(true);
  };

  if (isLoading) {
    return (
      <section className="min-h-[50vh] grid place-items-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="text-azure size-5 animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">
            Loading settings.
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-destructive font-medium">
          Failed to load pricing settings
        </p>
        <Button variant="outline" size="lg" onClick={() => refetch()}>
          Refetch settings
        </Button>
      </div>
    );
  }

  if (!pricings || pricings.length === 0) {
    return (
      <div className="rounded-lg border border-border p-6 text-center">
        <p className="text-muted-foreground">
          No pricing configurations found.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table className="px-3">
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold text-foreground">
                Unit Type
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Duration
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Nights
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Price (KSH)
              </TableHead>
              <TableHead className="font-semibold text-foreground text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pricings.map((pricing) => (
              <TableRow key={pricing.id}>
                <TableCell className="font-medium capitalize">
                  {pricing.unitType}
                </TableCell>
                <TableCell>{getDurationLabel(pricing.duration)}</TableCell>
                <TableCell>
                  {pricing.nights} {pricing.nights === 1 ? "night" : "nights"}
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  {formatPrice(pricing.price)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(pricing)}
                    className="gap-2 hover:bg-primary/10 hover:text-primary"
                  >
                    <Edit className="size-4" />
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedPricing && (
        <PricingEditDialog
          pricing={selectedPricing}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
        />
      )}
    </>
  );
}

export { SettingsTable };
