"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GuestCombobox } from "@/components/GuestCombobox";
import { BookingPricingSelector } from "@/components/BookingPricingSelector";
import { useCreateBooking } from "@/hooks/useBookings";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBookingFormData } from "@/lib/actions/bookings";
import { Textarea } from "@/components/ui/textarea";
import {
  cn,
  calculateCheckoutDate,
  calculateTotalAmount,
  calculateDiscountedPrice,
  calculateTotalNights,
  calculateTotalWithVAT,
  calculateVAT,
  formatPrice,
  getPeriodLabel,
  formatDateKE,
} from "@/lib/utils";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info, Loader, Minus, Plus, CalendarIcon } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { BookingFormSchema, type BookingFormData } from "@/lib/schemas/booking";
import { format } from "date-fns";
import { getPaymentSettings } from "@/lib/actions/payments";
import type { PriceDuration, UnitTypePricing } from "@/lib/types/types";
import { DatePicker } from "@/components/DatePicker";

interface BookingFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  preselectedPropertyId?: number;
  preselectedUnitId?: number;
}

export function BookingForm({
  onSuccess,
  onCancel,
  preselectedPropertyId,
  preselectedUnitId,
}: BookingFormProps) {
  // Get prefetched data from react query cache
  const { data: formDataCache, isLoading } = useQuery({
    queryKey: ["booking-form-data"],
    queryFn: () => getBookingFormData(),
  });

  const { data: paymentSettings } = useQuery({
    queryKey: ["payment-settings"],
    queryFn: () => getPaymentSettings(),
  });

  // Get current date time
  const now = format(new Date(), "yyyy-MM-dd");

  // Get user role
  const { isAgent } = usePermissions();

  // State for pricing selection
  const [selectedPricing, setSelectedPricing] =
    useState<UnitTypePricing | null>(null);
  const [period, setPeriod] = useState<number>(1);
  const [customNights, setCustomNights] = useState<number>(1);

  // Get the create booking mutation object
  const createBookingMutation = useCreateBooking();

  // Form management with React Hook form
  const {
    register,
    watch,
    setValue,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookingFormData>({
    mode: "all",
    resolver: zodResolver(BookingFormSchema),
    defaultValues: {
      guestId: "",
      propertyId: preselectedPropertyId?.toString() || "",
      unitId: preselectedUnitId?.toString() || "",
      checkInDate: now,
      checkOutDate: "",
      numberOfGuests: 1,
      priceDuration: "one_night",
      period: 1,
      unitPrice: 0,
      discountRate: null,
      paymentCode: "",
      paymentMethod: "mpesa_till",
      status: "pending",
      specialRequests: "",
    },
  });

  // watch form values for derived state
  const formData = watch();

  // Derived property state from form selections
  const selectedProperty = formDataCache?.properties.find(
    (p) =>
      p.id.toString() ===
      (preselectedPropertyId?.toString() || formData.propertyId),
  );

  // Derived unit state from property selections
  const selectedUnit = selectedProperty?.units.find(
    (u) =>
      u.id.toString() === (preselectedUnitId?.toString() || formData.unitId),
  );

  // Validation flags for cascading enables/disables
  const isPropertySelected = !!formData.propertyId || !!preselectedPropertyId;
  const isUnitSelected = !!formData.unitId || !!preselectedUnitId;
  const isPricingSelected = !!selectedPricing;
  const isCustomDuration = selectedPricing?.duration === "custom";

  const isMaxGuestsValid =
    formData.numberOfGuests !== undefined &&
    formData.numberOfGuests !== 0 &&
    formData.numberOfGuests > 0 &&
    (selectedUnit?.maxGuests
      ? formData.numberOfGuests <= selectedUnit.maxGuests
      : false);

  // Calculate discounted price
  const discountedPrice = selectedPricing
    ? calculateDiscountedPrice(
        selectedPricing.price,
        selectedPricing.discountRate,
      )
    : 0;

  // Calculate total nights and total amount based on pricing type
  const totalNights = selectedPricing
    ? isCustomDuration
      ? customNights
      : calculateTotalNights(
          selectedPricing.duration as PriceDuration,
          period,
          selectedPricing.fromDate,
          selectedPricing.toDate,
        )
    : 0;

  // With:
  const subtotal = selectedPricing
    ? isCustomDuration
      ? discountedPrice * customNights
      : calculateTotalAmount(discountedPrice, period)
    : 0;

  const vatAmount = calculateVAT(subtotal);
  const totalAmount = calculateTotalWithVAT(subtotal);

  // Update checkout date when check-in, duration, or period changes
  useEffect(() => {
    if (formData.checkInDate && selectedPricing) {
      const checkIn = new Date(formData.checkInDate);

      let checkOut: Date;

      if (isCustomDuration) {
        // For custom: add customNights to check-in date
        checkOut = new Date(checkIn);
        checkOut.setDate(checkOut.getDate() + customNights);
      } else {
        checkOut = calculateCheckoutDate(
          checkIn,
          selectedPricing.duration as PriceDuration,
          period,
          selectedPricing.fromDate,
          selectedPricing.toDate,
        );
      }

      setValue("checkOutDate", format(checkOut, "yyyy-MM-dd") + "T10:00");
    }
  }, [
    formData.checkInDate,
    selectedPricing,
    period,
    customNights,
    isCustomDuration,
    setValue,
  ]);

  // Handle pricing selection
  const handlePricingSelect = (pricing: UnitTypePricing) => {
    setSelectedPricing(pricing);
    setValue("priceDuration", pricing.duration as PriceDuration);

    // Store the discounted price as unitPrice
    const discounted = calculateDiscountedPrice(
      pricing.price,
      pricing.discountRate,
    );
    setValue("unitPrice", discounted);

    // Store discount rate for snapshot
    setValue("discountRate", pricing.discountRate);

    // Reset period and custom nights when pricing changes
    setPeriod(1);
    setCustomNights(1);
    setValue("period", 1);
  };

  // Handle period change (for non-custom pricing)
  const handlePeriodChange = (newPeriod: number) => {
    if (newPeriod < 1) return;
    setPeriod(newPeriod);
    setValue("period", newPeriod);
  };

  // Handle custom nights change
  const handleCustomNightsChange = (nights: number) => {
    if (nights < 1) return;
    setCustomNights(nights);
    // For custom pricing, period represents the number of nights
    setValue("period", nights);
  };

  // Handle new booking form submission
  const onSubmit: SubmitHandler<BookingFormData> = (data) => {
    if (!selectedPricing) return;

    const discounted = calculateDiscountedPrice(
      selectedPricing.price,
      selectedPricing.discountRate,
    );

    const finalPeriod = isCustomDuration ? customNights : period;
    const finalSubtotal = isCustomDuration
      ? discounted * customNights
      : calculateTotalAmount(discounted, period);
    const finalTotalAmount = calculateTotalWithVAT(finalSubtotal);

    const newBooking = {
      guestId: parseInt(data.guestId),
      propertyId: parseInt(data.propertyId),
      unitId: parseInt(data.unitId),
      checkInDate: new Date(data.checkInDate),
      checkOutDate: new Date(data.checkOutDate),
      numberOfGuests: data.numberOfGuests,
      priceDuration: data.priceDuration,
      unitPrice: discounted,
      period: finalPeriod,
      discountRate: selectedPricing.discountRate,
      totalAmount: finalTotalAmount,
      source: "direct" as const,
      purpose: "personal" as const,
      paymentMethod: data.paymentMethod,
      paymentCode: data.paymentCode,
      status: data.status,
      specialRequests: data.specialRequests,
    };

    createBookingMutation.mutate(newBooking, {
      onSuccess: () => {
        reset();
        setSelectedPricing(null);
        setPeriod(1);
        setCustomNights(1);
        onSuccess?.();
      },
    });
  };

  // Update property on change and reset dependent fields
  const handlePropertyChange = (value: string) => {
    setValue("propertyId", value);
    setValue("unitId", "");
    setValue("numberOfGuests", 1);
    setValue("checkInDate", now);
    setValue("checkOutDate", "");
    setValue("paymentMethod", "mpesa_till");
    setValue("priceDuration", undefined as unknown as PriceDuration);
    setValue("unitPrice", 0);
    setValue("period", 1);
    setValue("discountRate", null);
    setSelectedPricing(null);
    setPeriod(1);
    setCustomNights(1);
  };

  // Update unit on change and reset dependent fields
  const handleUnitChange = (value: string) => {
    setValue("unitId", value);
    setValue("numberOfGuests", 1);
    setValue("checkInDate", now);
    setValue("checkOutDate", "");
    setValue("paymentMethod", "mpesa_till");
    setValue("priceDuration", undefined as unknown as PriceDuration);
    setValue("unitPrice", 0);
    setValue("period", 1);
    setValue("discountRate", null);
    setSelectedPricing(null);
    setPeriod(1);
    setCustomNights(1);
  };

  // Get unit type label
  const getUnitTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      one_bedroom: "1 Bedroom",
      two_bedroom: "2 Bedroom",
      three_bedroom: "3 Bedroom",
    };
    return typeLabels[type] || type.replace("_", " ");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-12 md:h-16 bg-gray-200 rounded"></div>
            <div className="h-12 md:h-16 bg-gray-200 rounded"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-12 md:h-16 bg-gray-200 rounded"></div>
            <div className="h-12 md:h-16 bg-gray-200 rounded"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-12 md:h-16 bg-gray-200 rounded"></div>
            <div className="h-12 md:h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Guest Selection */}
        <article className="w-full flex gap-4 items-start">
          <div className="flex-3 space-y-2">
            <Label htmlFor="guestId">Guest</Label>
            <Controller
              name="guestId"
              control={control}
              render={({ field }) => (
                <GuestCombobox
                  guests={formDataCache?.guests || []}
                  value={field.value}
                  onValueChange={field.onChange}
                  error={errors.guestId?.message}
                />
              )}
            />
          </div>
        </article>

        {/* Property Selection */}
        <article className="w-full space-y-2">
          <Label htmlFor="propertyId">Property</Label>
          <Controller
            name="propertyId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  handlePropertyChange(value);
                }}
              >
                <SelectTrigger
                  className={cn(
                    "w-full",
                    errors.propertyId && "border-red-400",
                  )}
                >
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {formDataCache?.properties.map((property) => (
                    <SelectItem
                      key={property.id}
                      value={property.id.toString()}
                    >
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.propertyId && (
            <p className="text-sm text-red-400">{errors.propertyId.message}</p>
          )}
        </article>

        {/* Unit Selection - Disabled until property selected */}
        <article className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="unitId">Unit</Label>
            <Controller
              name="unitId"
              control={control}
              render={({ field }) => (
                <>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleUnitChange(value);
                    }}
                    disabled={
                      !isPropertySelected ||
                      selectedProperty?.units.length === 0
                    }
                  >
                    <SelectTrigger
                      className={cn(
                        "w-full",
                        errors.unitId && "border-red-400",
                      )}
                    >
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProperty?.units.map((unit) => (
                        <SelectItem
                          key={unit.id}
                          value={unit.id.toString()}
                          disabled={unit.status !== "available"}
                          className={cn(
                            unit.status !== "available" &&
                              "cursor-not-allowed opacity-50",
                          )}
                        >
                          {unit.name} - {getUnitTypeLabel(unit.type)}
                          {unit.status !== "available" && ` (${unit.status})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedProperty && selectedProperty.units?.length === 0 && (
                    <div className="flex items-center gap-3 text-sm bg-blue-50 p-2 border border-blue-400 rounded-md">
                      <Info className="size-6 text-blue-400" />
                      <span className="text-blue-400">
                        This property has no units. <br /> Select a different
                        property.
                      </span>
                    </div>
                  )}
                </>
              )}
            />
            {errors.unitId && (
              <p className="text-sm text-red-400">{errors.unitId.message}</p>
            )}
          </div>

          {/* Max Guests Input - Disabled until unit selected */}
          <div className="space-y-2">
            <Label htmlFor="numberOfGuests">
              Number of Guests
              {selectedUnit && (
                <span className="text-sm text-muted-foreground ml-2">
                  (Max: {selectedUnit.maxGuests})
                </span>
              )}
            </Label>
            <Input
              id="numberOfGuests"
              type="number"
              max={selectedUnit?.maxGuests || 10}
              placeholder={
                selectedUnit
                  ? `Enter 1-${selectedUnit.maxGuests}`
                  : "Select unit first"
              }
              disabled={!isUnitSelected}
              min="1"
              className={cn(errors.numberOfGuests && "border border-red-400")}
              {...register("numberOfGuests", {
                valueAsNumber: true,
                validate: (value: number) => {
                  if (!selectedUnit?.maxGuests) return true;
                  if (value > selectedUnit.maxGuests) {
                    return `Maximum ${selectedUnit.maxGuests} guests allowed for this unit.`;
                  }
                  return true;
                },
              })}
            />
            {errors.numberOfGuests && (
              <p className="text-sm text-red-400">
                {errors.numberOfGuests.message}
              </p>
            )}
          </div>
        </article>

        {/* Pricing Selection - Disabled until valid guest count */}
        {isUnitSelected && isMaxGuestsValid && selectedUnit && (
          <article className="space-y-2">
            <Label>Select Stay Duration & Pricing</Label>
            <BookingPricingSelector
              unitId={selectedUnit.id}
              selectedDuration={
                selectedPricing?.duration as PriceDuration | null
              }
              onSelect={handlePricingSelect}
            />
            {errors.priceDuration && (
              <p className="text-sm text-red-400">
                {errors.priceDuration.message}
              </p>
            )}
          </article>
        )}

        {/* Period/Nights Selector */}
        {isPricingSelected && (
          <article className="space-y-3">
            <Label>
              {isCustomDuration
                ? "How many nights?"
                : `How many ${getPeriodLabel(selectedPricing?.duration || "one_night")}?`}
            </Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="w-1/12"
                onClick={() => {
                  if (isCustomDuration) {
                    handleCustomNightsChange(customNights - 1);
                  } else {
                    handlePeriodChange(period - 1);
                  }
                }}
                disabled={isCustomDuration ? customNights <= 1 : period <= 1}
              >
                <Minus className="size-4" />
              </Button>

              <Input
                type="number"
                value={isCustomDuration ? customNights : period}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 1) {
                    if (isCustomDuration) {
                      handleCustomNightsChange(val);
                    } else {
                      handlePeriodChange(val);
                    }
                  }
                }}
                className="w-10/12 text-center"
                min={1}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="w-1/12"
                onClick={() => {
                  if (isCustomDuration) {
                    handleCustomNightsChange(customNights + 1);
                  } else {
                    handlePeriodChange(period + 1);
                  }
                }}
              >
                <Plus className="size-4" />
              </Button>

              <span className="text-sm text-muted-foreground">
                {isCustomDuration
                  ? customNights === 1
                    ? "night"
                    : "nights"
                  : getPeriodLabel(selectedPricing?.duration || "one_night")}
              </span>
            </div>
          </article>
        )}

        {/* Check-in/out Dates */}
        {isPricingSelected && (
          <article className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkInDate">Check-in Date</Label>
              <Controller
                name="checkInDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select check-in date"
                    minDate={new Date()}
                    error={!!errors.checkInDate}
                  />
                )}
              />
              {isCustomDuration &&
                selectedPricing?.fromDate &&
                selectedPricing?.toDate && (
                  <p className="text-xs text-muted-foreground">
                    Must be between {formatDateKE(selectedPricing.fromDate)} and{" "}
                    {formatDateKE(selectedPricing.toDate)}
                  </p>
                )}
              {errors.checkInDate && (
                <p className="text-sm text-red-400">
                  {errors.checkInDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkOutDate">Check-out Date</Label>
              <div className="flex items-center h-10 w-full rounded-md border bg-muted px-3 text-sm">
                <CalendarIcon className="mr-2 size-4 text-muted-foreground" />
                <span
                  className={
                    formData.checkOutDate
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }
                >
                  {formData.checkOutDate
                    ? format(
                        new Date(formData.checkOutDate),
                        "EEEE, MMMM d, yyyy 'at' hh:mm a",
                      )
                    : "Awaiting check-in date"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Auto-calculated · Default check-out time is 10:00 AM
              </p>
            </div>
          </article>
        )}

        {/* Total Amount Display */}
        {isPricingSelected && (
          <article className="p-4 rounded-lg bg-muted">
            <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
              <span>
                {formatPrice(discountedPrice)} × {totalNights}{" "}
                {totalNights === 1 ? "night" : "nights"}
              </span>
              {selectedPricing?.discountRate &&
                selectedPricing.discountRate > 0 && (
                  <span className="text-green-600 text-xs">
                    {(selectedPricing.discountRate * 100).toFixed(0)}% discount
                    applied
                  </span>
                )}
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
              <span>VAT (16%)</span>
              <span>{formatPrice(vatAmount)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="font-medium">Total Amount</span>
              <span className="text-2xl font-bold text-foreground">
                {formatPrice(totalAmount)}
              </span>
            </div>
          </article>
        )}

        {isPricingSelected &&
          formData.paymentMethod === "mpesa_till" &&
          paymentSettings && (
            <div className="flex items-center gap-4 p-3 rounded-lg border border-green-400">
              <div className="flex-1">
                <p className="text-xs font-medium text-green-600">
                  Paybill Number
                </p>
                <p className="text-sm font-bold text-green-800">
                  {paymentSettings.paybillNumber}
                </p>
              </div>
              <div className="w-px h-8 bg-green-200" />
              <div className="flex-1">
                <p className="text-xs font-medium text-green-600">
                  Account Number
                </p>
                <p className="text-sm font-bold text-green-800">
                  {paymentSettings.accountNumber}
                </p>
              </div>
            </div>
          )}

        {/* Payment Method */}
        {isPricingSelected && (
          <article className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Controller
                name="paymentMethod"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      className={cn(
                        "w-full",
                        errors.paymentMethod && "border-red-400",
                      )}
                    >
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mpesa_till">Mpesa Paybill</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="debit_card">Debit Card</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.paymentMethod && (
                <p className="text-sm text-red-400">
                  {errors.paymentMethod.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-code">Payment Reference Code</Label>
              <Input
                id="payment-code"
                type="text"
                placeholder={
                  formData.paymentMethod === "mpesa_till"
                    ? "e.g. KTUDKLM900 (10 characters)"
                    : "e.g. KTUDKLM90012345 (15 characters)"
                }
                className={cn(errors.paymentCode && "border border-red-400")}
                {...register("paymentCode")}
              />
              {errors.paymentCode && (
                <p className="text-sm text-red-400">
                  {errors.paymentCode.message}
                </p>
              )}
            </div>
          </article>
        )}

        {/* Booking Status - Optional */}
        {isPricingSelected && (
          <article>
            <Label htmlFor="bookingStatus">Booking Status (Optional)</Label>
            <p className="text-xs text-muted-foreground my-2">
              If not selected, &quot;pending&quot; will be set as the default
              status.
            </p>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className={cn("w-full", errors?.status && "border-red-400")}
                  >
                    <SelectValue placeholder="Select booking status (default: Pending)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem
                      value="checked_in"
                      className={cn(isAgent && "hidden")}
                    >
                      Checked In
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors?.status && (
              <p className="text-sm text-red-400">{errors.status.message}</p>
            )}
          </article>
        )}

        {/* Special Requests */}
        {isPricingSelected && (
          <article className="space-y-2">
            <Label htmlFor="notes">Special Requests (optional)</Label>
            <Textarea
              id="notes"
              rows={4}
              placeholder="Additional notes about the booking"
              className={cn(errors.specialRequests && "border border-red-400")}
              {...register("specialRequests")}
            />
            {errors.specialRequests && (
              <p className="text-sm mt-1 text-red-400">
                {errors.specialRequests.message}
              </p>
            )}
          </article>
        )}

        {/* Form Action buttons */}
        <div className="flex space-x-2 pt-4">
          <Button
            type="submit"
            disabled={createBookingMutation.isPending || !isPricingSelected}
            className="flex-1 cursor-pointer"
          >
            {createBookingMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader className="animate-spin" />
                <span>Creating booking</span>
              </span>
            ) : (
              "Create Booking"
            )}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </section>
  );
}
