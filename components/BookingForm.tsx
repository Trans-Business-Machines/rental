"use client";

import { GuestForm } from "@/components/GuestForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBookings, useCreateBooking } from "@/hooks/useBookings";
import { useGuests } from "@/hooks/useGuests";
import { usePropertiesWithUnits } from "@/hooks/useProperties";
import { Plus } from "lucide-react";
import { useState } from "react";

interface Guest {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
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
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);

  // Get today's date in YYYY-MM-DD format for auto-selection
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    guestId: "",
    propertyId: preselectedPropertyId?.toString() || "",
    unitId: preselectedUnitId?.toString() || "",
    checkInDate: today, // Auto-select today's date
    checkOutDate: "",
    numberOfGuests: "1",
    paymentMethod: "",
  });

  // React Query hooks
  const { data: guestsData, isLoading: guestsLoading } = useGuests();
  const { data: properties = [], isLoading: propertiesLoading } =
    usePropertiesWithUnits();
  const { data: allBookings = [] } = useBookings();
  const createBookingMutation = useCreateBooking();

  // Dynamically compute booked properties for the selected check-in date
  const bookedUnitIds = allBookings
    .filter((b) => {
      const checkIn = new Date(b.checkInDate);
      const selected = new Date(formData.checkInDate);
      return (
        b.propertyId.toString() === formData.propertyId &&
        checkIn.getFullYear() === selected.getFullYear() &&
        checkIn.getMonth() === selected.getMonth() &&
        checkIn.getDate() === selected.getDate()
      );
    })
    .map((b) => b.unitId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      paymentMethod: formData.paymentMethod || undefined,
    };

    createBookingMutation.mutate(data, {
      onSuccess: () => {
        onSuccess?.();
      },
    });
  };

  const handleGuestCreated = (newGuest?: Guest) => {
    console.log("Guest created:", newGuest);
    if (newGuest) {
      setFormData((prev) => {
        const newFormData = {
          ...prev,
          guestId: newGuest.id.toString(),
        };
        console.log("Updated form data:", newFormData);
        return newFormData;
      });
    }
    setIsGuestModalOpen(false);
  };

  const selectedProperty = properties.find(
    (p) => p.id.toString() === formData.propertyId
  );
  const availableUnits = selectedProperty?.units || [];

  if (guestsLoading || propertiesLoading) {
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
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Dialog open={isGuestModalOpen} onOpenChange={setIsGuestModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Guest</DialogTitle>
          </DialogHeader>
          <GuestForm
            onSuccess={handleGuestCreated}
            onCancel={() => setIsGuestModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="min-w-0">
            <Label htmlFor="guestId">Guest</Label>
            <div className="flex gap-2">
              <Select
                key={formData.guestId} // Force re-render when guestId changes
                value={formData.guestId}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    guestId: value,
                  })
                }
              >
                <SelectTrigger className="flex-1 min-w-0">
                  <SelectValue placeholder="Select guest" className="truncate">
                    {formData.guestId &&
                      (() => {
                        const selectedGuest = guestsData?.guests.find(
                          (g) => g.id.toString() === formData.guestId
                        );
                        return selectedGuest
                          ? `${selectedGuest.firstName} ${selectedGuest.lastName}`
                          : "Select guest";
                      })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {guestsData?.guests.map((guest) => (
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
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setIsGuestModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="min-w-0">
            <Label htmlFor="propertyId">Property</Label>
            <Select
              value={formData.propertyId}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  propertyId: value,
                  unitId: "", // Reset unit when property changes
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id.toString()}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="unitId">Unit</Label>
            <Select
              value={formData.unitId}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  unitId: value,
                })
              }
              disabled={!formData.propertyId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {availableUnits.map((unit) => {
                  const isBooked = bookedUnitIds.includes(unit.id);
                  return (
                    <SelectItem
                      key={unit.id}
                      value={unit.id.toString()}
                      disabled={isBooked}
                    >
                      {unit.name} {isBooked ? "(Already Booked)" : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="numberOfGuests">Number of Guests</Label>
            <Select
              value={formData.numberOfGuests}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  numberOfGuests: value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select number of guests" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? "Guest" : "Guests"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="checkInDate">Check-in Date</Label>
            <Input
              id="checkInDate"
              type="date"
              value={formData.checkInDate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  checkInDate: e.target.value,
                })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="checkOutDate">Check-out Date</Label>
            <Input
              id="checkOutDate"
              type="date"
              value={formData.checkOutDate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  checkOutDate: e.target.value,
                })
              }
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="paymentMethod">Payment Method</Label>
          <Select
            value={formData.paymentMethod}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                paymentMethod: value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mpesa_till">Mpesa Till No.</SelectItem>
              <SelectItem value="credit_card">Credit Card</SelectItem>
              <SelectItem value="debit_card">Debit Card</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
    </>
  );
}
