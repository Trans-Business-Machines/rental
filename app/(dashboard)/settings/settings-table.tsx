"use client";

import { useState } from "react";
import { useSettings, useDeletePricing } from "@/hooks/useSettings";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Loader2, Trash2 } from "lucide-react";
import {
  formatDiscount,
  getDurationLabel,
  hasDiscount,
  formatDate,
  calculateDiscountedPrice,
} from "@/lib/utils";
import { PricingEditDialog } from "@/components/PricingEditDialog";
import type { UnitTypePricing } from "@/lib/types/types";
import { Price } from "@/components/Price";

function SettingsTable() {
  const { data: pricings, isLoading, error, refetch } = useSettings();
  const deletePricingMutation = useDeletePricing();

  const [selectedPricing, setSelectedPricing] =
    useState<UnitTypePricing | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleEdit = (pricing: UnitTypePricing) => {
    setSelectedPricing(pricing);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (pricing: UnitTypePricing) => {
    setSelectedPricing(pricing);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedPricing) {
      deletePricingMutation.mutate(selectedPricing.id, {
        onSuccess: () => {
          setIsDeleteOpen(false);
          setSelectedPricing(null);
        },
      });
    }
  };

  if (isLoading) {
    return (
      <section className="min-h-[50vh] grid place-items-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="text-primary size-5 animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">
            Loading settings.
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center space-y-3">
        <p className="text-destructive font-medium">
          Failed to load pricing settings
        </p>
        <Button variant="outline" size="lg" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Table */}
      {!pricings || pricings.length === 0 ? (
        <div className="rounded-lg border border-border p-6 text-center">
          <p className="text-muted-foreground">
            No pricing configurations found. Add one to get started.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
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
                  Price
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Discount
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-foreground text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricings.map((pricing) => {
                const discountedPrice = calculateDiscountedPrice(
                  pricing.price,
                  pricing.discountRate,
                );

                return (
                  <TableRow key={pricing.id}>
                    <TableCell className="font-medium capitalize">
                      {pricing.unitType}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{getDurationLabel(pricing.duration)}</p>
                        {pricing.duration === "custom" &&
                          pricing.fromDate &&
                          pricing.toDate && (
                            <p className="text-xs text-muted-foreground">
                              {formatDate(pricing.fromDate)} -{" "}
                              {formatDate(pricing.toDate)}
                            </p>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {pricing.nights}{" "}
                      {pricing.nights === 1 ? "night" : "nights"}
                    </TableCell>
                    <TableCell>
                      {hasDiscount(pricing.discountRate) ? (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground line-through">
                            <Price kes={pricing.price} />
                          </p>
                          <p className="font-semibold text-primary">
                            <Price kes={discountedPrice} />
                          </p>
                        </div>
                      ) : (
                        <p className="font-semibold text-primary">
                          <Price kes={pricing.price} />
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {hasDiscount(pricing.discountRate) ? (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-700"
                        >
                          {formatDiscount(pricing.discountRate)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={pricing.isActive ? "default" : "secondary"}
                      >
                        {pricing.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(pricing)}
                          className="cursor-pointer gap-1 hover:bg-primary/10 hover:text-primary"
                        >
                          <Edit className="size-4" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(pricing)}
                          className="cursor-pointer gap-1 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Dialog */}
      {selectedPricing && (
        <PricingEditDialog
          pricing={selectedPricing}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pricing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the pricing for{" "}
              <span className="font-medium text-foreground">
                {selectedPricing?.unitType}
              </span>{" "}
              ({getDurationLabel(selectedPricing?.duration || "")})? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePricingMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deletePricingMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePricingMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export { SettingsTable };
