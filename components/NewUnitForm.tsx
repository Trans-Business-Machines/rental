"use client";

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
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import Image from "next/image";
import {
  ClientMediaService,
  type UploadResult,
} from "@/lib/services/clientMediaService";
import {
  FileSchema,
  NewUnitFormData,
  NewUnitSchema,
} from "@/lib/schemas/properties";

function NewUnitForm({ propertyId }: { propertyId: number }) {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const {
    register,
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewUnitFormData>({
    mode: "all",
    resolver: zodResolver(NewUnitSchema),
    defaultValues: {
      type: "apartment",
    },
  });

  const unitType = watch("type");

  /* ---------------- Mutation for form submission ---------------- */
  const createMutation = useMutation({
    mutationFn: async ({
      data,
      uploadedImages,
    }: {
      data: NewUnitFormData;
      uploadedImages: UploadResult[];
    }) => {
      const response = await fetch(
        `/api/properties/${propertyId}/create-unit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            images: uploadedImages,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create unit!");
      }

      return response.json();
    },
    onSuccess: (data) => {
      console.log("Unit created: ", data);
      toast.success(`${data.unit.name} created successfully.`);
      reset();
      setSelectedImages([]);
    },
    onError: async (error, { uploadedImages }) => {
      console.error("Error creating unit: ", error);

      // Cleanup uploaded images on error
      if (uploadedImages.length > 0) {
        console.log("Cleaning up uploaded images...");
        await ClientMediaService.deleteFromSupabase(
          uploadedImages.map((img) => img.filename)
        );
      }

      const errMsg =
        error instanceof Error ? error.message : "Failed to create unit.";
      toast.error(errMsg);
    },
  });

  /* ---------------- Image handling functions ---------------- */
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    setImageError(null);
    const newFiles: File[] = [];

    for (const file of Array.from(files)) {
      const result = FileSchema.safeParse(file);

      if (!result.success) {
        setImageError(result.error.errors[0].message);
        return;
      }

      newFiles.push(file);
    }

    if (selectedImages.length + newFiles.length > 10) {
      setImageError("Maximum of 10 images allowed.");
      return;
    }

    setSelectedImages((prev) => [...prev, ...newFiles]);
  };

  /* ---------------- Drag and drop functions ---------------- */
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

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  /* ---------------- onSubmit handler ---------------- */
  const onSubmit: SubmitHandler<NewUnitFormData> = async (data) => {
    if (selectedImages.length === 0) {
      setImageError("At least one image is required.");
      return;
    } else {
      setImageError(null);
    }

    setIsUploading(true);
    let uploadedImages: UploadResult[] = [];

    try {
      // Step 1: Upload images to Supabase
      toast.info("Uploading images...", { duration: 5000 });

      uploadedImages = await ClientMediaService.processAndUploadImages(
        selectedImages,
        "unit"
      );

      toast.info("Creating unit...", { duration: 5000 });

      // Step 2: Send unit data with URLs to server
      await createMutation.mutateAsync({ data, uploadedImages });
    } catch (error) {
      console.error("Failed to create unit: ", error);
      toast.error("Failed to create unit.");
    } finally {
      setIsUploading(false);
    }
  };

  const isLoading = isSubmitting || isUploading;

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
          <CardContent>
            {/* Drag and drop Area */}
            <div
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50",
                (isLoading || createMutation.isPending) &&
                  "opacity-50 cursor-not-allowed",
                imageError && "border-red-400"
              )}
            >
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                disabled={isLoading || createMutation.isPending}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="block cursor-pointer">
                <p className="font-medium text-gray-900">
                  Drag and drop images here.
                </p>
                <p className="text-sm text-gray-600">
                  or click to select files (Max 10 images, 10MB each)
                </p>
              </label>
            </div>

            {/* Error Message */}
            {imageError && (
              <p className="mt-2 text-sm text-red-400">{imageError}</p>
            )}

            {/* Images preview */}
            {selectedImages.length > 0 && (
              <>
                <p className="text-xs my-2 text-muted-foreground">
                  {selectedImages.length === 1
                    ? "1 image selected"
                    : `${selectedImages.length} images selected`}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {selectedImages.map((file, index) => (
                    <Card
                      key={index}
                      className="relative group overflow-hidden py-0"
                    >
                      <CardContent className="p-0">
                        <div className="aspect-square relative">
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            disabled={isLoading || createMutation.isPending}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            <X className="size-4" />
                          </button>
                          <div className="p-2 text-muted-foreground">
                            <p className="text-xs truncate">{file.name}</p>
                            <p className="text-xs truncate">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Action button */}
        <div className="my-4 pt-4 text-center">
          <Button
            type="submit"
            disabled={isLoading || createMutation.isPending}
            className="w-2/3 cursor-pointer font-semibold"
          >
            {createMutation.isPending || isLoading
              ? "Creating Unit..."
              : "Create Unit"}
          </Button>
        </div>
      </div>
    </form>
  );
}

export { NewUnitForm };
