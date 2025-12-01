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
const NewUnitSchema = z.object({
  name: z.string().min(1, "unit name is required."),
  type: z.string().min(1, "unit type is required."),
  rent: z
    .number()
    .positive("rent must a positve integer.")
    .min(1, "Minimum is 1"),
  bedrooms: z
    .number()
    .positive("bedrooms must a positve integer.")
    .min(1, "Minimum is 1"),
  bathrooms: z.number().positive("bathrooms must a positve integer."),
  maxGuests: z.number().positive("max guests must a positve integer."),
  images: z
    .array(FileSchema)
    .min(1, "At least one image is required")
    .max(10, "Maximum of 10 images allowed"),
});

type NewUnitType = z.infer<typeof NewUnitSchema>;

function NewUnitForm({ propertyId }: { propertyId: number }) {
  // Component state
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // React hook form management
  const {
    register,
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewUnitType>({
    mode: "all",
    resolver: zodResolver(NewUnitSchema),
    defaultValues: {
      type: "apartment",
      images: [],
    },
  });

  const unitType = watch("type");
  const formImages = watch("images");

  /* ---------------- Mutation for form submission data goes here---------------- */
  const createMutation = useMutation({
    mutationFn: async (data: NewUnitType) => {
      const formData = new FormData();

      // Append property details
      formData.append("name", data.name);
      formData.append("type", data.type);
      formData.append("rent", data.rent.toString());
      formData.append("bedrooms", data.bedrooms.toString());
      formData.append("bathrooms", data.bathrooms.toString());
      formData.append("maxGuests", data.maxGuests.toString());

      data.images.forEach((image) => {
        formData.append("images", image);
      });

      // make the API call
      const response = await fetch(
        `/api/properties/${propertyId}/create-unit`,
        {
          method: "POST",
          body: formData,
        }
      );

      // check for errors
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create unit!");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Unit created successfully.");
      reset();
      setSelectedImages([]);
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to create unit!";
      setUploadError(errorMessage);
    },
  });

  /* ---------------- Image handling functions ---------------- */
  const addImages = (files: File[]) => {
    const validImages = files.filter((file) => file.type.startsWith("image/"));

    if (validImages.length === 0) {
      setUploadError("No valid images selected");
      return;
    }

    const newImages = [...(formImages || []), ...validImages];

    if (newImages.length > 10) {
      setUploadError("Maximum of 10 images allowed.");
      return;
    }

    setSelectedImages(newImages);
    setValue("images", newImages);
    setUploadError(null);
  };

  const removeImage = (index: number) => {
    const updatedImages = formImages?.filter((_, i) => i !== index) || [];
    setSelectedImages(updatedImages);
    setValue("images", updatedImages);
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
    addImages(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.currentTarget.files || []);
    addImages(files);
  };

  /* ---------------- onSubmit handler ---------------- */
  const onSubmit: SubmitHandler<NewUnitType> = (data) => {
    createMutation.mutate(data);
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
            {/* Drag and drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-large p-6 text-center cursor-pointer transition",
                isDragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400",
                (isSubmitting || createMutation.isPending) &&
                  "opacity-50 cursor-not-allowed"
              )}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
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
            {errors.images && (
              <p className="my-1 text-sm text-red-400">
                {errors.images.message}
              </p>
            )}

            {/* Images preview */}
            {formImages && formImages.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">
                  {selectedImages.length} image(s) selected
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {formImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        disabled={isSubmitting || createMutation.isPending}
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
          </CardContent>
        </Card>

        {/* Error from API */}
        {createMutation.isError && (
          <div className="bg-red-50 border border-red-200 text-red-400 p-4 rounded">
            <p className="font-medium">Failed to create unit.</p>
            <p className="text-sm">{uploadError}</p>
          </div>
        )}

        {/* Action button */}
        <div className="my-4 pt-4 text-center">
          <Button
            type="submit"
            disabled={isSubmitting || createMutation.isPending}
            className="w-2/3 cursor-pointer font-semibold"
          >
            {createMutation.isPending ? "Creating unit..." : "Create Unit"}
          </Button>
        </div>
      </div>
    </form>
  );
}

export { NewUnitForm };
