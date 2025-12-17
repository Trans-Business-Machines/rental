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
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import {
  ClientMediaService,
  type UploadResult,
} from "@/lib/services/clientMediaService";
import {
  FileSchema,
  EditPropertyFormData,
  EditPropertySchema,
} from "@/lib/schemas/properties";
import type { Property } from "@/lib/types/types";

interface ExistingImage {
  id: string;
  filename: string;
  originalName: string;
  filePath: string;
  markedForDelete?: boolean;
}

interface EditPropertyFormProps {
  propertyId: string;
  initialProperty: Property;
}

export function EditPropertyForm({
  propertyId,
  initialProperty,
}: EditPropertyFormProps) {
  const router = useRouter();
  const [isDragActive, setIsDragActive] = useState(false);

  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>(
    initialProperty.media.map((img) => ({
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
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditPropertyFormData>({
    mode: "all",
    resolver: zodResolver(EditPropertySchema),
    defaultValues: {
      name: initialProperty.name,
      address: initialProperty.address,
      type: initialProperty.type,
      rent: initialProperty.rent,
      maxBedrooms: initialProperty.maxBedrooms || 1,
      maxBathrooms: initialProperty.maxBathrooms || 1,
      description: initialProperty.description,
    },
  });

  const propertyType = watch("type");

  /* ---------------- Update Mutation ---------------- */
  const updateMutation = useMutation({
    mutationFn: async ({
      data,
      uploadedImages,
      imagesToDelete,
    }: {
      data: EditPropertyFormData;
      uploadedImages: UploadResult[];
      imagesToDelete: string[];
    }) => {
      const response = await fetch(`/api/properties/${propertyId}/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          newImages: uploadedImages,
          imagesToDelete,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update property");
      }

      return response.json();
    },
    onSuccess: (_, { data }) => {
      toast.success(`${data.name} updated successfully.`);
      router.push(`/properties/${propertyId}`);
    },
    onError: async (error, { uploadedImages }) => {
      console.error("Error updating property: ", error);

      // Cleanup newly uploaded images on error
      if (uploadedImages.length > 0) {
        console.log("Cleaning up uploaded images...");
        await ClientMediaService.deleteFromSupabase(
          uploadedImages.map((img) => img.filename)
        );
      }

      const errMsg =
        error instanceof Error ? error.message : "Failed to update property.";
      toast.error(errMsg);
    },
  });

  /* ---------------- Image handling ---------------- */
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

    const activeExistingCount = existingImages.filter(
      (img) => !img.markedForDelete
    ).length;

    const totalAfterAdd =
      activeExistingCount + newImages.length + newFiles.length;

    if (totalAfterAdd > 10) {
      setImageError(
        `Maximum 10 images allowed. You have ${activeExistingCount} existing images.`
      );
      return;
    }

    setNewImages((prev) => [...prev, ...newFiles]);
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleDeleteExistingImage = (imageId: string) => {
    setExistingImages((prev) =>
      prev.map((img) =>
        img.id === imageId
          ? { ...img, markedForDelete: !img.markedForDelete }
          : img
      )
    );
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
  const onSubmit: SubmitHandler<EditPropertyFormData> = async (data) => {
    // Check if at least one image will remain
    const activeExistingCount = existingImages.filter(
      (img) => !img.markedForDelete
    ).length;
    const totalImages = activeExistingCount + newImages.length;

    if (totalImages === 0) {
      setImageError("At least one image is required.");
      return;
    }

    setIsUploading(true);
    let uploadedImages: UploadResult[] = [];

    try {
      // Step 1: Delete images marked for deletion from Supabase
      const imagesToDeleteFromStorage = existingImages
        .filter((img) => img.markedForDelete)
        .map((img) => img.filename);

      if (imagesToDeleteFromStorage.length > 0) {
        toast.info("Removing deleted images...", { duration: 3000 });
        await ClientMediaService.deleteFromSupabase(imagesToDeleteFromStorage);
      }

      // Step 2: Upload new images to Supabase
      if (newImages.length > 0) {
        toast.info("Uploading new images...", { duration: 5000 });
        uploadedImages = await ClientMediaService.processAndUploadImages(
          newImages,
          "property"
        );
      }

      toast.info("Updating property...", { duration: 5000 });

      // Step 3: Send data to server
      const imagesToDelete = existingImages
        .filter((img) => img.markedForDelete)
        .map((img) => img.id);

      await updateMutation.mutateAsync({
        data,
        uploadedImages,
        imagesToDelete,
      });
    } catch (error) {
      console.error("Failed to update property: ", error);
      toast.error("Failed to update property.");
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
                  Base Rent (KES)
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
                  Max Bedrooms
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
                  min={0}
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

        {/* Media Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Property Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Current Images (
                  {existingImages.filter((img) => !img.markedForDelete).length})
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
            disabled={isLoading || updateMutation.isPending}
            className="w-48 cursor-pointer font-semibold"
          >
            {isLoading || updateMutation.isPending
              ? "Updating Property..."
              : "Update Property"}
          </Button>
        </div>
      </div>
    </form>
  );
}
