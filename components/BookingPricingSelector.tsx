"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Moon, Calendar, CalendarDays, CalendarRange } from "lucide-react";
import { getUnitPricingOptions } from "@/lib/actions/pricing";
import {
  getDurationLabel,
  formatPrice,
  formatDate,
  calculateDiscountedPrice,
  hasDiscount,
  cn,
} from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import type { PriceDuration, UnitTypePricing } from "@/lib/types/types";

interface BookingPricingSelectorProps {
  unitId: number;
  selectedDuration: PriceDuration | null;
  onSelect: (pricing: UnitTypePricing) => void;
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
  onSelect,
}: BookingPricingSelectorProps) {
  const { data: pricingOptions, isLoading } = useQuery({
    queryKey: ["pricing-options", unitId],
    queryFn: async () => {
      return await getUnitPricingOptions(unitId);
    },
    enabled: !!unitId,
  });

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
                pricing.duration === "custom" && "md:col-span-2",
              )}
            >
              <Card
                className={cn(
                  "transition-all flex-1 ring-0 py-2",
                  isSelected ? "border-primary" : "hover:border-primary/50",
                )}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <RadioGroupItem
                    value={pricing.duration}
                    id={pricing.duration}
                    hidden={true}
                  />

                  <div
                    className={cn(
                      "size-10 rounded-lg flex items-center justify-center",
                      isSelected ? "bg-primary/10" : "bg-muted",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-5",
                        isSelected ? "text-primary" : "text-muted-foreground",
                      )}
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
    </div>
  );
}
