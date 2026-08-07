"use client";

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { ClientMediaService } from "@/lib/services/clientMediaService";
import { ImageUploadSlot } from "@/components/ImageUploadSlot";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { GuestEditSchema, type GuestEditFormData } from "@/lib/schemas/guests";
import type { Guest, GuestUpdateFormData, ImageSlot } from "@/lib/types/types";

interface GuestEditDialogProps {
  guest: Guest;
  children?: React.ReactNode;
  isDialogOpen?: boolean;
  setIsDialogOpen?: (open: boolean) => void;
  onReviewed?: () => void;
}

const emptySlot: ImageSlot = { file: null, preview: null, uploadedUrl: null };

export function GuestEditDialog({
  guest,
  children,
  isDialogOpen: controlledOpen,
  setIsDialogOpen: controlledSetOpen,
  onReviewed,
}: GuestEditDialogProps) {
  // Dialog control
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled =
    controlledOpen !== undefined && controlledSetOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledSetOpen : setInternalOpen;

  // Image state — initialize previews from existing guest URLs
  const [frontImage, setFrontImage] = useState<ImageSlot>(
    guest.idFrontUrl
      ? { file: null, preview: guest.idFrontUrl, uploadedUrl: guest.idFrontUrl }
      : emptySlot,
  );
  const [backImage, setBackImage] = useState<ImageSlot>(
    guest.idBackUrl
      ? { file: null, preview: guest.idBackUrl, uploadedUrl: guest.idBackUrl }
      : emptySlot,
  );
  const [passportImage, setPassportImage] = useState<ImageSlot>(
    guest.passportUrl
      ? {
          file: null,
          preview: guest.passportUrl,
          uploadedUrl: guest.passportUrl,
        }
      : emptySlot,
  );

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // File input refs
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const passportInputRef = useRef<HTMLInputElement>(null);

  const { mutate: updateGuestDetails, isPending } = useUpdateGuest({ setOpen });

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestEditFormData>({
    mode: "onChange",
    resolver: zodResolver(GuestEditSchema),
    defaultValues: {
      firstName: guest.firstName,
      lastName: guest.lastName,
      email: guest.email,
      phone: guest.phone,
      dateOfBirth: guest.dateOfBirth || "",
      nationality: guest.nationality || "",
      idType: (guest.idType as "national_id" | "passport") || "national_id",
      idNumber: guest.idNumber || "",
      passportNumber: guest.passportNumber || "",
      address: guest.address || "",
      city: guest.city || "",
      country: guest.country || "",
      occupation: guest.occupation || "",
      employer: guest.employer || "",
      emergencyContactName: guest.emergencyContactName || "",
      emergencyContactPhone: guest.emergencyContactPhone || "",
      emergencyContactRelation: guest.emergencyContactRelation || "",
      verificationStatus:
        (guest.verificationStatus as "pending" | "verified" | "rejected") ||
        "verified",
      notes: guest.notes || "",
    },
  });

  const idType = watch("idType");
  const verificationStatus = watch("verificationStatus");
  const isRejected = verificationStatus === "rejected";
  const isSubmitting = isPending || isUploading;

  // -------------------- File handlers --------------------
  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<ImageSlot>>,
  ) => {
    const file = e.target.files?.[0];
    setUploadError(null);

    if (!file) return;

    const validation = ClientMediaService.validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || "Invalid file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setter({
        file,
        preview: reader.result as string,
        uploadedUrl: null,
      });
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (
    setter: React.Dispatch<React.SetStateAction<ImageSlot>>,
    inputRef: React.RefObject<HTMLInputElement | null>,
  ) => {
    setter(emptySlot);
    setUploadError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // -------------------- Submit --------------------
  const onSubmit = async (values: GuestEditFormData) => {
    const uploadedUrls: string[] = [];

    try {
      setIsUploading(true);

      // Start with existing URLs (keep unless replaced)
      let idFrontUrl = guest.idFrontUrl || undefined;
      let idBackUrl = guest.idBackUrl || undefined;
      let passportUrl = guest.passportUrl || undefined;

      if (values.idType === "national_id") {
        if (frontImage.file) {
          const newUrl = await ClientMediaService.uploadGuestIdImage(
            frontImage.file,
            "front",
            guest.idFrontUrl || undefined,
          );
          uploadedUrls.push(newUrl);
          idFrontUrl = newUrl;
        }

        if (backImage.file) {
          const newUrl = await ClientMediaService.uploadGuestIdImage(
            backImage.file,
            "back",
            guest.idBackUrl || undefined,
          );
          uploadedUrls.push(newUrl);
          idBackUrl = newUrl;
        }
      } else {
        if (passportImage.file) {
          const newUrl = await ClientMediaService.uploadGuestIdImage(
            passportImage.file,
            "passport",
            guest.passportUrl || undefined,
          );
          uploadedUrls.push(newUrl);
          passportUrl = newUrl;
        }
      }

      setIsUploading(false);

      const updatePayload: GuestUpdateFormData = {
        ...values,
        idNumber: values.idNumber || null,
        passportNumber: values.passportNumber || null,
        ...(values.idType === "national_id" && {
          idFrontUrl: idFrontUrl || null,
          idBackUrl: idBackUrl || null,
        }),
        ...(values.idType === "passport" && {
          passportUrl: passportUrl || null,
        }),
      };

      updateGuestDetails(
        { guestId: guest.id, values: updatePayload },
        {
          onSuccess: (updatedGuest) => {
            if (updatedGuest.verificationStatus !== "pending") {
              onReviewed?.();
            }
          },
        },
      );
    } catch (error) {
      setIsUploading(false);
      console.error("Error updating guest: ", error);
      toast.error("Failed to update guest details");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && <DialogTrigger asChild>{children}</DialogTrigger>}

      <DialogContent className="w-11/12 lg:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Guest Information</DialogTitle>
          <DialogDescription>
            Update guest details and information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information (disabled) */}
          <article className="space-y-4">
            <h3 className="font-semibold text-foreground">
              Personal Information
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" {...register("firstName")} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" {...register("lastName")} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("phone")} disabled />
              </div>
            </div>
          </article>

          {/* Identification (disabled + images editable) */}
          <article className="space-y-4">
            <h3 className="font-semibold text-foreground">Identification</h3>
            <div className="space-y-3">
              <Label>ID Type</Label>
              <RadioGroup value={idType} className="flex gap-4" disabled>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="national_id" id="edit_national_id" />
                  <Label htmlFor="edit_national_id">National ID</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="passport" id="edit_passport" />
                  <Label htmlFor="edit_passport">Passport</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {idType === "national_id" && (
                <div className="space-y-2 w-full">
                  <Label htmlFor="idNumber">National ID Number</Label>
                  <Input id="idNumber" {...register("idNumber")} disabled />
                </div>
              )}
              {idType === "passport" && (
                <div className="space-y-2">
                  <Label htmlFor="passportNumber">Passport Number</Label>
                  <Input
                    id="passportNumber"
                    {...register("passportNumber")}
                    disabled
                  />
                </div>
              )}
            </div>

            {/* ID Document Images */}
            <div className="space-y-3">
              <Label>
                {idType === "national_id"
                  ? "National ID Images (Front & Back)"
                  : "Passport Image"}
              </Label>
              <p className="text-xs text-muted-foreground">
                Select a new image to replace the existing one.
              </p>

              {idType === "national_id" ? (
                <div className="grid md:grid-cols-2 gap-4">
                  <ImageUploadSlot
                    label="Front"
                    image={frontImage}
                    inputRef={frontInputRef}
                    disabled={isSubmitting}
                    onSelect={(e) => handleFileSelect(e, setFrontImage)}
                    onRemove={() => removeFile(setFrontImage, frontInputRef)}
                  />
                  <ImageUploadSlot
                    label="Back"
                    image={backImage}
                    inputRef={backInputRef}
                    disabled={isSubmitting}
                    onSelect={(e) => handleFileSelect(e, setBackImage)}
                    onRemove={() => removeFile(setBackImage, backInputRef)}
                  />
                </div>
              ) : (
                <div className="max-w-sm">
                  <ImageUploadSlot
                    label="Passport"
                    image={passportImage}
                    inputRef={passportInputRef}
                    disabled={isSubmitting}
                    onSelect={(e) => handleFileSelect(e, setPassportImage)}
                    onRemove={() =>
                      removeFile(setPassportImage, passportInputRef)
                    }
                  />
                </div>
              )}

              {uploadError && (
                <p className="text-sm text-red-400">{uploadError}</p>
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
                  placeholder="e.g 123 main street"
                  className={cn(errors.address && "border-destructive")}
                  {...register("address")}
                />
                {errors.address && (
                  <p className="text-sm text-destructive">
                    {errors.address.message}
                  </p>
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="e.g Nairobi"
                  className={cn(errors.city && "border-destructive")}
                  {...register("city")}
                />
                {errors.city && (
                  <p className="text-sm text-destructive">
                    {errors.city.message}
                  </p>
                )}
              </div>
            </div>
          </article>

          {/* Professional Information */}
          <article className="space-y-4">
            <h3 className="font-semibold text-foreground">
              Professional (optional)
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  placeholder="e.g teacher, doctor"
                  className={cn(errors.occupation && "border-destructive")}
                  {...register("occupation")}
                />
                {errors.occupation && (
                  <p className="text-sm text-destructive">
                    {errors.occupation.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="employer">Employer</Label>
                <Input
                  id="employer"
                  placeholder="e.g Google, Microsoft"
                  className={cn(errors.employer && "border-destructive")}
                  {...register("employer")}
                />
                {errors.employer && (
                  <p className="text-sm text-destructive">
                    {errors.employer.message}
                  </p>
                )}
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
                  placeholder="e.g John Doe"
                  {...register("emergencyContactName")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                <Input
                  id="emergencyContactPhone"
                  placeholder="07xxxxxxxx"
                  className={cn(
                    errors.emergencyContactPhone && "border-destructive",
                  )}
                  {...register("emergencyContactPhone")}
                />
                {errors.emergencyContactPhone && (
                  <p className="text-sm text-destructive">
                    {errors.emergencyContactPhone.message}
                  </p>
                )}
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="emergencyContactRelation">Relationship</Label>
                <Input
                  id="emergencyContactRelation"
                  placeholder="e.g mother, father, spouse etc."
                  {...register("emergencyContactRelation")}
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
                value={verificationStatus}
                onValueChange={(value) =>
                  setValue(
                    "verificationStatus",
                    value as "pending" | "verified" | "rejected",
                    { shouldValidate: true },
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="pending"
                    disabled
                  >
                    Pending
                  </SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </article>

          {/* Notes */}
          <article className="space-y-4">
            <h3 className="font-semibold text-foreground">
              {isRejected ? "Rejection Reason" : "Additional Notes"}{" "}
              {isRejected ? (
                <span className="text-chart-5">*</span>
              ) : (
                "(optional)"
              )}
            </h3>
            <div className="space-y-2">
              <Label htmlFor="notes">
                {isRejected ? "Reason for rejection" : "Notes"}
              </Label>
              <Textarea
                id="notes"
                placeholder={
                  isRejected
                    ? "Please provide a reason for rejection..."
                    : "Additional notes about the guest..."
                }
                className={cn(errors.notes && "border-destructive")}
                rows={3}
                {...register("notes")}
              />
              {errors.notes && (
                <p className="text-sm text-destructive">
                  {errors.notes.message}
                </p>
              )}
            </div>
          </article>

          {/* Submit */}
          <div className="flex gap-4 pt-2">
            <Button
              type="submit"
              className="flex-1 cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader className="animate-spin h-4 w-4" />
                  <span>
                    {isUploading ? "Uploading images..." : "Saving changes..."}
                  </span>
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-1/4 cursor-pointer"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
