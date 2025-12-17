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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "sonner";
import {
  ClientMediaService,
  type UploadResult,
} from "@/lib/services/clientMediaService";
import {
  FileSchema,
  NewPropertyFormData,
  NewPropertySchema,
} from "@/lib/schemas/properties";
import Image from "next/image";

function NewPropertyForm() {
  const router = useRouter();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  // React hook form management
  const {
    register,
    watch,
    reset,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewPropertyFormData>({
    mode: "all",
    resolver: zodResolver(NewPropertySchema),
    defaultValues: {
      type: "apartment",
    },
  });

  const propertyType = watch("type");

  /* ---------------- Mutation for form submission data goes here---------------- */
  const createMutation = useMutation({
    mutationFn: async ({
      data,
      uploadedImages,
    }: {
      data: NewPropertyFormData;
      uploadedImages: UploadResult[];
    }) => {
      //  make the API call
      const response = await fetch("/api/properties/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          images: uploadedImages,
        }),
      });

      // check for errors
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create property!");
      }

      return response.json();
    },
    onSuccess: (data) => {
      console.log("Property created: ", data);
      toast.success(`${data.property.name} created successfully.`);

      reset();
      setSelectedImages([]);

      router.push(`/properties/${data.property.id}`);
    },
    onError: async (error, { uploadedImages }) => {
      console.error("Error creating property: ", error);

      if (uploadedImages.length > 0) {
        console.log("Cleaning up uploaded images");
        const fileNames = uploadedImages.map((img) => img.filename);

        await ClientMediaService.deleteFromSupabase(fileNames);
      }

      const errMsg =
        error instanceof Error ? error.message : "Failed to create property.";
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

    // check total count
    if (selectedImages.length + newFiles.length > 10) {
      setImageError("Maximum of 10 images alllowed");
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
  const onSubmit: SubmitHandler<NewPropertyFormData> = async (data) => {
    if (selectedImages.length === 0) {
      setImageError("At least one image is required");
      return;
    }

    // set is uploading to true
    setIsUploading(true);
    let uploadedImages: UploadResult[] = [];

    try {
      // step 1: upload images to supabase
      toast.info("Uploading images...", {
        duration: 5000,
      });

      uploadedImages = await ClientMediaService.processAndUploadImages(
        selectedImages,
        "property"
      );

      toast.info("Creating property...", {
        duration: 5000,
      });

      // step 2: send the property data with URLS to server
      await createMutation.mutateAsync({ data, uploadedImages });
    } catch (error) {
      console.error("Failed to create property ", error);
      toast.error("Failed to create property");
    } finally {
      setIsUploading(false);
    }
  };

  const isLoading = isSubmitting || isUploading;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="lg:col-span-2 space-y-6">
        {/* Basic Property Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="mb-1.5 block">
                  Property Name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter property name"
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
                  Property Type
                </Label>

                <Select
                  value={propertyType}
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
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="bungalow">Bungalow</SelectItem>
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
              <Label htmlFor="address" className="mb-1.5 block">
                Address
              </Label>
              <Input
                id="address"
                placeholder="Enter full address"
                className={cn(errors.address && "border border-red-400")}
                {...register("address")}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.address.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Property Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Property Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="rent" className="mb-1.5 block">
                  Base Rent ($)
                </Label>
                <Input
                  id="rent"
                  type="number"
                  placeholder="0"
                  className={cn(errors.rent && "border border-red-400")}
                  {...register("rent", { valueAsNumber: true })}
                />
                {errors.rent && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.rent.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="max-bedrooms" className="mb-1.5 block">
                  Max bedrooms
                </Label>
                <Input
                  id="max-bedrooms"
                  type="number"
                  placeholder="1"
                  className={cn(errors.maxBedrooms && "border border-red-400")}
                  {...register("maxBedrooms", { valueAsNumber: true })}
                />
                {errors.maxBedrooms && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.maxBedrooms.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="max-bathrooms" className="mb-1.5 block">
                  Max Bathrooms
                </Label>
                <Input
                  id="max-bathrooms"
                  type="number"
                  min={1}
                  placeholder="1"
                  className={cn(errors.maxBathrooms && "border border-red-400")}
                  {...register("maxBathrooms", { valueAsNumber: true })}
                />
                {errors.maxBathrooms && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.maxBathrooms.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="mb-1.5 block">
                Description
              </Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Enter property description"
                className={cn(errors.description && "border border-red-400")}
                {...register("description")}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.description.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Media Upload goes here */}
        <Card>
          <CardHeader>
            <CardTitle>Property Images</CardTitle>
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
                disabled={isSubmitting || createMutation.isPending}
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
            {imageError && <p className="text-sm text-red-400">{imageError}</p>}

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
              ? "Creating Property..."
              : "Create Property"}
          </Button>
        </div>
      </div>
    </form>
  );
}

export { NewPropertyForm };
