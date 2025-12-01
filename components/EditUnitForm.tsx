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
import type { Unit } from "@/lib/types/types";
import z from "zod";

// Define file schema
const FileSchema = z
  .instanceof(File)
  .refine(
    (file) =>
      [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "images/avif",
      ].includes(file.type),
    "Only jpeg, jpg, png,avif, and webp images are allowed."
  )
  .refine(
    (file) => file.size < 10 * 1024 * 1024,
    "File size must less than 10MB."
  );

// Define the  New property schema
const EditUnitSchema = z.object({
  name: z.string().min(1, "unit name is required."),
  type: z.string().min(1, "unit type is required."),
  rent: z
    .number()
    .positive("rent must a positve integer.")
    .min(1, "minimum is 1"),
  bedrooms: z
    .number()
    .positive("bedrooms must a positve integer.")
    .min(1, "minimum is 1"),
  bathrooms: z.number().positive("bathrooms must a positve integer."),
  maxGuests: z.number().positive("max guests must a positve integer."),
  images: z.array(FileSchema).optional(),
});

type EditUnitType = z.infer<typeof EditUnitSchema>;

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
  // Component state
  const [isDragActive, setIsDragActive] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>(
    initialUnit.media.map((img) => ({
      ...img,
      markedForDelete: false,
    }))
  );
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Get query client and router objects
  const router = useRouter();
  const queryClient = useQueryClient();

  // React hook form management
  const {
    register,
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditUnitType>({
    mode: "all",
    resolver: zodResolver(EditUnitSchema),
    defaultValues: {
      name: initialUnit.name,
      type: initialUnit.type,
      rent: initialUnit.rent,
      bedrooms: initialUnit.bedrooms || 1,
      bathrooms: initialUnit.bathrooms || 0,
      maxGuests: initialUnit.maxGuests || 1,
      images: [],
    },
  });

  const unitType = watch("type");

  /* ---------------- Mutation for form submission data goes here---------------- */
  const updateMutation = useMutation({
    mutationFn: async (data: EditUnitType) => {
      const formData = new FormData();

      // Append property details
      formData.append("name", data.name);
      formData.append("type", data.type);
      formData.append("rent", data.rent.toString());
      formData.append("bedrooms", data.bedrooms.toString());
      formData.append("bathrooms", data.bathrooms.toString());
      formData.append("maxGuests", data.maxGuests.toString());

      // Append images to delete
      const imagesToDelete = existingImages
        .filter((img) => img.markedForDelete)
        .map((img) => img.id);

      formData.append("imagesToDelete", JSON.stringify(imagesToDelete));

      // Append new images
      newImages.forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch(
        `/api/units/${unitId}/update?propertyId=${propertyId}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update property");
      }

      return response.json();
    },
    onSuccess: async (_, prop) => {
      // invalidate the queries that display unit data

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["property", "units"],
        }),
        queryClient.invalidateQueries({
          queryKey: unitKeys.details(unitId, propertyId),
        }),
      ]);

      // Reset the form
      reset();
      setExistingImages([]);
      setNewImages([]);

      //  show success message
      toast.success(`${prop.name} updated successfully.`);

      // Navigate to the unit details page
      router.push(`/properties/${propertyId}/units/${unitId}`);
    },
    onError: (error) => {
      console.error("Error updating property: ", error);
      setUploadError("Failed to update property");
    },
  });

  /* ---------------- Image handling functions ---------------- */
  const addNewImages = (files: File[]) => {
    const validImages = files.filter((file) => file.type.startsWith("image/"));

    if (validImages.length === 0) {
      setUploadError("No valid image files selected");
      return;
    }

    const allImages = [...newImages, ...validImages];
    const totalImages =
      existingImages.filter((img) => !img.markedForDelete).length +
      allImages.length;

    if (totalImages > 10) {
      setUploadError(
        `Maximum 10 images allowed. You have ${existingImages.filter((img) => !img.markedForDelete).length} existing images.`
      );
      return;
    }

    setNewImages(allImages);
    setValue("images", allImages);
    setUploadError(null);
  };

  const removeNewImage = (index: number) => {
    const updated = newImages.filter((_, i) => i !== index);
    setNewImages(updated);
    setValue("images", updated);
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

  /* ---------------- Drag and drop functions ---------------- */
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    addNewImages(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.currentTarget.files || []);
    addNewImages(files);
  };

  /* ---------------- onSubmit handler ---------------- */
  const onSubmit: SubmitHandler<EditUnitType> = (data) => {
    console.log(data);
    updateMutation.mutate(data);
  };

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
                Rent
              </Label>
              <Input
                id="rent"
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
                <Label htmlFor="max-bedrooms" className="mb-1.5 block">
                  Bedrooms
                </Label>
                <Input
                  id="max-bedrooms"
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
                <Label htmlFor="max-bathrooms" className="mb-1.5 block">
                  Bathrooms
                </Label>
                <Input
                  id="max-bathrooms"
                  type="number"
                  min={1}
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
              <Label htmlFor="max-guests" className="mb-1.5 block">
                Max Guests
              </Label>
              <Input
                id="max-guests"
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

        {/* Media Upload goes here */}
        <Card>
          <CardHeader>
            <CardTitle>Unit Images</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Existing Images Preview */}
            {existingImages.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Current Images (
                  {existingImages.filter((img) => !img.markedForDelete).length})
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {existingImages.map((img) => (
                    <div
                      key={img.id}
                      className={`relative group ${img.markedForDelete ? "opacity-50" : ""}`}
                    >
                      <img
                        src={img.filePath}
                        alt={img.originalName}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => toggleDeleteExistingImage(img.id)}
                        disabled={isSubmitting || updateMutation.isPending}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                        title={
                          img.markedForDelete ? "Restore image" : "Delete image"
                        }
                      >
                        <X size={16} />
                      </button>
                      {img.markedForDelete && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                          <p className="text-white text-xs font-medium">
                            Marked for deletion
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {img.originalName}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Drag and drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
                isDragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              } ${isSubmitting || updateMutation.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                disabled={isSubmitting}
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

            {/* Images preview */}
            {newImages.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">
                  New Images ({newImages.length})
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {newImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        disabled={isSubmitting || updateMutation.isPending}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={16} />
                      </button>
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {file.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {(errors.images || uploadError) && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm">
                {errors.images?.message || uploadError}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error from API */}
        {updateMutation.isError && (
          <div className="bg-red-50 border border-red-200 text-red-400 p-4 rounded">
            <p className="font-medium">Failed to create unit.</p>
            <p className="text-sm">{uploadError}</p>
          </div>
        )}

        {/* Action button */}
        <div className="my-4 pt-4 flex gap-3 justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting || updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || updateMutation.isPending}
            className="w-48 cursor-pointer font-semibold"
          >
            {updateMutation.isPending ? "Updating unit. . ." : "Update unit"}
          </Button>
        </div>
      </div>
    </form>
  );
}

export { EditUnitForm };
