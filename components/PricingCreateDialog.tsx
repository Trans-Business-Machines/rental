"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useCreatePricing } from "@/hooks/useSettings";
import { formatPrice, calculateDiscountedPrice, cn } from "@/lib/utils";
import { PricingFormSchema, type PricingFormData } from "@/lib/schemas/pricing";
import type { PriceDuration } from "@/lib/types/types";

interface PricingCreateDialogProps {
  children: React.ReactNode;
}

const UNIT_TYPES = ["1 bedroom", "2 bedroom"];

export function PricingCreateDialog({ children }: PricingCreateDialogProps) {
  const [open, onOpenChange] = useState(false);
  const createPricingMutation = useCreatePricing();

  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PricingFormData>({
    resolver: zodResolver(PricingFormSchema),
    defaultValues: {
      unitType: "",
      duration: "one_night",
      price: 0,
      nights: null,
      fromDate: null,
      toDate: null,
      discountRate: null,
      isActive: true,
    },
  });

  const watchedDuration = watch("duration");
  const watchedPrice = watch("price");
  const watchedDiscountPercent = watch("discountRate");

  // Convert percentage to decimal for calculations
  const discountDecimal = watchedDiscountPercent
    ? watchedDiscountPercent / 100
    : null;

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      reset({
        unitType: "",
        duration: "one_night",
        price: 0,
        nights: null,
        fromDate: null,
        toDate: null,
        discountRate: null,
        isActive: true,
      });
    }
  }, [open, reset]);

  // Clear custom date fields when duration changes
  useEffect(() => {
    if (watchedDuration !== "custom") {
      setValue("fromDate", null);
      setValue("toDate", null);
    }
  }, [watchedDuration, setValue]);

  const onSubmit = async (data: PricingFormData) => {
    createPricingMutation.mutate(
      {
        unitType: data.unitType,
        duration: data.duration,
        price: data.price,
        fromDate: data.fromDate,
        toDate: data.toDate,
        discountRate: data.discountRate ? data.discountRate / 100 : null,
        isActive: data.isActive,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  const discountedPrice = calculateDiscountedPrice(
    watchedPrice || 0,
    discountDecimal,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Add New Pricing
          </DialogTitle>
          <DialogDescription>
            Create a new pricing configuration for a unit type
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Unit Type */}
          <div className="space-y-2">
            <Label htmlFor="unitType">Unit Type</Label>
            <Controller
              name="unitType"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={createPricingMutation.isPending}
                >
                  <SelectTrigger
                    className={cn(
                      "w-full",
                      errors.unitType && "border-red-400",
                    )}
                  >
                    <SelectValue placeholder="Select unit type" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.unitType && (
              <p className="text-sm text-red-400">{errors.unitType.message}</p>
            )}
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Controller
              name="duration"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value: PriceDuration) =>
                    field.onChange(value)
                  }
                  disabled={createPricingMutation.isPending}
                >
                  <SelectTrigger
                    className={cn(
                      "w-full",
                      errors.duration && "border-red-400",
                    )}
                  >
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_night">
                      One Night (1 night)
                    </SelectItem>
                    <SelectItem value="weekly">Weekly (7 nights)</SelectItem>
                    <SelectItem value="monthly">Monthly (30 nights)</SelectItem>
                    <SelectItem value="custom">Custom (Date Range)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.duration && (
              <p className="text-sm text-red-400">{errors.duration.message}</p>
            )}
          </div>

          {/* Custom Date Range */}
          {watchedDuration === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromDate">From Date</Label>
                <Controller
                  name="fromDate"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="date"
                      disabled={createPricingMutation.isPending}
                      className={cn(errors.fromDate && "border-red-400")}
                      value={
                        field.value
                          ? new Date(field.value).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => {
                        const date = e.target.value
                          ? new Date(e.target.value)
                          : null;
                        field.onChange(date);
                      }}
                    />
                  )}
                />
                {errors.fromDate && (
                  <p className="text-sm text-red-400">
                    {errors.fromDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="toDate">To Date</Label>
                <Controller
                  name="toDate"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="date"
                      disabled={createPricingMutation.isPending}
                      className={cn(errors.toDate && "border-red-400")}
                      value={
                        field.value
                          ? new Date(field.value).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => {
                        const date = e.target.value
                          ? new Date(e.target.value)
                          : null;
                        field.onChange(date);
                      }}
                    />
                  )}
                />
                {errors.toDate && (
                  <p className="text-sm text-red-400">
                    {errors.toDate.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Price (KSH)</Label>
            <Input
              id="price"
              type="number"
              min={1}
              placeholder="Enter price"
              disabled={createPricingMutation.isPending}
              className={cn(errors.price && "border-red-400")}
              {...register("price", { valueAsNumber: true })}
            />
            {errors.price && (
              <p className="text-sm text-red-400">{errors.price.message}</p>
            )}
          </div>

          {/* Discount Rate */}
          <div className="space-y-2">
            <Label htmlFor="discountRate">Discount (%)</Label>
            <Input
              id="discountRate"
              type="number"
              min={0}
              max={100}
              step={1}
              placeholder="e.g., 10"
              disabled={createPricingMutation.isPending}
              className={cn(errors.discountRate && "border-red-400")}
              {...register("discountRate", {
                setValueAs: (v) => {
                  if (v === "" || v === null || v === undefined) return null;
                  const num = parseInt(v, 10);
                  return isNaN(num) ? null : num;
                },
              })}
            />
            {errors.discountRate && (
              <p className="text-sm text-red-400">
                {errors.discountRate.message}
              </p>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Active</Label>
              <p className="text-xs text-muted-foreground">
                Inactive pricing won&apos;t be available for bookings
              </p>
            </div>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Switch
                  className="cursor-pointer"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={createPricingMutation.isPending}
                />
              )}
            />
          </div>

          {/* Price Preview */}
          {watchedPrice > 0 && (
            <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
              <p className="text-sm text-muted-foreground mb-2">
                Price Preview
              </p>
              <div className="flex items-center gap-3">
                {watchedDiscountPercent && watchedDiscountPercent > 0 ? (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPrice(watchedPrice)}
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(discountedPrice)}
                    </span>
                    <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded">
                      {watchedDiscountPercent}% off
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(watchedPrice)}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              className="px-6 bg-lipstick-red hover:bg-crimson-red cursor-pointer"
              onClick={() => onOpenChange(false)}
              disabled={createPricingMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-12 bg-azure hover:bg-blue-500 cursor-pointer"
              disabled={createPricingMutation.isPending}
            >
              {createPricingMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                "Create Pricing"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
