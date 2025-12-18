"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { unitKeys } from "@/hooks/useUnitDetails";
import Image from "next/image";
import {
  ClientMediaService,
  type UploadResult,
} from "@/lib/services/clientMediaService";
import {
  FileSchema,
  EditUnitFormData,
  EditUnitSchema,
} from "@/lib/schemas/properties";
import type { Unit } from "@/lib/types/types";

interface ExistingImage {
  id: string;
  filename: string;
  originalName: string;
  filePath: string;
  markedForDelete?: boolean;
}

interface EditUnitFormProps {
  unitId: string;
  propertyId: string;
  initialUnit: Unit;
}

function EditUnitForm({ unitId, propertyId, initialUnit }: EditUnitFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isDragActive, setIsDragActive] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>(
    initialUnit.media.map((img) => ({
      ...img,
      markedForDelete: false,
    }))
  );
  const [imageError, setImageError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditUnitFormData>({
    mode: "all",
    resolver: zodResolver(EditUnitSchema),
    defaultValues: {
      name: initialUnit.name,
      type: initialUnit.type,
      rent: initialUnit.rent,
      bedrooms: initialUnit.bedrooms || 1,
      bathrooms: initialUnit.bathrooms || 0,
      maxGuests: initialUnit.maxGuests || 1,
    },
  });

  const unitType = watch("type");

  /* ---------------- Helper Functions ---------------- */
  const getActiveExistingImages = () =>
    existingImages.filter((img) => !img.markedForDelete);

  const getTotalImageCount = () =>
    getActiveExistingImages().length + newImages.length;

  const getAllExistingNames = () => {
    const existingNames = getActiveExistingImages().map((img) =>
      img.originalName.toLowerCase()
    );
    const newNames = newImages.map((file) => file.name.toLowerCase());
    return [...existingNames, ...newNames];
  };

  const validateAndClearError = () => {
    const totalCount = getTotalImageCount();

    if (totalCount > 0 && totalCount <= 10) {
      setImageError(null);
    }
  };

  const isFormValid = () => {
    const totalCount = getTotalImageCount();
    return totalCount > 0 && totalCount <= 10 && !imageError;
  };

  /* ---------------- Update Mutation ---------------- */
  const updateMutation = useMutation({
    mutationFn: async ({
      data,
      uploadedImages,
      imagesToDelete,
    }: {
      data: EditUnitFormData;
      uploadedImages: UploadResult[];
      imagesToDelete: string[];
    }) => {
      const response = await fetch(
        `/api/units/${unitId}/update?propertyId=${propertyId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            newImages: uploadedImages,
            imagesToDelete,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update unit");
      }

      return response.json();
    },
    onSuccess: async (_, { data }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["property", "units"],
        }),
        queryClient.invalidateQueries({
          queryKey: unitKeys.details(unitId, propertyId),
        }),
      ]);

      reset();
      setExistingImages([]);
      setNewImages([]);

      toast.success(`${data.name} updated successfully.`);
      router.push(`/properties/${propertyId}/units/${unitId}`);
    },
    onError: async (error, { uploadedImages }) => {
      console.error("Error updating unit: ", error);

      if (uploadedImages.length > 0) {
        console.log("Cleaning up uploaded images...");
        await ClientMediaService.deleteFromSupabase(
          uploadedImages.map((img) => img.filename)
        );
      }

      const errMsg =
        error instanceof Error ? error.message : "Failed to update unit.";
      toast.error(errMsg);
    },
  });

  /* ---------------- Image handling ---------------- */
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    setImageError(null);
    const validFiles: File[] = [];
    const duplicateFiles: string[] = [];
    const existingNames = getAllExistingNames();

    for (const file of Array.from(files)) {
      // Validate file type and size
      const result = FileSchema.safeParse(file);
      if (!result.success) {
        setImageError(result.error.errors[0].message);
        return;
      }

      // Check for duplicate filename
      if (existingNames.includes(file.name.toLowerCase())) {
        duplicateFiles.push(file.name);
        continue;
      }

      validFiles.push(file);
      existingNames.push(file.name.toLowerCase());
    }

    // Show warning for duplicates
    if (duplicateFiles.length > 0) {
      toast.warning(
        `Skipped duplicate image(s): ${duplicateFiles.join(", ")}`,
        { duration: 4000 }
      );
    }

    // Check total count
    const activeExistingCount = getActiveExistingImages().length;
    const totalAfterAdd =
      activeExistingCount + newImages.length + validFiles.length;

    if (totalAfterAdd > 10) {
      setImageError(
        `Maximum 10 images allowed. You have ${activeExistingCount} existing and ${newImages.length} new images.`
      );
      return;
    }

    if (validFiles.length > 0) {
      setNewImages((prev) => [...prev, ...validFiles]);
      setImageError(null);
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setTimeout(validateAndClearError, 0);
  };

  const toggleDeleteExistingImage = (imageId: string) => {
    setExistingImages((prev) =>
      prev.map((img) =>
        img.id === imageId
          ? { ...img, markedForDelete: !img.markedForDelete }
          : img
      )
    );
    setTimeout(validateAndClearError, 0);
  };

  /* ---------------- Drag and drop ---------------- */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  /* ---------------- Form submission ---------------- */
  const onSubmit: SubmitHandler<EditUnitFormData> = async (data) => {
    const totalImages = getTotalImageCount();

    if (totalImages === 0) {
      setImageError("At least one image is required.");
      return;
    }

    if (totalImages > 10) {
      setImageError("Maximum 10 images allowed.");
      return;
    }

    setIsUploading(true);
    let uploadedImages: UploadResult[] = [];

    try {
      const imagesToDeleteFromStorage = existingImages
        .filter((img) => img.markedForDelete)
        .map((img) => img.filename);

      if (imagesToDeleteFromStorage.length > 0) {
        toast.info("Removing deleted images...", { duration: 3000 });
        await ClientMediaService.deleteFromSupabase(imagesToDeleteFromStorage);
      }

      if (newImages.length > 0) {
        toast.info("Uploading new images...", { duration: 5000 });
        uploadedImages = await ClientMediaService.processAndUploadImages(
          newImages,
          "unit"
        );
      }

      toast.info("Updating unit...", { duration: 5000 });

      const imagesToDelete = existingImages
        .filter((img) => img.markedForDelete)
        .map((img) => img.id);

      await updateMutation.mutateAsync({
        data,
        uploadedImages,
        imagesToDelete,
      });
    } catch (error) {
      console.error("Failed to update unit: ", error);
      toast.error("Failed to update unit.");
    } finally {
      setIsUploading(false);
    }
  };

  const isLoading = isSubmitting || isUploading;
  const canSubmit = isFormValid() && !isLoading && !updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="lg:col-span-2 space-y-6">
        {/* Basic Unit Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="mb-1.5 block">
                  Unit Name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter unit name"
                  className={cn(errors.name && "border border-red-400")}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="type" className="mb-1.5 block">
                  Unit Type
                </Label>
                <Select
                  value={unitType}
                  onValueChange={(value) => setValue("type", value)}
                >
                  <SelectTrigger
                    className={cn(
                      "w-full",
                      errors.type && "border border-red-400"
                    )}
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.type.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="rent" className="mb-1.5 block">
                Rent (KES)
              </Label>
              <Input
                id="rent"
                type="number"
                placeholder="Enter unit rent"
                className={cn(errors.rent && "border border-red-400")}
                {...register("rent", { valueAsNumber: true })}
              />
              {errors.rent && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.rent.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Unit Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Unit Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bedrooms" className="mb-1.5 block">
                  Bedrooms
                </Label>
                <Input
                  id="bedrooms"
                  type="number"
                  placeholder="Number of bedrooms"
                  className={cn(errors.bedrooms && "border border-red-400")}
                  {...register("bedrooms", { valueAsNumber: true })}
                />
                {errors.bedrooms && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.bedrooms.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="bathrooms" className="mb-1.5 block">
                  Bathrooms
                </Label>
                <Input
                  id="bathrooms"
                  type="number"
                  min={0}
                  placeholder="Number of bathrooms"
                  className={cn(errors.bathrooms && "border border-red-400")}
                  {...register("bathrooms", { valueAsNumber: true })}
                />
                {errors.bathrooms && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.bathrooms.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="maxGuests" className="mb-1.5 block">
                Max Guests
              </Label>
              <Input
                id="maxGuests"
                type="number"
                min={1}
                placeholder="Maximum guests allowed"
                className={cn(errors.maxGuests && "border border-red-400")}
                {...register("maxGuests", { valueAsNumber: true })}
              />
              {errors.maxGuests && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.maxGuests.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Media Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Unit Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Current Images ({getActiveExistingImages().length})
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {existingImages.map((img, index) => (
                    <div
                      key={img.id}
                      className={cn(
                        "relative group",
                        img.markedForDelete && "opacity-50"
                      )}
                    >
                      <div className="aspect-square relative">
                        <Image
                          src={img.filePath}
                          alt={`${img.originalName} - ${index}`}
                          fill
                          sizes="auto"
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleDeleteExistingImage(img.id)}
                        disabled={isLoading || updateMutation.isPending}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                        title={
                          img.markedForDelete ? "Restore image" : "Delete image"
                        }
                      >
                        <X size={16} />
                      </button>
                      {img.markedForDelete && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                          <p className="text-white text-xs font-medium">
                            Marked for deletion
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {img.originalName}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Drag and Drop for New Images */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">
                Add New Images
              </p>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50",
                  (isLoading || updateMutation.isPending) &&
                    "opacity-50 cursor-not-allowed",
                  imageError && "border-red-400"
                )}
              >
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
                  multiple
                  onChange={(e) => handleFileSelect(e.target.files)}
                  disabled={isLoading || updateMutation.isPending}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="block cursor-pointer">
                  <p className="font-medium text-gray-900">
                    Drag and drop images here
                  </p>
                  <p className="text-sm text-gray-600">
                    or click to select files (Max 10 total, 10MB each)
                  </p>
                </label>
              </div>
            </div>

            {/* New Images Preview */}
            {newImages.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">
                  New Images ({newImages.length})
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {newImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square relative">
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index}`}
                          fill
                          sizes="auto"
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        disabled={isLoading || updateMutation.isPending}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={16} />
                      </button>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {file.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Image count indicator */}
            <p
              className={cn(
                "text-xs",
                getTotalImageCount() > 10
                  ? "text-red-500"
                  : "text-muted-foreground"
              )}
            >
              Total: {getTotalImageCount()}/10 images
            </p>

            {/* Error Message */}
            {imageError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm">
                {imageError}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="my-4 pt-4 flex gap-3 justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading || updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!canSubmit}
            className="w-48 cursor-pointer font-semibold"
          >
            {isLoading || updateMutation.isPending
              ? "Updating Unit..."
              : "Update Unit"}
          </Button>
        </div>
      </div>
    </form>
  );
}

export { EditUnitForm };
