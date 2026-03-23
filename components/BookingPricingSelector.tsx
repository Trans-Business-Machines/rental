"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Moon,
  Calendar,
  CalendarDays,
  CalendarRange,
  Minus,
  Plus,
} from "lucide-react";
import { getUnitPricingOptions } from "@/lib/actions/pricing";
import {
  getDurationLabel,
  formatPrice,
  getPeriodLabel,
  calculateTotalNights,
  calculateTotalAmount,
  calculateDiscountedPrice,
  hasDiscount,
  formatDate,
  cn,
} from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import type { PriceDuration, UnitTypePricing } from "@/lib/types/types";

interface BookingPricingSelectorProps {
  unitId: number;
  selectedDuration: PriceDuration | null;
  period: number;
  onSelect: (pricing: UnitTypePricing) => void;
  onPeriodChange: (period: number) => void;
}

const durationIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  one_night: Moon,
  weekly: Calendar,
  monthly: CalendarDays,
  custom: CalendarRange,
};

export function BookingPricingSelector({
  unitId,
  selectedDuration,
  period,
  onSelect,
  onPeriodChange,
}: BookingPricingSelectorProps) {
  const { data: pricingOptions, isLoading } = useQuery({
    queryKey: ["pricing-options", unitId],
    queryFn: async () => {
      return await getUnitPricingOptions(unitId);
    },
    enabled: !!unitId,
  });

  const selectedPricing = pricingOptions?.find(
    (p) => p.duration === selectedDuration,
  );

  // Calculate discounted price if discount exists
  const unitPriceAfterDiscount = selectedPricing
    ? calculateDiscountedPrice(
        selectedPricing.price,
        selectedPricing.discountRate,
      )
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!pricingOptions || pricingOptions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No pricing options available for this unit type.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Duration Selection */}
      <RadioGroup
        value={selectedDuration || undefined}
        onValueChange={(value) => {
          const pricing = pricingOptions.find((p) => p.duration === value);
          if (pricing) {
            onSelect(pricing);
            // Reset period to 1, except for custom which is always 1
            onPeriodChange(1);
          }
        }}
        className="grid md:grid-cols-2 gap-3"
      >
        {pricingOptions.map((pricing) => {
          const Icon = durationIcons[pricing.duration] || Calendar;
          const isSelected = selectedDuration === pricing.duration;
          const discountedPrice = calculateDiscountedPrice(
            pricing.price,
            pricing.discountRate,
          );
          const showDiscount = hasDiscount(pricing.discountRate);

          return (
            <Label
              key={pricing.id}
              htmlFor={pricing.duration}
              className={cn(
                "cursor-pointer",
                pricing.duration === "monthly" && "md:col-span-2",
              )}
            >
              <Card
                className={`transition-all flex-1 ring-0 py-2  ${
                  isSelected ? "border-primary" : "hover:border-primary/50"
                }`}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <RadioGroupItem
                    value={pricing.duration}
                    id={pricing.duration}
                    hidden={true}
                  />

                  <div
                    className={`size-10 rounded-lg flex items-center justify-center ${
                      isSelected ? "bg-primary/10" : "bg-muted"
                    }`}
                  >
                    <Icon
                      className={`size-5 ${
                        isSelected ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">
                        {getDurationLabel(pricing.duration)}
                      </p>
                      {showDiscount && (
                        <span className="text-xs font-medium text-green-600 bg-green-100 px-1.5 py-0.5 rounded">
                          {Math.round((pricing.discountRate || 0) * 100)}% off
                        </span>
                      )}
                    </div>
                    {pricing.duration === "custom" &&
                    pricing.fromDate &&
                    pricing.toDate ? (
                      <p className="text-sm text-muted-foreground">
                        {formatDate(pricing.fromDate)} -{" "}
                        {formatDate(pricing.toDate)}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {pricing.nights}{" "}
                        {pricing.nights === 1 ? "night" : "nights"} stay
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    {showDiscount ? (
                      <div className="space-y-0.5">
                        <p className="text-sm text-muted-foreground line-through">
                          {formatPrice(pricing.price)}
                        </p>
                        <p className="text-lg font-bold text-primary">
                          {formatPrice(discountedPrice)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-lg font-bold text-foreground">
                        {formatPrice(pricing.price)}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Label>
          );
        })}
      </RadioGroup>

      {/* Period Selector - Only show when duration is selected and not custom */}
      {selectedDuration && selectedPricing && selectedDuration !== "custom" && (
        <div className="space-y-3 pt-2">
          <Label>How many {getPeriodLabel(selectedDuration)}?</Label>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => onPeriodChange(Math.max(1, period - 1))}
              className="cursor-pointer w-1/12"
              disabled={period <= 1}
            >
              <Minus className="size-4" />
            </Button>

            <Input
              type="number"
              value={period}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val >= 1) {
                  onPeriodChange(val);
                }
              }}
              className="w-10/12 text-center"
              min={1}
            />

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="w-1/12 cursor-pointer"
              onClick={() => onPeriodChange(period + 1)}
            >
              <Plus className="size-4" />
            </Button>

            <span className="text-sm text-muted-foreground">
              {getPeriodLabel(selectedDuration)}
            </span>
          </div>

          {/* Total Calculation */}
          <div className="p-4 rounded-lg bg-muted">
            <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
              <span>
                {formatPrice(unitPriceAfterDiscount)} × {period}{" "}
                {getPeriodLabel(selectedDuration)}
              </span>
              <span>
                {calculateTotalNights(selectedDuration, period)} nights total
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Amount</span>
              <span className="text-2xl font-bold text-foreground">
                {formatPrice(
                  calculateTotalAmount(unitPriceAfterDiscount, period),
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Custom Duration - Show fixed total (period is always 1) */}
      {selectedDuration === "custom" && selectedPricing && (
        <div className="p-4 rounded-lg bg-muted">
          <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
            <span>
              {selectedPricing.fromDate && selectedPricing.toDate && (
                <>
                  {formatDate(selectedPricing.fromDate)} -{" "}
                  {formatDate(selectedPricing.toDate)}
                </>
              )}
            </span>
            <span>
              {calculateTotalNights(
                selectedDuration,
                1,
                selectedPricing.fromDate,
                selectedPricing.toDate,
              )}{" "}
              nights total
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Amount</span>
            <span className="text-2xl font-bold text-foreground">
              {formatPrice(unitPriceAfterDiscount)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
