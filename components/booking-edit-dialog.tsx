"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Moon, Calendar, Minus, Plus, Loader2 } from "lucide-react";
import { updateBooking } from "@/lib/actions/bookings";
import { getUnitPricingOptions } from "@/lib/actions/pricing";
import {
  formatPrice,
  getDurationLabel,
  getPeriodLabel,
  calculateCheckoutDate,
  calculateTotalNights,
  calculateTotalAmount,
} from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { checkoutKeys } from "@/hooks/useGuestCheckout";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  Booking,
  PriceDuration,
  UnitTypePricing,
} from "@/lib/types/types";

interface BookingEditDialogProps {
  booking: Booking;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const durationIcons = {
  one_night: Moon,
  weekly: Calendar,
};

export function BookingEditDialog({
  booking,
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: BookingEditDialogProps) {
  const queryClient = useQueryClient();

  // Dialog control state
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled =
    controlledOpen !== undefined && controlledOnOpenChange !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPricing, setSelectedPricing] =
    useState<UnitTypePricing | null>(null);
  const [formData, setFormData] = useState({
    checkInDate: new Date(booking.checkInDate).toISOString().split("T")[0],
    checkOutDate: new Date(booking.checkOutDate).toISOString().split("T")[0],
    numberOfGuests: booking.numberOfGuests,
    priceDuration: booking.priceDuration,
    unitPrice: booking.unitPrice,
    period: booking.period,
    totalAmount: booking.totalAmount,
    source: booking.source,
    purpose: booking.purpose || "personal",
    paymentMethod: booking.paymentMethod || "",
    specialRequests: booking.specialRequests || "",
    status: booking.status,
  });

  // Fetch pricing options for the unit
  const { data: pricingOptions, isLoading: isPricingLoading } = useQuery({
    queryKey: ["pricing-options", booking.unitId],
    queryFn: async () => {
      return await getUnitPricingOptions(booking.unitId);
    },
    enabled: open && !!booking.unitId,
  });

  // Set initial selected pricing when options load
  useEffect(() => {
    if (pricingOptions && formData.priceDuration) {
      const currentPricing = pricingOptions.find(
        (p) => p.duration === formData.priceDuration,
      );
      if (currentPricing) {
        setSelectedPricing(currentPricing);
      }
    }
  }, [pricingOptions, formData.priceDuration]);

  // Update checkout date and total when pricing/period/check-in changes
  useEffect(() => {
    if (selectedPricing && formData.checkInDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = calculateCheckoutDate(
        checkIn,
        selectedPricing.duration as PriceDuration,
        formData.period,
      );
      const total = calculateTotalAmount(
        selectedPricing.price,
        formData.period,
      );

      setFormData((prev) => ({
        ...prev,
        checkOutDate: format(checkOut, "yyyy-MM-dd"),
        unitPrice: selectedPricing.price,
        totalAmount: total,
      }));
    }
  }, [selectedPricing, formData.period, formData.checkInDate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "numberOfGuests" ? Number(value) : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePricingSelect = (pricing: UnitTypePricing) => {
    setSelectedPricing(pricing);
    setFormData((prev) => ({
      ...prev,
      priceDuration: pricing.duration as PriceDuration,
      unitPrice: pricing.price,
      period: 1, // Reset period when changing duration
    }));
  };

  const handlePeriodChange = (newPeriod: number) => {
    if (newPeriod < 1) return;
    setFormData((prev) => ({
      ...prev,
      period: newPeriod,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (booking.status === "reserved" && formData.status === "pending") {
      toast.error("You cannot move from reserved to pending!");
      return;
    }

    setIsSubmitting(true);

    const data = {
      ...formData,
      checkInDate: new Date(formData.checkInDate),
      checkOutDate: new Date(formData.checkOutDate),
    };

    try {
      const { booking: updatedBooking } = await updateBooking(booking.id, data);

      if (updatedBooking.status === "checked_in") {
        queryClient.invalidateQueries({
          queryKey: checkoutKeys.bookingsList,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["bookings"] });

      toast.success("Booking successfully updated.");
      setOpen(false);
    } catch (error) {
      console.error(`An error occurred when updating booking: ${error}`);

      if (
        error instanceof Error &&
        error.message.includes("Unauthorized: Insufficent permissions.")
      ) {
        toast.warning(
          "Unauthorized: Insufficient permissions to update booking.",
        );
      } else {
        toast.error("Update failed, try again!");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCheckedIn = booking.status === "checked_in";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          {children || (
            <Button size="sm" className="gap-2">
              <Edit className="size-4" />
              Edit Booking
            </Button>
          )}
        </DialogTrigger>
      )}

      <DialogContent className="w-11/12 lg:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
          <DialogDescription>
            Update booking details for {booking.guest?.firstName}{" "}
            {booking.guest?.lastName} at {booking.unit?.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pricing & Duration Section */}
          <article className="space-y-4">
            <h3 className="font-semibold text-foreground">
              Stay Duration & Pricing
            </h3>

            {isPricingLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : pricingOptions && pricingOptions.length > 0 ? (
              <div className="space-y-4">
                {/* Duration Selection */}
                <RadioGroup
                  value={formData.priceDuration}
                  onValueChange={(value) => {
                    const pricing = pricingOptions.find(
                      (p) => p.duration === value,
                    );
                    if (pricing) handlePricingSelect(pricing);
                  }}
                  className="items-center md:grid-cols-2"
                  disabled={isCheckedIn}
                >
                  {pricingOptions.map((pricing) => {
                    const Icon =
                      durationIcons[
                        pricing.duration as keyof typeof durationIcons
                      ];
                    const isSelected =
                      formData.priceDuration === pricing.duration;

                    return (
                      <Label
                        key={pricing.id}
                        htmlFor={`edit-${pricing.duration}`}
                        className={`cursor-pointer ${isCheckedIn ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <Card
                          className={`transition-all py-2 w-full ${
                            isSelected
                              ? "border-primary ring-2 ring-primary/20"
                              : "hover:border-primary/50"
                          }`}
                        >
                          <CardContent className="flex items-center gap-4 p-4">
                            <RadioGroupItem
                              value={pricing.duration}
                              id={`edit-${pricing.duration}`}
                              disabled={isCheckedIn}
                              hidden={true}
                            />

                            <div
                              className={`size-10 rounded-lg flex items-center justify-center ${
                                isSelected ? "bg-primary/10" : "bg-muted"
                              }`}
                            >
                              <Icon
                                className={`size-5 ${
                                  isSelected
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                }`}
                              />
                            </div>

                            <div className="flex-1">
                              <p className="font-medium text-foreground">
                                {getDurationLabel(pricing.duration)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {pricing.nights}{" "}
                                {pricing.nights === 1 ? "night" : "nights"} stay
                              </p>
                            </div>

                            <p className="text-lg font-bold text-foreground">
                              {formatPrice(pricing.price)}
                            </p>
                          </CardContent>
                        </Card>
                      </Label>
                    );
                  })}
                </RadioGroup>

                {/* Period Selector */}
                {selectedPricing && (
                  <div className="space-y-3">
                    <Label>
                      How many {getPeriodLabel(formData.priceDuration)}?
                    </Label>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handlePeriodChange(formData.period - 1)}
                        disabled={formData.period <= 1 || isCheckedIn}
                      >
                        <Minus className="size-4" />
                      </Button>

                      <Input
                        type="number"
                        value={formData.period}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val >= 1) {
                            handlePeriodChange(val);
                          }
                        }}
                        className="w-min text-center"
                        min={1}
                        disabled={isCheckedIn}
                      />

                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handlePeriodChange(formData.period + 1)}
                        disabled={isCheckedIn}
                      >
                        <Plus className="size-4" />
                      </Button>

                      <span className="text-sm text-muted-foreground">
                        {getPeriodLabel(formData.priceDuration)}
                      </span>
                    </div>

                    {/* Total Calculation */}
                    <div className="p-4 rounded-lg bg-muted">
                      <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
                        <span>
                          {formatPrice(selectedPricing.price)} ×{" "}
                          {formData.period}{" "}
                          {getPeriodLabel(formData.priceDuration)}
                        </span>
                        <span>
                          {calculateTotalNights(
                            formData.priceDuration,
                            formData.period,
                          )}{" "}
                          nights total
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Amount</span>
                        <span className="text-2xl font-bold text-foreground">
                          {formatPrice(formData.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No pricing options available for this unit type.
              </p>
            )}
          </article>

          {/* Stay Dates */}
          <article className="space-y-4">
            <h3 className="font-semibold text-foreground">Stay Dates</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="checkInDate">Check-in Date</Label>
                <Input
                  id="checkInDate"
                  name="checkInDate"
                  type="date"
                  value={formData.checkInDate}
                  onChange={handleChange}
                  disabled={isCheckedIn}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkOutDate">Check-out Date</Label>
                <Input
                  id="checkOutDate"
                  name="checkOutDate"
                  type="date"
                  value={formData.checkOutDate}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Auto-calculated based on duration and period
                </p>
              </div>
            </div>
          </article>

          {/* Guest Information */}
          <article className="space-y-4">
            <h3 className="font-semibold text-foreground">Guest Information</h3>
            <div className="space-y-2">
              <Label htmlFor="numberOfGuests">Number of Guests</Label>
              <Input
                id="numberOfGuests"
                name="numberOfGuests"
                type="number"
                min="1"
                max={booking.unit?.maxGuests || 8}
                value={formData.numberOfGuests}
                onChange={handleChange}
                required
              />
            </div>
          </article>

          {/* Booking Details */}
          <article className="space-y-4">
            <h3 className="font-semibold text-foreground">Booking Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="source">Booking Source</Label>
                <Select
                  value={formData.source}
                  disabled={isCheckedIn}
                  onValueChange={(value) => handleSelectChange("source", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct">Direct</SelectItem>
                    <SelectItem value="booking.com">Booking.com</SelectItem>
                    <SelectItem value="airbnb">Airbnb</SelectItem>
                    <SelectItem value="expedia">Expedia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <Select
                  value={formData.purpose}
                  onValueChange={(value) =>
                    handleSelectChange("purpose", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="leisure">Leisure</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) =>
                    handleSelectChange("paymentMethod", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mpesa_till">M-Pesa Till</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="debit_card">Debit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </article>

          {/* Status */}
          <article className="space-y-4">
            <h3 className="font-semibold text-foreground">Status</h3>
            <div className="space-y-2">
              <Label htmlFor="status">Booking Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
                disabled={isCheckedIn}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending" disabled>
                    Pending
                  </SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="checked_in">Checked In</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </article>

          {/* Special Requests */}
          <article className="space-y-4">
            <h3 className="font-semibold text-foreground">Special Requests</h3>
            <div className="space-y-2">
              <Label htmlFor="specialRequests">
                Special Requests (optional)
              </Label>
              <Textarea
                id="specialRequests"
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleChange}
                placeholder="Add any special requests for this booking..."
                rows={4}
              />
            </div>
          </article>

          {/* Actions */}
          <article className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="bg-chart-5 px-10 hover:bg-chart-5/90 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-chart-1 hover:bg-chart-1/90 cursor-pointer"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </article>
        </form>
      </DialogContent>
    </Dialog>
  );
}
