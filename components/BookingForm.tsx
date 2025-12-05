"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { useCreateBooking } from "@/hooks/useBookings";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBookingFormData } from "@/lib/actions/bookings";
import { cn } from "@/lib/utils";
import { differenceInDays } from "date-fns";

interface BookingFormData {
  guestId: number;
  propertyId: number;
  unitId: number;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfGuests: number;
  totalAmount: number;
  source: string;
  purpose: string;
  paymentMethod: string;
}

interface BookingFormDataErrors {
  guestId?: string;
  checkInDate?: string;
  checkOutDate?: string;
  numberOfGuests?: string;
  paymentMethod?: string;
}

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
  const [errors, setErrors] = useState<BookingFormDataErrors | null>(null);
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    guestId: "",
    propertyId: preselectedPropertyId?.toString() || "",
    unitId: preselectedUnitId?.toString() || "",
    checkInDate: today,
    checkOutDate: "",
    numberOfGuests: "",
    paymentMethod: "",
  });

  // Get prefetched data from cache
  const { data: formDataCache, isLoading } = useQuery({
    queryKey: ["booking-form-data"],
    queryFn: () => getBookingFormData(),
  });

  const createBookingMutation = useCreateBooking();

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
    formData.numberOfGuests !== "" &&
    parseInt(formData.numberOfGuests) > 0 &&
    (selectedUnit && selectedUnit.maxGuests
      ? parseInt(formData.numberOfGuests) <= selectedUnit.maxGuests
      : false);

  //  Function to validate new booking data
  const validateData = (data: BookingFormData) => {
    let valid = true;
    const newErrors: BookingFormDataErrors = {};

    if (!data.guestId) {
      valid = false;
      newErrors.guestId = "Guest is required.";
    }

    if (!data.checkInDate) {
      valid = false;
      newErrors.checkInDate = "Check in date is required.";
    } else if (data.checkInDate < new Date(today)) {
      valid = false;
      newErrors.checkInDate = "Check in date should not be in the past.";
    }

    if (!data.checkOutDate) {
      valid = false;
      newErrors.checkOutDate = "Check out date is required.";
    } else if (data.checkOutDate < data.checkInDate) {
      valid = false;
      newErrors.checkOutDate = "Check out must be greater than check in date.";
    }

    if (!data.numberOfGuests) {
      valid = false;
      newErrors.numberOfGuests = "Number of guests is required.";
    } else if (
      selectedUnit &&
      selectedUnit.maxGuests &&
      data.numberOfGuests > selectedUnit.maxGuests
    ) {
      valid = false;
      newErrors.numberOfGuests = `Maximum ${selectedUnit.maxGuests} guests allowed for this unit.`;
    }

    if (!data.paymentMethod) {
      valid = false;
      newErrors.paymentMethod = "Payment method is required.";
    }

    setErrors(newErrors);

    return valid;
  };

  // Handle new booking from subimission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    //setErrors(null);

    const data = {
      guestId: parseInt(formData.guestId),
      propertyId: parseInt(formData.propertyId),
      unitId: parseInt(formData.unitId),
      checkInDate: new Date(formData.checkInDate),
      checkOutDate: new Date(formData.checkOutDate),
      numberOfGuests: parseInt(formData.numberOfGuests),
      totalAmount: 0,
      source: "direct",
      purpose: "personal",
      paymentMethod: formData.paymentMethod,
    };

    const isValid = validateData(data);

    if (!isValid) {
      return;
    }

    const daysToStay = differenceInDays(data.checkOutDate, data.checkInDate);
    const charges = selectedUnit ? selectedUnit.rent * daysToStay : 0;

    const newBooking = {
      ...data,
      totalAmount: charges,
    };

    createBookingMutation.mutate(newBooking, {
      onSuccess: () => {
        onSuccess?.();
      },
    });
  };

  // Update property on change and reset dependent fields
  const handlePropertyChange = (value: string) => {
    setFormData({
      ...formData,
      propertyId: value,
      unitId: "",
      numberOfGuests: "",
      checkInDate: today,
      checkOutDate: "",
      paymentMethod: "",
    });
  };

  // Update unit on change and reset dependent fields
  const handleUnitChange = (value: string) => {
    setFormData({
      ...formData,
      unitId: value,
      numberOfGuests: "",
      checkInDate: today,
      checkOutDate: "",
      paymentMethod: "",
    });
  };

  // Handle max guest input change
  const handleMaxGuestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseInt(value);

    setErrors((prevErrors) => ({ ...prevErrors, numberOfGuests: "" }));

    // Validate against unit's maxGuests
    if (
      selectedUnit &&
      selectedUnit.maxGuests &&
      numValue > selectedUnit.maxGuests
    ) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        numberOfGuests: `Maximum ${selectedUnit.maxGuests} guests allowed for this unit.`,
      }));
      return;
    }

    setFormData({
      ...formData,
      numberOfGuests: value,
    });
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
        </div>
      </div>
    );
  }

  return (
    <section>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Guest Selection */}
        <article className="w-full flex gap-4 items-start">
          <div className="flex-3 space-y-2">
            <Label htmlFor="guestId">Guest *</Label>

            <Select
              value={formData.guestId}
              onValueChange={(value) => {
                setErrors((prevErrors) => ({ ...prevErrors, guestId: "" }));
                setFormData({ ...formData, guestId: value });
              }}
            >
              <SelectTrigger
                className={cn("w-full", errors?.guestId && "border-red-400")}
              >
                <SelectValue placeholder="Select guest">
                  {formData.guestId &&
                    (() => {
                      const guest = formDataCache?.guests.find(
                        (g) => g.id.toString() === formData.guestId
                      );
                      return guest
                        ? `${guest.firstName} ${guest.lastName}`
                        : "Select guest";
                    })()}
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Only verified guests appear.</SelectLabel>
                  {formDataCache?.guests.map((guest) => (
                    <SelectItem key={guest.id} value={guest.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {guest.firstName} {guest.lastName}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {guest.email}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {errors?.guestId && (
              <p className="text-sm text-red-400 mt-1">{errors.guestId}</p>
            )}
          </div>
        </article>

        {/* Property Selection */}
        <article className="w-full space-y-2">
          <Label htmlFor="propertyId">Property *</Label>
          <Select
            value={formData.propertyId}
            onValueChange={handlePropertyChange}
          >
            <SelectTrigger className={cn("w-full")}>
              <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent>
              {formDataCache?.properties.map((property) => (
                <SelectItem key={property.id} value={property.id.toString()}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </article>

        {/* Unit Selection - Disabled until property selected */}
        <article className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="unitId">Unit *</Label>
            <Select
              value={formData.unitId}
              onValueChange={handleUnitChange}
              disabled={!isPropertySelected}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {selectedProperty?.units.map((unit) => (
                  <SelectItem
                    key={unit.id}
                    value={unit.id.toString()}
                    className={cn(
                      unit.status === "occupied" &&
                        "cursor-not-allowed opacity-50"
                    )}
                  >
                    {unit.name} {unit.status === "occupied" && "Occupied"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Max Guests Input - Disabled until unit selected */}
          <div>
            <Label htmlFor="numberOfGuests">
              Number of Guests *
              {selectedUnit && (
                <span className="text-sm text-muted-foreground ml-2">
                  (Max: {selectedUnit.maxGuests})
                </span>
              )}
            </Label>
            <Input
              id="numberOfGuests"
              type="number"
              min="1"
              max={selectedUnit?.maxGuests || undefined}
              value={formData.numberOfGuests}
              onChange={handleMaxGuestsChange}
              placeholder={
                selectedUnit
                  ? `Enter 1-${selectedUnit.maxGuests}`
                  : "Select unit first"
              }
              disabled={!isUnitSelected}
              required
              className={cn(errors?.numberOfGuests && "border border-red-400")}
            />
            {errors?.numberOfGuests && (
              <p className="text-sm text-red-400 mt-1">
                {errors.numberOfGuests}
              </p>
            )}
          </div>
        </article>

        {/* Check-in/out Dates - Disabled until valid guest count */}
        <article className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="checkInDate">Check-in Date *</Label>
            <Input
              id="checkInDate"
              type="date"
              value={formData.checkInDate}
              onChange={(e) => {
                setErrors((prevErrors) => ({ ...prevErrors, checkInDate: "" }));
                setFormData({ ...formData, checkInDate: e.target.value });
              }}
              disabled={!isMaxGuestsValid}
              required
              className={cn(errors?.checkInDate && "border border-red-400")}
            />
            {errors?.checkInDate && (
              <p className="text-sm text-red-400 mt-1">{errors.checkInDate}</p>
            )}
          </div>

          <div>
            <Label htmlFor="checkOutDate">Check-out Date *</Label>
            <Input
              id="checkOutDate"
              type="date"
              value={formData.checkOutDate}
              onChange={(e) => {
                setErrors((prevErrors) => ({
                  ...prevErrors,
                  checkOutDate: "",
                }));
                setFormData({ ...formData, checkOutDate: e.target.value });
              }}
              disabled={!isMaxGuestsValid}
              min={formData.checkInDate} // Can't check out before check in
              className={cn(errors?.checkOutDate && "border border-red-400")}
              required
            />
            {errors?.checkOutDate && (
              <p className="text-sm text-red-400 mt-1">{errors.checkOutDate}</p>
            )}
          </div>
        </article>

        {/* Payment Method - Disabled until valid guest count */}
        <article>
          <Label htmlFor="paymentMethod">Payment Method *</Label>
          <Select
            value={formData.paymentMethod}
            onValueChange={(value) => {
              setErrors((prevErrors) => ({ ...prevErrors, paymentMethod: "" }));
              setFormData({ ...formData, paymentMethod: value });
            }}
            disabled={!isMaxGuestsValid}
          >
            <SelectTrigger
              className={cn(
                "w-full",
                errors?.paymentMethod && "border-red-400"
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
          {errors?.paymentMethod && (
            <p className="text-sm text-red-400 mt-1">{errors.paymentMethod}</p>
          )}
        </article>

        <div className="flex space-x-2">
          <Button
            type="submit"
            disabled={createBookingMutation.isPending}
            className="flex-1"
          >
            {createBookingMutation.isPending ? "Creating..." : "Create Booking"}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </section>
  );
}
