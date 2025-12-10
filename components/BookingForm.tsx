"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GuestCombobox } from "@/components/GuestCombobox";
import { useCreateBooking } from "@/hooks/useBookings";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBookingFormData } from "@/lib/actions/bookings";
import { cn } from "@/lib/utils";
import { differenceInDays } from "date-fns";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info } from "lucide-react";
import z from "zod";

const BookingFormSchema = z
  .object({
    guestId: z.string().min(1, "Guest is required."),
    propertyId: z.string().min(1, "Property is required."),
    unitId: z.string().min(1, "Unit is required."),
    numberOfGuests: z.coerce
      .number({
        required_error: "Number of guests is required.",
        invalid_type_error: "Must be a number",
      })
      .positive("Must be a positive number")
      .int("Must be a whole number"),
    checkInDate: z
      .string()
      .min(1, "Check-in date is required.")
      .refine(
        (dateString) =>
          new Date(dateString) >=
          new Date(new Date().toISOString().split("T")[0]),
        "Check-in date cannot be in the past."
      ),
    checkOutDate: z.string().min(1, "Check-out date is required."),
    paymentMethod: z.string().min(1, "Payment method is required."),
    status: z.enum([
      "pending",
      "reserved",
      "checked_in",
      "checked_out",
      "cancelled",
    ]),
  })
  .refine((data) => new Date(data.checkOutDate) > new Date(data.checkInDate), {
    message: "Check-out date must be after check-in date.",
    path: ["checkOutDate"],
  });

type BookingFormData = z.infer<typeof BookingFormSchema>;

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

  // Get today's date
  const today = new Date().toISOString().split("T")[0];

  // Get the create booking mutation objectI
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
      checkInDate: today,
      checkOutDate: "",
      numberOfGuests: undefined,
      paymentMethod: "",
      status: "pending",
    },
  });

  // watch form values for derived state
  const formData = watch();

  // Derived property state from form selections
  const selectedProperty = formDataCache?.properties.find(
    (p) =>
      p.id.toString() ===
      (preselectedPropertyId?.toString() || formData.propertyId)
  );

  // Derived unit state from property selections
  const selectedUnit = selectedProperty?.units.find(
    (u) =>
      u.id.toString() === (preselectedUnitId?.toString() || formData.unitId)
  );

  // Validation flags for cascading enables/disables
  const isPropertySelected = !!formData.propertyId || !!preselectedPropertyId;

  const isUnitSelected = !!formData.unitId || !!preselectedUnitId;

  const isMaxGuestsValid =
    formData.numberOfGuests !== undefined &&
    formData.numberOfGuests !== 0 &&
    formData.numberOfGuests > 0 &&
    (selectedUnit?.maxGuests
      ? formData.numberOfGuests <= selectedUnit.maxGuests
      : false);

  useEffect(() => {
    if (
      selectedUnit?.maxGuests &&
      formData.numberOfGuests &&
      formData.numberOfGuests > selectedUnit.maxGuests
    ) {
      setValue("numberOfGuests", formData.numberOfGuests, {
        shouldValidate: true,
      });
    }
  }, [selectedUnit, formData.numberOfGuests, setValue]);

  // Handle new booking from subimission
  const onSubmit: SubmitHandler<BookingFormData> = (data) => {
    const daysToStay = differenceInDays(
      new Date(data.checkOutDate),
      new Date(data.checkInDate)
    );

    const charges = selectedUnit ? selectedUnit.rent * daysToStay : 0;

    const newBooking = {
      guestId: parseInt(data.guestId),
      propertyId: parseInt(data.propertyId),
      unitId: parseInt(data.unitId),
      checkInDate: new Date(data.checkInDate),
      checkOutDate: new Date(data.checkOutDate),
      numberOfGuests: data.numberOfGuests,
      totalAmount: charges,
      source: "direct" as const,
      purpose: "personal" as const,
      paymentMethod: data.paymentMethod,
      status: data.status,
    };

    createBookingMutation.mutate(newBooking, {
      onSuccess: () => {
        reset();
        onSuccess?.();
      },
    });
  };

  // Update property on change and reset dependent fields
  const handlePropertyChange = (value: string) => {
    setValue("propertyId", value);
    setValue("unitId", "");
    setValue("numberOfGuests", 0);
    setValue("checkInDate", today);
    setValue("checkOutDate", "");
    setValue("paymentMethod", "");
  };

  // Update unit on change and reset dependent fields
  const handleUnitChange = (value: string) => {
    setValue("unitId", value);
    setValue("numberOfGuests", 0);
    setValue("checkInDate", today);
    setValue("checkOutDate", "");
    setValue("paymentMethod", "");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
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
                    errors.propertyId && "border-red-400"
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
                        errors.unitId && "border-red-400"
                      )}
                    >
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProperty?.units.map((unit) => (
                        <SelectItem
                          key={unit.id}
                          value={unit.id.toString()}
                          className={cn(
                            unit.status !== "available" &&
                              "cursor-not-allowed opacity-50"
                          )}
                        >
                          {unit.name}{" "}
                          {unit.status !== "available" && `${unit.status}`}
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

        {/* Check-in/out Dates - Disabled until valid guest count */}
        <article className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="checkInDate">Check-in Date</Label>
            <Input
              id="checkInDate"
              type="date"
              disabled={!isMaxGuestsValid}
              className={cn(errors.checkInDate && "border border-red-400")}
              {...register("checkInDate")}
            />
            {errors.checkInDate && (
              <p className="text-sm text-red-400">
                {errors.checkInDate.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="checkOutDate">Check-out Date</Label>
            <Input
              id="checkOutDate"
              type="date"
              disabled={!isMaxGuestsValid}
              min={formData.checkInDate}
              className={cn(errors.checkOutDate && "border border-red-400")}
              {...register("checkOutDate")}
            />
            {errors.checkOutDate && (
              <p className="text-sm text-red-400">
                {errors.checkOutDate.message}
              </p>
            )}
          </div>
        </article>

        {/* Payment Method - Disabled until valid guest count */}
        <article className="space-y-2">
          <Label htmlFor="paymentMethod">Payment Method</Label>
          <Controller
            name="paymentMethod"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!isMaxGuestsValid}
              >
                <SelectTrigger
                  className={cn(
                    "w-full",
                    errors.paymentMethod && "border-red-400"
                  )}
                >
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mpesa_till">Mpesa Till No.</SelectItem>
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
        </article>

        {/* Booking Status - Optional */}
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
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!isMaxGuestsValid}
              >
                <SelectTrigger
                  className={cn("w-full", errors?.status && "border-red-400")}
                >
                  <SelectValue placeholder="Select booking status (default: Pending)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="checked_in">Checked In</SelectItem>
                  <SelectItem value="checked_out">Checked Out</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors?.status && (
            <p className="text-sm text-red-400">{errors.status.message}</p>
          )}
        </article>

        {/* Form Action buttons */}
        <div className="flex space-x-2 pt-4">
          <Button
            type="submit"
            disabled={createBookingMutation.isPending}
            className="flex-1 cursor-pointer"
          >
            {createBookingMutation.isPending ? "Creating..." : "Create Booking"}
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
