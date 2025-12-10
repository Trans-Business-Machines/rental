"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
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
  SelectTrigger,
  SelectItem,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useUpdateGuest } from "@/hooks/useGuests";
import type { Guest } from "@/lib/types/types";

interface GuestEditDialogProps {
  guest: Guest;
  children?: React.ReactNode;
  isDialogOpen?: boolean;
  setIsDialogOpen?: (open: boolean) => void;
}

export function GuestEditDialog({
  guest,
  children,
  isDialogOpen: controlledOpen,
  setIsDialogOpen: controlledSetOpen,
}: GuestEditDialogProps) {
  const [formData, setFormData] = useState({
    firstName: guest.firstName,
    lastName: guest.lastName,
    email: guest.email,
    phone: guest.phone,
    idNumber: guest.idNumber || "",
    passportNumber: guest.passportNumber || "",
    notes: guest.notes || "",
    nationality: guest.nationality || "",
    idType: guest.idType || "",
    dateOfBirth: guest.dateOfBirth || "",
    address: guest.address || "",
    city: guest.city || "",
    country: guest.country || "",
    occupation: guest.occupation || "",
    employer: guest.employer || "",
    emergencyContactName: guest.emergencyContactName || "",
    emergencyContactPhone: guest.emergencyContactPhone || "",
    emergencyContactRelation: guest.emergencyContactRelation || "",
    verificationStatus: guest.verificationStatus || "verified",
  });

  // Define state for uncontrolled dialog box
  const [internalOpen, setInternalOpen] = useState(false);

  // Determine if the dialog is a controlled or uncontrolled box
  const isControlled =
    controlledOpen !== undefined && controlledSetOpen !== undefined;

  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledSetOpen : setInternalOpen;

  // Get the mutatation trigger and loading state
  const { mutate, isPending } = useUpdateGuest({
    setOpen,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "idType") {
      if (value === "passport") {
        setFormData((prev) => ({ ...prev, [name]: value, idNumber: "" }));
      } else if (value === "national_id") {
        setFormData((prev) => ({ ...prev, [name]: value, passportNumber: "" }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Update the guest
    mutate({ guestId: guest.id, values: formData });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && <DialogTrigger asChild>{children}</DialogTrigger>}

      <DialogContent className="w-11/12  lg:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Guest Information</DialogTitle>
          <DialogDescription>
            Update guest details and information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <article className="space-y-4">
            <h3 className="font-semibold text-foreground">
              Personal Information
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  name="nationality"
                  value={formData.nationality}
                  disabled
                />
              </div>
            </div>
          </article>

          {/* Identification */}
          <article className="space-y-4">
            <h3 className="font-semibold text-foreground">Identification</h3>

            <div className="space-y-3">
              <Label>ID Type</Label>
              <RadioGroup value={formData.idType} disabled>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="national_id" id="national-id" />
                  <Label htmlFor="national-id" className="font-normal">
                    National ID
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="passport" id="passport" />
                  <Label htmlFor="passport" className="font-normal">
                    Passport
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              {formData.idType === "national_id" && (
                <div className="space-y-2 w-full">
                  <Label htmlFor="idNumber">National ID Number</Label>
                  <Input
                    id="idNumber"
                    type="text"
                    value={formData.idNumber}
                    disabled
                  />
                </div>
              )}
              {formData.idType === "passport" && (
                <div className="space-y-2">
                  <Label htmlFor="passportNumber">Passport Number</Label>
                  <Input
                    id="passportNumber"
                    type="text"
                    value={formData.passportNumber}
                    disabled
                  />
                </div>
              )}
            </div>
          </article>

          {/* Address Information */}
          <article className="space-y-4">
            <h3 className="font-semibold text-foreground">
              Address (optional)
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="e.g 123 main street"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  placeholder="e.g Nairobi"
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  placeholder="e.g Kenya"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>
            </div>
          </article>

          {/* Professional Information */}
          <article className="space-y-4">
            <h3 className="font-semibold text-foreground">
              Professional Information (optional)
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  name="occupation"
                  value={formData.occupation}
                  placeholder="e.g Software Engineer"
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employer">Employer</Label>
                <Input
                  id="employer"
                  name="employer"
                  placeholder="e.g company name"
                  value={formData.employer}
                  onChange={handleChange}
                />
              </div>
            </div>
          </article>

          {/* Emergency Contact */}
          <article className="space-y-4">
            <h3 className="font-semibold text-foreground">
              Emergency Contact (optional)
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName">Contact Name</Label>
                <Input
                  id="emergencyContactName"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  placeholder="e.g John Doe"
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                <Input
                  id="emergencyContactPhone"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  placeholder="07xxxxxxxx"
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="emergencyContactRelation">Relationship</Label>
                <Input
                  id="emergencyContactRelation"
                  name="emergencyContactRelation"
                  placeholder="e.g mother, father, spouse et.c"
                  value={formData.emergencyContactRelation}
                  onChange={handleChange}
                />
              </div>
            </div>
          </article>

          {/* Status */}
          <article className="space-y-4">
            <h3 className="font-semibold text-foreground">
              Status<span className="text-chart-5">*</span>
            </h3>
            <div className="space-y-2">
              <Label htmlFor="verificationStatus">Verification Status</Label>
              <Select
                value={formData.verificationStatus}
                onValueChange={(value) =>
                  handleSelectChange("verificationStatus", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </article>

          {/* Notes */}
          <article className="space-y-4">
            <h3 className="font-semibold text-foreground">
              Additional Notes (optional)
            </h3>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any additional notes about this guest..."
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
              disabled={isPending}
              className="bg-chart-1 hover:bg-chart-1/90 cursor-pointer"
            >
              {isPending ? "Saving..." : " Save Changes"}
            </Button>
          </article>
        </form>
      </DialogContent>
    </Dialog>
  );
}
