// components/GuestForm.tsx
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { NationalityCombobox } from "@/components/NationalityCombobox";
import { useCreateGuest } from "@/hooks/useGuests";
import {
  ClientMediaService,
  UploadResult,
} from "@/lib/services/clientMediaService";
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Loader, Upload, X, FileText, Image as ImageIcon } from "lucide-react";
import {
  GuestSchema,
  type NewGuest,
  type GuestIdTypes,
} from "@/lib/schemas/guests";

interface GuestFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function GuestForm({ onCancel, onSuccess: closeModal }: GuestFormProps) {
  const createGuestMutation = useCreateGuest();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for file upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);

    if (!file) return;

    // Validate using ClientMediaService
    const validation = ClientMediaService.validateDocument(file);
    if (!validation.valid) {
      setUploadError(validation.error || "Invalid file");
      return;
    }

    setSelectedFile(file);
  };

  // Remove selected file
  const removeFile = () => {
    setSelectedFile(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Submit handler
  const onSubmit: SubmitHandler<NewGuest> = async (values) => {
    // Explicitly type as UploadResult | null
    let uploadedDocument: UploadResult | null = null;
    // Store filename separately for cleanup
    let uploadedFilename: string | null = null;

    try {
      // Upload file if selected
      if (selectedFile) {
        setIsUploading(true);
        try {
          const result =
            await ClientMediaService.uploadGuestDocument(selectedFile);
          uploadedDocument = result;
          uploadedFilename = result.filename; // Store filename for cleanup
        } catch (error) {
          setUploadError(
            error instanceof Error ? error.message : "Upload failed",
          );
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      // Create guest with ID document
      await createGuestMutation.mutateAsync({
        ...values,
        idDocument: uploadedDocument
          ? {
              filename: uploadedDocument.filename,
              originalName: uploadedDocument.originalName,
              fileSize: uploadedDocument.fileSize,
              mimeType: uploadedDocument.mimeType,
              filePath: uploadedDocument.url,
            }
          : undefined,
      });

      reset();
      removeFile();
      closeModal();
    } catch (error) {
      // Cleanup uploaded file if guest creation fails
      if (uploadedFilename) {
        try {
          await ClientMediaService.deleteGuestDocument(uploadedFilename);
        } catch (cleanupError) {
          console.error("Failed to cleanup uploaded document:", cleanupError);
        }
      }
      console.error("Error creating guest:", error);
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

      {/* Email and phone */}
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

      {/* ID type and identification */}
      <article>
        <div className="space-y-2 mb-2">
          <Label>Choose ID type</Label>
          <RadioGroup
            value={idType}
            onValueChange={(value: GuestIdTypes) => setValue("idType", value)}
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
              placeholder="National ID"
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

      {/* ID Document Upload */}
      <article className="space-y-2">
        <Label>
          {idType === "national_id" ? "National ID" : "Passport"} Image
        </Label>

        {!selectedFile ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
              "hover:border-primary hover:bg-muted/50",
              uploadError && "border-red-400",
            )}
          >
            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Click to upload ID document
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG, WebP (max 5MB)
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              {selectedFile.type.startsWith("image/") ? (
                <ImageIcon className="h-8 w-8 text-blue-500" />
              ) : (
                <FileText className="h-8 w-8 text-red-500" />
              )}
              <div>
                <p className="text-sm font-medium truncate max-w-[200px]">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={removeFile}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp, image/avif, image/jpg"
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploadError && <p className="text-sm text-red-400">{uploadError}</p>}
      </article>

      {/* Date of Birth and nationality */}
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
                error={errors.nationality?.message}
              />
            )}
          />
        </div>
      </article>

      {/* Additional notes */}
      <article className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          rows={4}
          placeholder="Additional notes about the guest"
          className={cn(errors.notes && "border border-red-400")}
          {...register("notes")}
        />
        {errors.notes && (
          <p className="text-sm mt-1 text-red-400">{errors.notes.message}</p>
        )}
      </article>

      {/* Action buttons */}
      <div className="flex justify-end space-x-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-chart-1 w-1/3 hover:bg-chart-1/90 cursor-pointer"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader className="animate-spin h-4 w-4" />
              <span>{isUploading ? "Uploading image..." : "Creating guest..."}</span>
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
