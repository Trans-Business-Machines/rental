"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Bed } from "lucide-react";
import { useUpdatePricing } from "@/hooks/useSettings";
import { getDurationLabel, formatPrice, cn } from "@/lib/utils";
import {
  PricingEditSchema,
  type PricingEditFormData,
} from "@/lib/schemas/pricing";
import type { UnitTypePricing, PriceDuration } from "@/lib/types/types";

interface PricingEditDialogProps {
  pricing: UnitTypePricing;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PricingEditDialog({
  pricing,
  open,
  onOpenChange,
}: PricingEditDialogProps) {
  const updatePricingMutation = useUpdatePricing();

  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PricingEditFormData>({
    resolver: zodResolver(PricingEditSchema),
    defaultValues: {
      duration: pricing.duration as PriceDuration,
      price: pricing.price,
      nights: pricing.nights,
    },
  });

  // Watch form values for preview
  const watchedDuration = watch("duration");
  const watchedPrice = watch("price");

  // Reset form when pricing changes or dialog opens
  useEffect(() => {
    if (open) {
      reset({
        duration: pricing.duration as PriceDuration,
        price: pricing.price,
        nights: pricing.nights,
      });
    }
  }, [open, pricing, reset]);

  // Update nights when duration changes
  const handleDurationChange = (duration: PriceDuration) => {
    const nights = duration === "one_night" ? 1 : 7;
    setValue("nights", nights);
  };

  const onSubmit = async (data: PricingEditFormData) => {
    updatePricingMutation.mutate(
      {
        id: pricing.id,
        duration: data.duration,
        price: data.price,
        nights: data.nights,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bed className="size-5 text-primary" />
            Edit Pricing
          </DialogTitle>
          <DialogDescription>
            Update pricing for{" "}
            <span className="font-medium text-foreground capitalize">
              {pricing.unitType}
            </span>{" "}
            apartments
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Controller
              name="duration"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value: PriceDuration) => {
                    field.onChange(value);
                    handleDurationChange(value);
                  }}
                  disabled={updatePricingMutation.isPending}
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
                  </SelectContent>
                </Select>
              )}
            />
            {errors.duration && (
              <p className="text-sm text-red-400">{errors.duration.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {watchedDuration === "one_night" ? "1 night" : "7 nights"} stay
            </p>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Price (KSH)</Label>
            <Input
              id="price"
              type="number"
              min={1}
              placeholder="Enter price"
              disabled={updatePricingMutation.isPending}
              className={cn(errors.price && "border-red-400")}
              {...register("price", { valueAsNumber: true })}
            />
            {errors.price && (
              <p className="text-sm text-red-400">{errors.price.message}</p>
            )}
          </div>

          {/* Hidden nights field */}
          <input
            type="hidden"
            {...register("nights", { valueAsNumber: true })}
          />

          {/* Preview */}
          <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
            <p className="text-sm text-muted-foreground mb-1">New Pricing</p>
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">
                {getDurationLabel(watchedDuration)}
              </span>
              <span className="text-xl font-bold text-primary">
                {watchedPrice > 0 ? formatPrice(watchedPrice) : "KSH 0"}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              className="bg-lipstick-red hover:bg-crimson-red px-10 cursor-pointer"
              onClick={() => onOpenChange(false)}
              disabled={updatePricingMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-azure hover:bg-blue-600 px-8 cursor-pointer"
              disabled={updatePricingMutation.isPending}
            >
              {updatePricingMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
