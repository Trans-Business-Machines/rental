"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type UseFormWatch,
  type UseFormSetValue,
  type Control,
  useFieldArray,
} from "react-hook-form";
import type { CheckoutFormData } from "@/lib/schemas/checkout";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import type { InventoryAssignmentForUnit } from "@/lib/types/types";
import { Package, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface Step2Props {
  assignments: InventoryAssignmentForUnit;
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

  useEffect(() => {
    if (assignments.length > 0 && fields.length === 0) {
      const initialItems = assignments.map((assignment) => ({
        assignmentId: assignment.id,
        checked: false,
        condition: "good" as const,
        damageCost: 0,
        notes: "",
      }));

      replace(initialItems);
    }
  }, [assignments, fields.length, replace]);

  const checkoutItems = watch("checkoutItems") || [];

  const handleItemCheck = (index: number, checked: boolean) => {
    setValue(`checkoutItems.${index}.checked`, checked);
  };

  const handleConditionChange = (index: number, condition: string) => {
    setValue(
      `checkoutItems.${index}.condition`,
      condition as "good" | "damaged" | "missing"
    );
    if (condition === "good") {
      setValue(`checkoutItems.${index}.damageCost`, 0);
    }
  };

  const calculateTotalDamage = () => {
    return checkoutItems.reduce((total, item) => {
      return total + (item.checked ? item.damageCost : 0);
    }, 0);
  };

  const getCheckedCounts = () => {
    const checked = checkoutItems.filter((item) => item.checked);
    return {
      total: checked.length,
      good: checked.filter((item) => item.condition === "good").length,
      damaged: checked.filter((item) => item.condition === "damaged").length,
      missing: checked.filter((item) => item.condition === "missing").length,
    };
  };

  const counts = getCheckedCounts();
  const totalDamage = calculateTotalDamage();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Inventory Checklist</h2>
        <p className="text-muted-foreground">
          Check items being returned and note their condition
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4 pb-4 lg:pb-0">
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
              {assignments.map((assignment, index) => {
                const item = checkoutItems[index];
                if (!item) return null;

                return (
                  <Card key={assignment.id} className={cn("transition-all")}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={item.checked}
                          onCheckedChange={(checked) =>
                            handleItemCheck(index, checked as boolean)
                          }
                          className="mt-1"
                        />

                        <div className="flex-1 space-y-3 min-w-0">
                          <div>
                            <p className="font-medium truncate">
                              {assignment.inventoryItem.itemName}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                              <span className="truncate">
                                {assignment.inventoryItem.category}
                              </span>
                              {assignment.serialNumber && (
                                <>
                                  <span className="hidden sm:inline">•</span>
                                  <span className="truncate text-xs">
                                    S/N: {assignment.serialNumber}
                                  </span>
                                </>
                              )}
                            </div>
                            {assignment.notes && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                Original notes: {assignment.notes}
                              </p>
                            )}
                          </div>

                          {item.checked && (
                            <div className="space-y-3 pt-2 border-t">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                <div
                                  className={cn(
                                    "space-y-1.5",
                                    item.condition === "good"
                                      ? "sm:col-span-2"
                                      : "sm:col-span-1"
                                  )}
                                >
                                  <Label htmlFor={`condition-${index}`}>
                                    Condition
                                  </Label>
                                  <Select
                                    value={item.condition}
                                    onValueChange={(value) =>
                                      handleConditionChange(index, value)
                                    }
                                  >
                                    <SelectTrigger
                                      id={`condition-${index}`}
                                      className="w-full"
                                    >
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="good">
                                        <div className="flex items-center gap-2">
                                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                                          Good
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="damaged">
                                        <div className="flex items-center gap-2">
                                          <AlertCircle className="w-4 h-4 text-amber-500" />
                                          Damaged
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="missing">
                                        <div className="flex items-center gap-2">
                                          <XCircle className="w-4 h-4 text-red-500" />
                                          Missing
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {(item.condition === "damaged" ||
                                  item.condition === "missing") && (
                                  <div className="space-y-1.5">
                                    <Label htmlFor={`damage-cost-${index}`}>
                                      {item.condition === "missing"
                                        ? "Replacement Cost (KES)"
                                        : "Damage Cost (KES)"}
                                    </Label>
                                    <Input
                                      id={`damage-cost-${index}`}
                                      type="number"
                                      placeholder="0"
                                      min="0"
                                      value={item.damageCost || ""}
                                      onChange={(e) =>
                                        setValue(
                                          `checkoutItems.${index}.damageCost`,
                                          Number.parseInt(e.target.value) || 0
                                        )
                                      }
                                    />
                                  </div>
                                )}
                              </div>

                              {(item.condition === "damaged" ||
                                item.condition === "missing") && (
                                <div className="space-y-1.5">
                                  <Label htmlFor={`notes-${index}`}>
                                    Notes (Optional)
                                  </Label>
                                  <Textarea
                                    id={`notes-${index}`}
                                    placeholder="Describe the damage or provide additional details..."
                                    rows={2}
                                    value={item.notes || ""}
                                    onChange={(e) =>
                                      setValue(
                                        `checkoutItems.${index}.notes`,
                                        e.target.value
                                      )
                                    }
                                    className="resize-none"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

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
                  Items Checked
                </p>
                <p className="text-3xl font-bold text-primary">
                  {counts.total}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  of {assignments.length} total
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <div className="flex justify-between items-center text-sm p-2 rounded-md bg-green-50">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="font-medium">Good Condition</span>
                  </div>
                  <span className="font-bold text-green-500">
                    {counts.good}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm p-2 rounded-md bg-amber-50">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span className="font-medium">Damaged</span>
                  </div>
                  <span className="font-bold text-amber-500">
                    {counts.damaged}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm p-2 rounded-md bg-red-50">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="font-medium">Missing</span>
                  </div>
                  <span className="font-bold text-red-500">
                    {counts.missing}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="bg-red-50  rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Total Damage Cost</p>
                  <p className="text-2xl font-bold text-red-500">
                    KES {totalDamage.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
