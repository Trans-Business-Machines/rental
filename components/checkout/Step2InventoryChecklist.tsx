"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type UseFormWatch,
  type UseFormSetValue,
  type Control,
  useFieldArray,
} from "react-hook-form";
import type { CheckoutFormData } from "@/lib/schemas/checkout";
import { useEffect } from "react";
import type { AggregatedAssignment } from "@/lib/actions/checkout";
import { Package, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface Step2Props {
  assignments: AggregatedAssignment[];
  watch: UseFormWatch<CheckoutFormData>;
  setValue: UseFormSetValue<CheckoutFormData>;
  control: Control<CheckoutFormData>;
}

export function Step2InventoryChecklist({
  assignments,
  watch,
  setValue,
  control,
}: Step2Props) {
  const { fields, replace } = useFieldArray({
    control,
    name: "checkoutItems",
  });

  // Initialize aggregated items
  useEffect(() => {
    if (assignments.length > 0 && fields.length === 0) {
      const initialItems = assignments.map((item) => ({
        itemId: item.itemId,
        itemName: item.itemName,
        category: item.category,
        totalQuantity: item.totalQuantity,
        damagedCount: 0,
        missingCount: 0,
        assignmentIds: item.assignmentIds,
      }));
      replace(initialItems);
    }
  }, [assignments, fields.length, replace]);

  const checkoutItems = watch("checkoutItems") || [];

  // Summary calculations
  const totalItems = checkoutItems.reduce((sum, i) => sum + i.totalQuantity, 0);
  const totalDamaged = checkoutItems.reduce(
    (sum, i) => sum + i.damagedCount,
    0,
  );
  const totalMissing = checkoutItems.reduce(
    (sum, i) => sum + i.missingCount,
    0,
  );
  const totalGood = totalItems - totalDamaged - totalMissing;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Inventory Checklist</h2>
        <p className="text-muted-foreground">
          Report any damaged or missing items. Items not flagged are assumed to
          be in good condition.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Item list */}
        <div className="lg:col-span-2 space-y-3 pb-4 lg:pb-0">
          {assignments.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">
                    No assignable items found
                  </p>
                  <p className="text-sm">
                    This unit has no items that were assigned to the guest.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {checkoutItems.map((item, index) => {
                const hasIssues =
                  item.damagedCount > 0 || item.missingCount > 0;
                const isOverflow =
                  item.damagedCount + item.missingCount > item.totalQuantity;

                return (
                  <Card
                    key={item.itemId}
                    className={hasIssues ? "border-amber-300" : ""}
                  >
                    <CardContent className="p-4 space-y-3">
                      {/* Item header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium capitalize">
                            {item.itemName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.category}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                          {item.totalQuantity} assigned
                        </span>
                      </div>

                      {/* Damaged / Missing inputs */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor={`damaged-${index}`}
                            className="text-sm flex items-center gap-1.5"
                          >
                            <AlertCircle className="size-3.5 text-amber-500" />
                            Damaged
                          </Label>
                          <Input
                            id={`damaged-${index}`}
                            type="number"
                            min={0}
                            max={item.totalQuantity - item.missingCount}
                            value={item.damagedCount || ""}
                            placeholder="0"
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              const clamped = Math.min(
                                val,
                                item.totalQuantity - item.missingCount,
                              );
                              setValue(
                                `checkoutItems.${index}.damagedCount`,
                                Math.max(0, clamped),
                              );
                            }}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label
                            htmlFor={`missing-${index}`}
                            className="text-sm flex items-center gap-1.5"
                          >
                            <XCircle className="size-3.5 text-red-500" />
                            Missing
                          </Label>
                          <Input
                            id={`missing-${index}`}
                            type="number"
                            min={0}
                            max={item.totalQuantity - item.damagedCount}
                            value={item.missingCount || ""}
                            placeholder="0"
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              const clamped = Math.min(
                                val,
                                item.totalQuantity - item.damagedCount,
                              );
                              setValue(
                                `checkoutItems.${index}.missingCount`,
                                Math.max(0, clamped),
                              );
                            }}
                          />
                        </div>
                      </div>

                      {isOverflow && (
                        <p className="text-xs text-red-500">
                          Damaged + missing cannot exceed {item.totalQuantity}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Summary sidebar */}
        <div className="block lg:col-span-1 pb-14 lg:pb-0">
          <Card className="sticky top-4">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                Inspection Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-primary/5 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">
                  Unique Items
                </p>
                <p className="text-3xl font-bold text-primary">
                  {assignments.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalItems} individual items total
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <div className="flex justify-between items-center text-sm p-2 rounded-md bg-green-50">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="font-medium">Good</span>
                  </div>
                  <span className="font-bold text-green-500">{totalGood}</span>
                </div>
                <div className="flex justify-between items-center text-sm p-2 rounded-md bg-amber-50">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span className="font-medium">Damaged</span>
                  </div>
                  <span className="font-bold text-amber-500">
                    {totalDamaged}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm p-2 rounded-md bg-red-50">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="font-medium">Missing</span>
                  </div>
                  <span className="font-bold text-red-500">{totalMissing}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
