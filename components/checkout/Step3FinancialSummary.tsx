"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UseFormWatch, UseFormRegister, FieldErrors } from "react-hook-form";
import { CheckoutFormData } from "@/lib/schemas/checkout";
import {
  AlertCircle,
  CheckCircle2,
  CircleCheck,
  XCircle,
  User,
  Mail,
  ShieldUser,
  Book,
  Building,
  House,
  Calendar,
  Info,
  MessageSquareWarning,
} from "lucide-react";
import type {
  BookingsForCheckout,
  InventoryAssignmentForUnit,
} from "@/lib/types/types";

interface Step3Props {
  selectedBooking: BookingsForCheckout[number] | null;
  assignments: InventoryAssignmentForUnit;
  watch: UseFormWatch<CheckoutFormData>;
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
}

export function Step3FinancialSummary({
  selectedBooking,
  assignments,
  watch,
  register,
  errors,
}: Step3Props) {
  const formData = watch();
  const checkoutItems = formData.checkoutItems || [];

  const checkedItems = checkoutItems.filter((item) => item.checked);

  const damagedItems = checkedItems.filter(
    (item) => item.condition === "damaged"
  );
  const missingItems = checkedItems.filter(
    (item) => item.condition === "missing"
  );

  const totalDamage = checkoutItems.reduce((total, item) => {
    return total + (item.checked ? item.damageCost : 0);
  }, 0);

  const depositDeduction = formData.depositDeduction || 0;

  return (
    <div className="space-y-6 pb-12 md:pb-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Financial Summary</h2>
        <p className="text-muted-foreground">
          Review checkout details and finalize the report
        </p>
      </div>

      {/* Guest & Unit Info */}
      {selectedBooking && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Checkout Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <article className="flex gap-3 items-start">
                <div className="p-2 rounded-lg bg-chart-1/20 flex items-center justify-center">
                  <User className="text-chart-1 size-6" />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Guest&apos;s name
                  </p>
                  <p className="font-medium">
                    {selectedBooking.guest.firstName}{" "}
                    {selectedBooking.guest.lastName}
                  </p>
                </div>
              </article>

              <article className="flex gap-3 items-start">
                <div className="p-2 rounded-lg bg-chart-1/20 flex items-center justify-center">
                  <Mail className="text-chart-1 size-6" />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Guest&apos;s email
                  </p>
                  <p className="font-medium">{selectedBooking.guest.email}</p>
                </div>
              </article>

              <article className="flex gap-3 items-start">
                <div className="p-2 rounded-lg bg-chart-2/20 flex items-center justify-center">
                  <Building className="text-chart-2 size-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Property</p>
                  <p className="font-medium">{selectedBooking.property.name}</p>
                </div>
              </article>

              <article className="flex gap-3 items-start">
                <div className="p-2 rounded-lg bg-chart-2/20 flex items-center justify-center">
                  <House className="text-chart-2 size-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unit</p>
                  <p className="font-medium">{selectedBooking.unit.name}</p>
                </div>
              </article>

              <article className="flex gap-3 items-start">
                <div className="p-2 rounded-lg bg-chart-4/20 flex items-center justify-center">
                  <ShieldUser className="text-chart-4 size-6" />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Inspector</p>
                  <p className="font-medium">{formData.inspector}</p>
                </div>
              </article>

              <article className="flex gap-3 items-start">
                <div className="p-2 rounded-lg bg-chart-4/20 flex items-center justify-center">
                  <Calendar className="text-chart-4 size-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Checkout Date</p>
                  <p className="font-medium">
                    {formData.checkoutDate
                      ? new Date(formData.checkoutDate).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
              </article>
            </div>

            {formData.notes && (
              <article className="flex gap-3 items-start">
                <div className="p-2 rounded-lg bg-chart-3-4/30 flex items-center justify-center">
                  <Book className="text-chart-3 size-6" />
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-1">
                    Inspection Notes
                  </p>
                  <p className="text-sm">{formData.notes}</p>
                </div>
              </article>
            )}
          </CardContent>
        </Card>
      )}

      {/* Inventory Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Inventory Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-green-50 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-500">
                {checkedItems.length -
                  damagedItems.length -
                  missingItems.length}
              </p>
              <p className="text-sm text-muted-foreground">Good</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-amber-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-amber-500">
                {damagedItems.length}
              </p>
              <p className="text-sm text-muted-foreground">Damaged</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <XCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-500">
                {missingItems.length}
              </p>
              <p className="text-sm text-muted-foreground">Missing</p>
            </div>
          </div>

          {/* Damaged/Missing items details */}
          {(damagedItems.length > 0 || missingItems.length > 0) && (
            <div className="pt-4 border-t space-y-3">
              <p className="font-medium text-sm">Damage Details:</p>
              {[...damagedItems, ...missingItems].map((item) => {
                const assignment = assignments.find(
                  (a) => a.id === item.assignmentId
                );
                if (!assignment) return null;

                return (
                  <div
                    key={item.assignmentId}
                    className="flex justify-between items-start p-3 bg-gray-50 rounded"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {assignment.inventoryItem.itemName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {assignment.inventoryItem.category} •{" "}
                        <span
                          className={
                            item.condition === "damaged"
                              ? "text-amber-500"
                              : "text-red-500"
                          }
                        >
                          {item.condition}
                        </span>
                      </p>
                      {item.notes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.notes}
                        </p>
                      )}
                    </div>
                    <p className="font-bold text-red-500">
                      KES {item.damageCost.toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Financial Details</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-1 border-b">
              <span className="text-muted-foreground">Total Damage Cost</span>
              <span className="text-xl font-bold text-red-500">
                KES {totalDamage.toLocaleString()}
              </span>
            </div>

            <div className="space-y-2 pt-2">
              <Label htmlFor="depositDeduction">
                Deposit Deduction (KES) *
              </Label>
              <Input
                id="depositDeduction"
                type="number"
                placeholder="0"
                min="0"
                max={totalDamage}
                {...register("depositDeduction")}
                className={errors.depositDeduction && "border-red-500"}
              />
              {errors.depositDeduction && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.depositDeduction.message}
                </p>
              )}

              <p className="text-xs text-muted-foreground mt-1">
                Amount to deduct from guest&apos;s deposit (max: KES{" "}
                {totalDamage.toLocaleString()})
              </p>
            </div>

            {depositDeduction > totalDamage && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm space-x-2 text-amber-500 flex items-center">
                  <MessageSquareWarning className="text-amber-500 size-4" />
                  <span>Deduction exceeds total damage cost</span>
                </p>
              </div>
            )}

            <div className="flex justify-between items-center pt-1 border-t">
              <span className="font-medium">Amount to Deduct</span>
              <span className="text-2xl font-bold">
                KES {depositDeduction.toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checkout checklist */}
      <Card className="border-blue-500 bg-blue-50">
        <CardContent>
          <p className="text-sm  flex items-center gap-2 font-medium mb-2 text-blue-500">
            <Info className="size-5 text-blue-500" />
            <span>Before completing ensure:</span>
          </p>
          <ul className="text-sm pl-5 md:pl-8 space-y-2 text-muted-foreground">
            <li className="flex item-center gap-3">
              <CircleCheck className="size-5 text-blue-400" />{" "}
              <span>All inventory items have been checked</span>
            </li>
            <li className="flex item-center gap-3">
              <CircleCheck className="size-5 text-blue-400" />
              <span>Damage costs have been accurately recorded</span>
            </li>
            <li className="flex item-center gap-3">
              <CircleCheck className="size-5 text-blue-400" />
              <span>Deposit deduction amount is correct</span>
            </li>
            <li className="flex item-center gap-3">
              <CircleCheck className="size-5 text-blue-400" />
              <span>Guest has been informed of any deductions</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
