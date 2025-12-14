"use client";

import { useState } from "react";
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
import { Edit } from "lucide-react";
import { updateBooking } from "@/lib/actions/bookings";
import { toast } from "sonner";
import type { Booking } from "@/lib/types/types";

interface BookingEditDialogProps {
  booking: Booking;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function BookingEditDialog({
  booking,
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: BookingEditDialogProps) {
  // Detect if this Dialog is controlled or not.
  const isControlled =
    controlledOpen !== undefined && controlledOnOpenChange !== undefined;

  // Define state to control dialog if its an uncontrolled dialog box
  const [internalOpen, setInternalOpen] = useState(false);

  // Fallback to internal state if not controlled
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;

  const [formData, setFormData] = useState({
    checkInDate: new Date(booking.checkInDate).toISOString().split("T")[0],
    checkOutDate: new Date(booking.checkOutDate).toISOString().split("T")[0],
    numberOfGuests: booking.numberOfGuests,
    totalAmount: booking.totalAmount,
    source: booking.source,
    purpose: booking.purpose || "personal",
    paymentMethod: booking.paymentMethod || "",
    specialRequests: booking.specialRequests || "",
    status: booking.status,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "numberOfGuests" || name === "totalAmount"
          ? Number(value)
          : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      checkInDate: new Date(formData.checkInDate),
      checkOutDate: new Date(formData.checkOutDate),
    };

    try {
      await updateBooking(booking.id, data);

      toast.success("Booking successfully updated.");
      setOpen(false);
    } catch (error) {
      console.error(`An error occured when updating booking: ${error}`);
      toast.error("Update failed, try again!");
    }

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Use DialogTrigger Only if th dialog is uncontrolled by parent */}
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

      <DialogContent className=" w-11/12  lg:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
          <DialogDescription>
            Update booking details and information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                  disabled={booking.status === "checked_in"}
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
                  onChange={handleChange}
                  required
                />
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
            <div className="grid  gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="source">Booking Source</Label>
                <Select
                  value={formData.source}
                  disabled={booking.status === "checked_in"}
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
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Amount</Label>
                <Input
                  id="totalAmount"
                  name="totalAmount"
                  type="number"
                  min="0"
                  value={formData.totalAmount}
                  onChange={handleChange}
                  required
                />
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
                disabled={booking.status === "checked_in"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending" disabled>Pending</SelectItem>
                  <SelectItem value="reserved" disabled>Reserved</SelectItem>
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
              className="bg-chart-5  px-10 hover:bg-chart-5/90 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-chart-1 hover:bg-chart-1/90 cursor-pointer"
            >
              Save Changes
            </Button>
          </article>
        </form>
      </DialogContent>
    </Dialog>
  );
}
