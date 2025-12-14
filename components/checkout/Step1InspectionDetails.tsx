"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { CheckoutFormData } from "@/lib/schemas/checkout";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2,
  User,
  Phone,
  House,
  Calendar,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookingsForCheckout } from "@/lib/types/types";

interface Step1Props {
  selectedBooking: BookingsForCheckout[number] | null;
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
}

export function Step1InspectionDetails({
  selectedBooking,
  register,
  errors,
}: Step1Props) {
  return (
    <article className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-foreground">
          Inspector Details
        </h3>
        <p className="text-muted-foreground mt-1">
          Record checkout date, inspector, and initial notes
        </p>
      </div>

      {selectedBooking && (
        <Card className="border-0 shadow-sm bg-card">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-6">Booking Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Property */}
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-chart-1/10 mt-1">
                  <Building2 className="h-5 w-5 text-chart-1" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Property
                  </p>
                  <p className="text-base font-semibold">
                    {selectedBooking.property.name}
                  </p>
                </div>
              </div>

              {/* Unit */}
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-chart-2/10 mt-1">
                  <House className="h-5 w-5 text-chart-2" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Unit
                  </p>
                  <p className="text-base font-semibold">
                    {selectedBooking.unit.name}
                  </p>
                </div>
              </div>

              {/* Guest */}
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-chart-3/10 mt-1">
                  <User className="h-5 w-5 text-chart-3" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Guest
                  </p>
                  <p className="text-base font-semibold">
                    {selectedBooking.guest.firstName}{" "}
                    {selectedBooking.guest.lastName}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-chart-4/10 mt-1">
                  <Phone className="h-5 w-5 text-chart-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Phone
                  </p>
                  <p className="text-base font-semibold">
                    {selectedBooking.guest.phone}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-sm bg-card">
        <CardContent className="p-6 space-y-6">
          {/* Checkout date */}
          <div className="space-y-2">
            <Label
              htmlFor="checkoutDate"
              className="text-base font-medium flex items-center gap-2"
            >
              <Calendar className="h-4 w-4 text-chart-1" />
              Checkout Date
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="checkoutDate"
              type="date"
              {...register("checkoutDate")}
              className={cn(
                "h-11 border-2",
                errors.checkoutDate
                  ? "border-red-500 focus-visible:ring-red-500"
                  : "focus:border-chart-1"
              )}
            />
            {errors.checkoutDate && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                {errors.checkoutDate.message}
              </p>
            )}
          </div>

          {/* Inspector */}
          <div className="space-y-2">
            <Label
              htmlFor="inspector"
              className="text-base font-medium flex items-center gap-2"
            >
              <ClipboardCheck className="h-4 w-4 text-chart-2" />
              Inspector Name
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="inspector"
              type="text"
              placeholder="Enter inspector's full name"
              {...register("inspector")}
              className={cn(
                "h-11 border-2",
                errors.inspector && "border-red-500"
              )}
            />
            {errors.inspector && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                {errors.inspector.message}
              </p>
            )}
          </div>
          {/* Overall inspection Notes  */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-base font-medium">
              Overall Inspection Notes{" "}
              <span className="text-muted-foreground font-normal">
                (Optional)
              </span>
            </Label>
            <Textarea
              id="notes"
              placeholder="General observations, guest cooperation, unit condition..."
              {...register("notes")}
              className="min-h-[120px] resize-none border-2 focus:border-chart-3"
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              You can add specific item notes in the next step
            </p>
          </div>
        </CardContent>
      </Card>
    </article>
  );
}
