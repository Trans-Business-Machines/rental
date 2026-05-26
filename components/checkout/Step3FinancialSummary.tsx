"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Building,
  House,
  Calendar,
  Info,
} from "lucide-react";
import type { BookingsForCheckout } from "@/lib/types/types";
import type { AggregatedAssignment } from "@/lib/actions/checkout";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";

interface Step3Props {
  selectedBooking: BookingsForCheckout[number] | null;
  assignments: AggregatedAssignment[];
  watch: UseFormWatch<CheckoutFormData>;
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
}

export function Step3FinancialSummary({
  selectedBooking,
  watch,
  register,
  errors,
}: Step3Props) {
  const formData = watch();
  const { currentUser } = usePermissions();
  const checkoutItems = formData.checkoutItems || [];

  // Aggregated counts
  const totalItems = checkoutItems.reduce(
    (sum, item) => sum + item.totalQuantity,
    0,
  );
  const totalDamaged = checkoutItems.reduce(
    (sum, item) => sum + item.damagedCount,
    0,
  );
  const totalMissing = checkoutItems.reduce(
    (sum, item) => sum + item.missingCount,
    0,
  );
  const totalGood = totalItems - totalDamaged - totalMissing;

  // Items with issues for the detail list
  const itemsWithIssues = checkoutItems.filter(
    (item) => item.damagedCount > 0 || item.missingCount > 0,
  );

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
                {currentUser?.name && (
                  <div>
                    <p className="text-sm text-muted-foreground">Inspector</p>
                    <p className="font-medium">{currentUser.name}</p>
                  </div>
                )}
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
              <p className="text-2xl font-bold text-green-500">{totalGood}</p>
              <p className="text-sm text-muted-foreground">Good</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-amber-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-amber-500">
                {totalDamaged}
              </p>
              <p className="text-sm text-muted-foreground">Damaged</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <XCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-500">{totalMissing}</p>
              <p className="text-sm text-muted-foreground">Missing</p>
            </div>
          </div>

          {/* Items with issues */}
          {itemsWithIssues.length > 0 && (
            <div className="pt-4 border-t space-y-3">
              <p className="font-medium text-sm">Items with Issues:</p>
              {itemsWithIssues.map((item) => (
                <div
                  key={item.itemId}
                  className="flex justify-between items-start p-3 bg-gray-50 rounded"
                >
                  <div>
                    <p className="font-medium text-sm capitalize">{item.itemName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.category} • {item.totalQuantity} total
                    </p>
                  </div>
                  <div className="flex gap-3 text-xs font-medium">
                    {item.damagedCount > 0 && (
                      <span className="text-amber-500 flex items-center gap-1">
                        <AlertCircle className="size-3.5" />
                        {item.damagedCount} damaged
                      </span>
                    )}
                    {item.missingCount > 0 && (
                      <span className="text-red-500 flex items-center gap-1">
                        <XCircle className="size-3.5" />
                        {item.missingCount} missing
                      </span>
                    )}
                  </div>
                </div>
              ))}
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
            <div className="space-y-2">
              {/* Financial Details - damage cost label */}
              <Label htmlFor="overallDamageCost">
                Total Damage / Replacement Cost (KES){" "}
                {itemsWithIssues.length > 0 && (
                  <span className="text-red-500">*</span>
                )}
              </Label>
              <Input
                id="overallDamageCost"
                type="number"
                placeholder="Enter the damage cost, e.g 500 or 0 when no items have been damaged."
                min="0"
                {...register("overallDamageCost", { valueAsNumber: true })}
                className={cn("py-3",
                  errors.overallDamageCost && "border-red-500",
                  itemsWithIssues.length > 0 &&
                    (!formData.overallDamageCost ||
                      formData.overallDamageCost <= 0) &&
                    "border-red-500",
                )}
              />
              {errors.overallDamageCost && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.overallDamageCost.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Enter the total cost for all damaged and missing items
              </p>
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <span className="font-medium">Total Damage Cost</span>
              <span className="text-2xl font-bold text-red-500">
                KES {(formData.overallDamageCost || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Checkout Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Notes label */}
            <Label htmlFor="notes">
              Notes{" "}
              {itemsWithIssues.length > 0 ? (
                <span className="text-red-500">*</span>
              ) : (
                "(Optional)"
              )}
            </Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes about the checkout, damages, or guest interactions..."
              rows={6}
              {...register("notes")}
              className={cn(
                itemsWithIssues.length > 0 &&
                  (!formData.notes || formData.notes.trim() === "") &&
                  "border-red-500",
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Checkout checklist */}
      <Card className="border-blue-500 bg-blue-50">
        <CardContent>
          <p className="text-sm flex items-center gap-2 font-medium mb-2 text-blue-500">
            <Info className="size-6 text-blue-500" />
            <span>Before completing ensure:</span>
          </p>
          <ul className="text-sm pl-5 md:pl-8 space-y-2 text-muted-foreground">
            <li className="flex item-center gap-3">
              <CircleCheck className="size-5 text-blue-500" />
              <span>All inventory items have been reviewed</span>
            </li>
            <li className="flex item-center gap-3">
              <CircleCheck className="size-5 text-blue-500" />
              <span>Damage and replacement costs are accurately entered</span>
            </li>
            <li className="flex item-center gap-3">
              <CircleCheck className="size-5 text-blue-500" />
              <span>Guest has been informed of any deductions</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
