"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { NationalityCombobox } from "@/components/NationalityCombobox";
import { useCreateGuest } from "@/hooks/useGuests";
import { deleteGuestImages } from "@/lib/actions/guests";
import { ClientMediaService } from "@/lib/services/clientMediaService";
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";
import { ImageUploadSlot } from "@/components/ImageUploadSlot";
import {
  GuestSchema,
  type NewGuest,
  type GuestIdTypes,
} from "@/lib/schemas/guests";
import type { ImageSlot } from "@/lib/types/types";

interface GuestFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  userId: string;
}

const emptySlot: ImageSlot = { file: null, preview: null, uploadedUrl: null };

export function GuestForm({
  onCancel,
  onSuccess: closeModal,
  userId,
}: GuestFormProps) {
  const createGuestMutation = useCreateGuest();

  // Refs for file inputs
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const passportInputRef = useRef<HTMLInputElement>(null);

  // Image state one slot per document side
  const [frontImage, setFrontImage] = useState<ImageSlot>(emptySlot);
  const [backImage, setBackImage] = useState<ImageSlot>(emptySlot);
  const [passportImage, setPassportImage] = useState<ImageSlot>(emptySlot);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    register,
    watch,
    setValue,
    reset,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<NewGuest>({
    mode: "all",
    resolver: zodResolver(GuestSchema),
    defaultValues: {
      idType: "national_id",
    },
  });

  const idType = watch("idType");

  // ------------------------- File handlers -------------------------

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

  // Clear all images when switching ID type
  const handleIdTypeChange = (value: GuestIdTypes) => {
    setValue("idType", value);
    setFrontImage(emptySlot);
    setBackImage(emptySlot);
    setPassportImage(emptySlot);
    setUploadError(null);

    if (frontInputRef.current) frontInputRef.current.value = "";
    if (backInputRef.current) backInputRef.current.value = "";
    if (passportInputRef.current) passportInputRef.current.value = "";
  };

  // ------------------------- Submit -------------------------
  const onSubmit: SubmitHandler<NewGuest> = async (values) => {
    if (idType === "national_id") {
      if (!frontImage.file) {
        setUploadError("Front ID image is required.");
        return;
      }
      if (!backImage.file) {
        setUploadError("Back ID image is required.");
        return;
      }
    } else {
      if (!passportImage.file) {
        setUploadError("Passport image is required.");
        return;
      }
    }

    const uploadedUrls: string[] = [];

    try {
      setIsUploading(true);

      let idFrontUrl: string | undefined;
      let idBackUrl: string | undefined;
      let passportUrl: string | undefined;

      if (idType === "national_id") {
        idFrontUrl = await ClientMediaService.uploadGuestIdImage(
          frontImage.file!,
          "front",
        );
        uploadedUrls.push(idFrontUrl);

        idBackUrl = await ClientMediaService.uploadGuestIdImage(
          backImage.file!,
          "back",
        );
        uploadedUrls.push(idBackUrl);
      } else {
        passportUrl = await ClientMediaService.uploadGuestIdImage(
          passportImage.file!,
          "passport",
        );
        uploadedUrls.push(passportUrl);
      }

      setIsUploading(false);

      if (values.idType === "national_id") {
        if (!idFrontUrl || !idBackUrl) {
          setUploadError("Failed to upload ID images.");
          return;
        }

        await createGuestMutation.mutateAsync({
          ...values,
          registeredBy: userId,
          idFrontUrl,
          idBackUrl,
        });
      } else {
        if (!passportUrl) {
          setUploadError("Failed to upload passport image.");
          return;
        }

        await createGuestMutation.mutateAsync({
          ...values,
          registeredBy: userId,
          passportUrl,
        });
      }

      reset();
      setFrontImage(emptySlot);
      setBackImage(emptySlot);
      setPassportImage(emptySlot);
      closeModal();
    } catch {
      setIsUploading(false);
      const result = await deleteGuestImages(uploadedUrls);
      console.log("Image delete message: ", result.message);
    }
  };

  const isSubmitting = createGuestMutation.isPending || isUploading;

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      {/* First and Last Names */}
      <article className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            placeholder="First name"
            className={cn(errors.firstName && "border border-red-400")}
            {...register("firstName")}
          />
          {errors.firstName && (
            <p className="text-sm mt-1 text-red-400">
              {errors.firstName.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            placeholder="Last name"
            className={cn(errors.lastName && "border border-red-400")}
            {...register("lastName")}
          />
          {errors.lastName && (
            <p className="text-sm mt-1 text-red-400">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </article>

      {/* Email and Phone */}
      <article className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Email address"
            className={cn(errors.email && "border border-red-400")}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm mt-1 text-red-400">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Mobile No.</Label>
          <Input
            id="phone"
            placeholder="Mobile number"
            className={cn(errors.phone && "border border-red-400")}
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-sm mt-1 text-red-400">{errors.phone.message}</p>
          )}
        </div>
      </article>

      {/* Date of Birth and Nationality */}
      <article className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            className={cn(errors.dateOfBirth && "border border-red-400")}
            {...register("dateOfBirth")}
          />
          {errors.dateOfBirth && (
            <p className="text-sm mt-1 text-red-400">
              {errors.dateOfBirth.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="nationality">Nationality</Label>
          <Controller
            name="nationality"
            control={control}
            render={({ field }) => (
              <NationalityCombobox
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
          {errors.nationality && (
            <p className="text-sm mt-1 text-red-400">
              {errors.nationality.message}
            </p>
          )}
        </div>
      </article>

      {/* ID Type and Identification Number */}
      <article>
        <div className="space-y-2 mb-2">
          <Label>Choose ID type</Label>
          <RadioGroup
            value={idType}
            onValueChange={(value: GuestIdTypes) => handleIdTypeChange(value)}
            className="flex"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="national_id" id="national_id_radio_btn" />
              <Label htmlFor="national_id_radio_btn" className="cursor-pointer">
                National ID
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="passport" id="passport_radio_btn" />
              <Label htmlFor="passport_radio_btn" className="cursor-pointer">
                Passport Number
              </Label>
            </div>
          </RadioGroup>
        </div>

        {idType === "national_id" ? (
          <>
            <Input
              id="national_id"
              type="text"
              placeholder="National ID number"
              className={cn(errors.idNumber && "border border-red-400")}
              {...register("idNumber")}
            />
            {errors.idNumber && (
              <p className="text-sm mt-1 text-red-400">
                {errors.idNumber.message}
              </p>
            )}
          </>
        ) : (
          <>
            <Input
              id="passport"
              type="text"
              placeholder="Passport number"
              className={cn(errors.passportNumber && "border border-red-400")}
              {...register("passportNumber")}
            />
            {errors.passportNumber && (
              <p className="text-sm mt-1 text-red-400">
                {errors.passportNumber.message}
              </p>
            )}
          </>
        )}
      </article>

      {/*  Guest Identification Images */}
      <article className="space-y-3">
        <Label>
          {idType === "national_id"
            ? "National ID Images (Front & Back)"
            : "Passport Image"}
        </Label>

        {idType === "national_id" ? (
          <div className="grid md:grid-cols-2 gap-4">
            {/* Front Image */}
            <ImageUploadSlot
              label="Front"
              image={frontImage}
              inputRef={frontInputRef}
              disabled={isSubmitting}
              onSelect={(e) => handleFileSelect(e, setFrontImage)}
              onRemove={() => removeFile(setFrontImage, frontInputRef)}
            />

            {/* Back Image */}
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
              onRemove={() => removeFile(setPassportImage, passportInputRef)}
            />
          </div>
        )}

        {uploadError && <p className="text-sm text-red-400">{uploadError}</p>}
      </article>

      {/* Notes */}
      <article className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Additional notes about the guest"
          className={cn(errors.notes && "border border-red-400")}
          {...register("notes")}
        />
        {errors.notes && (
          <p className="text-sm mt-1 text-red-400">{errors.notes.message}</p>
        )}
      </article>

      {/* Submit Buttons */}
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
                {isUploading ? "Uploading images..." : "Creating guest..."}
              </span>
            </span>
          ) : (
            "Create Guest"
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            className="bg-chart-5 w-1/4 hover:bg-chart-5/90 cursor-pointer"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
