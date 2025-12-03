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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import z from "zod";

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
    "Only JPEG, PNG, WebP, and avif images are allowed"
  )
  .refine(
    (file) => file.size <= 10 * 1024 * 1024,
    "File size must be less than 10MB"
  );

const EditPropertySchema = z.object({
  name: z.string().min(1, "Property name is required."),
  address: z.string().min(10, "At least 10 characters are required"),
  type: z.string().min(1, "Property type is required."),
  rent: z
    .number()
    .positive("Rent must be a positive integer.")
    .min(1, "Minimum is 1"),
  maxBedrooms: z
    .number()
    .positive("Max bedrooms must be a positive integer.")
    .min(1, "Minimum is 1"),
  maxBathrooms: z
    .number()
    .positive("Max bathrooms must be a positive integer.")
    .min(0, "Minimum is 0"),
  description: z
    .string()
    .min(1, "description is required.")
    .max(1000, "At most 1000 characters allowed."),
  images: z.array(FileSchema).optional(),
});

type EditPropertyType = z.infer<typeof EditPropertySchema>;

interface ExistingImage {
  id: string;
  filename: string;
  originalName: string;
  filePath: string;
  markedForDelete?: boolean;
}

import type { Property } from "@/lib/types/types";

interface EditPropertyFormProps {
  propertyId: string;
  initialProperty: Property;
}

export function EditPropertyForm({
  propertyId,
  initialProperty,
}: EditPropertyFormProps) {
  /* ---------------------- Component state ----------------------  */
  const router = useRouter();
  const [isDragActive, setIsDragActive] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>(
    initialProperty.media.map((img) => ({
      ...img,
      markedForDelete: false,
    }))
  );
  const [uploadError, setUploadError] = useState<string | null>(null);

  /* ---------------------- Form Management ----------------------  */
  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditPropertyType>({
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
      images: [],
    },
  });

  const propertyType = watch("type");

  /* ---------------------- Update Mutation ----------------------  */
  const updateMutation = useMutation({
    mutationFn: async (data: EditPropertyType) => {
      const formData = new FormData();

      // Append property details
      formData.append("name", data.name);
      formData.append("address", data.address);
      formData.append("type", data.type);
      formData.append("rent", data.rent.toString());
      formData.append("maxBedrooms", data.maxBedrooms.toString());
      formData.append("maxBathrooms", data.maxBathrooms.toString());
      formData.append("description", data.description);

      // Append images to delete
      const imagesToDelete = existingImages
        .filter((img) => img.markedForDelete)
        .map((img) => img.id);

      formData.append("imagesToDelete", JSON.stringify(imagesToDelete));

      // Append new images
      newImages.forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch(`/api/properties/${propertyId}/update`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update property");
      }

      return response.json();
    },
    onSuccess: (_, prop) => {
      toast.success(`${prop.name} updated successfully.`);
      router.push(`/properties/${propertyId}`);
    },
    onError: (error) => {
      console.error("Error updating property: ", error);
      setUploadError("Failed to update property");
    },
  });

  /* ---------------------- Image handling ----------------------  */
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

  /* ---------------------- Drag and drop ----------------------  */
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

  /* ---------------------- Form submission ----------------------  */

  const onSubmit = (data: EditPropertyType) => {
    updateMutation.mutate(data);
  };

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
                      className={`relative group ${img.markedForDelete ? "opacity-50" : ""}`}
                    >
                      <Image
                        src={img.filePath}
                        alt={`${img.originalName} - ${index}`}
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

            {/* Drag and Drop for New Images */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">
                Add New Images
              </p>
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
                  disabled={isSubmitting || updateMutation.isPending}
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
                      <Image
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
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
            <p className="font-medium">Failed to update property</p>
            <p className="text-sm">{uploadError}</p>
          </div>
        )}

        {/* Action buttons */}
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
            {updateMutation.isPending
              ? "Updating Property..."
              : "Update Property"}
          </Button>
        </div>
      </div>
    </form>
  );
}
