"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Icons
import {
  User,
  Building,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Upload,
  X,
  Moon,
  Calendar,
  CalendarDays,
  CalendarRange,
  Minus,
  Plus,
  FileText,
  CheckCircle2,
  Info,
  ClipboardCheck,
} from "lucide-react";

// Utilities and Actions
import {
  cn,
  formatPrice,
  formatDiscount,
  formatDate,
  hasDiscount,
  getDurationLabel,
  getPeriodLabel,
  calculateCheckoutDate,
  calculateTotalNights,
  calculateTotalAmount,
  calculateDiscountedPrice,
} from "@/lib/utils";
import {
  BookingRequestSchema,
  type BookingRequestFormData,
} from "@/lib/schemas/booking-requests";
import { uploadBookingRequestDocument } from "@/lib/services/clientMediaService";
import { useCreateBookingRequest } from "@/hooks/useBookingRequests";
import { getBookingRequestFormData } from "@/lib/actions/booking-requests";
import { NationalityCombobox } from "@/components/NationalityCombobox";
import { BookingRequestConfirmation } from "@/components/BookingRequestConfirmation";
import { format } from "date-fns";
import { toast } from "sonner";
import type { PriceDuration, UnitTypePricing } from "@/lib/types/types";

const STEPS = [
  { id: 1, title: "Guest Details", icon: User },
  { id: 2, title: "Booking Details", icon: Building },
  { id: 3, title: "Confirm", icon: ClipboardCheck },
];

const durationIcons: Record<PriceDuration, React.ElementType> = {
  one_night: Moon,
  weekly: Calendar,
  monthly: CalendarDays,
  custom: CalendarRange,
};

export function BookingRequestForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [idDocumentFile, setIdDocumentFile] = useState<File | null>(null);
  const [idDocumentPreview, setIdDocumentPreview] = useState<string | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pricing state
  const [selectedPricing, setSelectedPricing] =
    useState<UnitTypePricing | null>(null);
  const [period, setPeriod] = useState<number>(1);

  const createBookingRequest = useCreateBookingRequest();

  // Fetch form data
  const { data: formDataCache, isLoading } = useQuery({
    queryKey: ["booking-request-form-data"],
    queryFn: () => getBookingRequestFormData(),
  });

  // Get today's date
  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<BookingRequestFormData>({
    mode: "onChange",
    resolver: zodResolver(BookingRequestSchema),
    defaultValues: {
      guestIdType: "national_id",
      guestNationality: "",
      priceDuration: "one_night",
      period: 1,
      numberOfGuests: 1,
      idDocumentFilename: "",
      idDocumentOriginalName: "",
      idDocumentMimeType: "",
      idDocumentFileSize: 0,
      unitPrice: 0,
      totalAmount: 0,
    },
  });

  // Watched values
  const formData = watch();

  // Derived property state
  const selectedProperty = formDataCache?.properties.find(
    (p) => p.id.toString() === formData.propertyId?.toString(),
  );

  // Derived unit state
  const selectedUnit = selectedProperty?.units.find(
    (u) => u.id.toString() === formData.unitId?.toString(),
  );

  // Pricing options for selected unit
  const pricingOptions = selectedUnit?.pricingOptions || [];

  // Validation flags
  const isPropertySelected = !!formData.propertyId;
  const isUnitSelected = !!formData.unitId;
  const isPricingSelected = !!selectedPricing;

  const isMaxGuestsValid =
    formData.numberOfGuests !== undefined &&
    formData.numberOfGuests > 0 &&
    (selectedUnit?.maxGuests
      ? formData.numberOfGuests <= selectedUnit.maxGuests
      : true);

  // Calculate savings
  const isCustomDuration = selectedPricing?.duration === "custom";
  const actualPeriod = isCustomDuration ? 1 : period;

  const discountedPrice = selectedPricing
    ? calculateDiscountedPrice(
        selectedPricing.price,
        selectedPricing.discountRate,
      )
    : 0;

  const savings = selectedPricing
    ? calculateTotalAmount(selectedPricing.price, actualPeriod) -
      calculateTotalAmount(discountedPrice, actualPeriod)
    : 0;

  // Update checkout date when check-in, duration, or period changes
  useEffect(() => {
    if (formData.checkInDate && selectedPricing) {
      const checkIn = new Date(formData.checkInDate);
      const periodValue = selectedPricing.duration === "custom" ? 1 : period;

      const checkOut = calculateCheckoutDate(
        checkIn,
        selectedPricing.duration as PriceDuration,
        periodValue,
        selectedPricing.fromDate,
        selectedPricing.toDate,
      );

      const discounted = calculateDiscountedPrice(
        selectedPricing.price,
        selectedPricing.discountRate,
      );
      const total = calculateTotalAmount(discounted, periodValue);

      setValue("checkOutDate", checkOut);
      setValue("unitPrice", discounted);
      setValue("discountRate", selectedPricing.discountRate || null);
      setValue("totalAmount", total);
    }
  }, [formData.checkInDate, selectedPricing, period, setValue]);

  // Handle ID document selection
  const handleIdDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdDocumentFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdDocumentPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeIdDocument = () => {
    setIdDocumentFile(null);
    setIdDocumentPreview(null);
  };

  // Handle pricing selection
  const handlePricingSelect = (pricing: UnitTypePricing) => {
    setSelectedPricing(pricing);
    setValue("priceDuration", pricing.duration as PriceDuration);

    const discounted = calculateDiscountedPrice(
      pricing.price,
      pricing.discountRate,
    );
    setValue("unitPrice", discounted);
    setValue("discountRate", pricing.discountRate || null);

    if (pricing.duration === "custom") {
      setPeriod(1);
      setValue("period", 1);
    }
  };

  // Handle period change
  const handlePeriodChange = (newPeriod: number) => {
    if (newPeriod < 1) return;
    if (selectedPricing?.duration === "custom") return;
    setPeriod(newPeriod);
    setValue("period", newPeriod);
  };

  // Handle property change
  const handlePropertyChange = (value: string) => {
    setValue("propertyId", Number(value));
    setValue("unitId", 0);
    setValue("numberOfGuests", 1);
    setValue("checkInDate", new Date(today));
    setValue("checkOutDate", new Date(today));
    setValue("priceDuration", "one_night");
    setValue("unitPrice", 0);
    setValue("period", 1);
    setValue("discountRate", null);
    setValue("totalAmount", 0);
    setSelectedPricing(null);
    setPeriod(1);
  };

  // Handle unit change
  const handleUnitChange = (value: string) => {
    setValue("unitId", Number(value));
    setValue("numberOfGuests", 1);
    setValue("checkInDate", new Date(today));
    setValue("checkOutDate", new Date(today));
    setValue("priceDuration", "one_night");
    setValue("unitPrice", 0);
    setValue("period", 1);
    setValue("discountRate", null);
    setValue("totalAmount", 0);
    setSelectedPricing(null);
    setPeriod(1);
  };

  // Validate current step
  const validateStep = async (step: number): Promise<boolean> => {
    if (step === 1) {
      const guestFields: (keyof BookingRequestFormData)[] = [
        "guestFirstName",
        "guestLastName",
        "guestEmail",
        "guestPhone",
        "guestDateOfBirth",
        "guestNationality",
        "guestIdType",
      ];

      if (formData.guestIdType === "national_id") {
        guestFields.push("guestIdNumber");
      } else {
        guestFields.push("guestPassportNumber");
      }

      const isValid = await trigger(guestFields);

      if (!idDocumentFile) {
        toast.error("Please upload an ID document");
        return false;
      }

      return isValid;
    }

    if (step === 2) {
      if (!formData.propertyId) {
        toast.error("Please select a property");
        return false;
      }

      if (!formData.unitId) {
        toast.error("Please select a unit");
        return false;
      }

      if (!selectedPricing) {
        toast.error("Please select a pricing option");
        return false;
      }

      if (!formData.checkInDate) {
        toast.error("Please select a check-in date");
        return false;
      }

      const bookingFields: (keyof BookingRequestFormData)[] = [
        "propertyId",
        "unitId",
        "numberOfGuests",
      ];

      const isValid = await trigger(bookingFields);
      return isValid;
    }

    return true;
  };

  // Handle next button
  const handleNext = async () => {
    const isValid = await validateStep(currentStep);

    if (!isValid) {
      return;
    }

    setCurrentStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle back button
  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Form submission
  const onSubmit: SubmitHandler<BookingRequestFormData> = async (data) => {
    if (!idDocumentFile) {
      toast.error("Please upload an ID document");
      return;
    }

    if (!selectedPricing) {
      toast.error("Please select a pricing option");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload ID document
      const uploadResult = await uploadBookingRequestDocument(idDocumentFile);

      if (!uploadResult.success || !uploadResult.filename) {
        throw new Error(uploadResult.error || "Failed to upload ID document");
      }

      const discounted = calculateDiscountedPrice(
        selectedPricing.price,
        selectedPricing.discountRate,
      );
      const periodValue = selectedPricing.duration === "custom" ? 1 : period;
      const totalAmount = calculateTotalAmount(discounted, periodValue);

      // 2. Create booking request
      await createBookingRequest.mutateAsync({
        ...data,
        propertyId: Number(data.propertyId),
        unitId: Number(data.unitId),
        checkInDate: new Date(data.checkInDate),
        checkOutDate: new Date(data.checkOutDate),
        unitPrice: discounted,
        period: periodValue,
        discountRate: selectedPricing.discountRate || null,
        totalAmount,
        idDocumentFilename: uploadResult.filename,
        idDocumentOriginalName: uploadResult.originalName!,
        idDocumentMimeType: uploadResult.mimeType!,
        idDocumentFileSize: uploadResult.fileSize!,
        idDocumentUrl: uploadResult.publicUrl,
      });

      router.push("/booking-requests");
    } catch (error) {
      console.error("Error submitting booking request:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit booking request",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:py-5">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          New Booking Request
        </h1>
        <p className="text-muted-foreground">
          Submit a booking request for approval by an administrator.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div key={step.id} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex items-center justify-center size-10 rounded-full transition-colors",
                  isActive && "bg-primary text-primary-foreground",
                  isCompleted && "bg-green-500 text-white",
                  !isActive && !isCompleted && "bg-muted text-muted-foreground",
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="size-5" />
                ) : (
                  <Icon className="size-5" />
                )}
              </div>
              <span
                className={cn(
                  "text-sm font-medium hidden sm:inline",
                  isActive && "text-primary",
                  isCompleted && "text-green-600",
                  !isActive && !isCompleted && "text-muted-foreground",
                )}
              >
                {step.title}
              </span>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "w-8 sm:w-12 h-0.5 mx-2",
                    isCompleted ? "bg-green-500" : "bg-muted",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Form — only allow native submission on the final step */}
      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        {/* Step 1: Guest Details */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-5 text-primary" />
                Guest Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name Row */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="guestFirstName">First Name *</Label>
                  <Input
                    id="guestFirstName"
                    placeholder="Enter first name"
                    {...register("guestFirstName")}
                    className={cn(
                      errors.guestFirstName && "border-destructive",
                    )}
                  />
                  {errors.guestFirstName && (
                    <p className="text-sm text-destructive">
                      {errors.guestFirstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guestLastName">Last Name *</Label>
                  <Input
                    id="guestLastName"
                    placeholder="Enter last name"
                    {...register("guestLastName")}
                    className={cn(errors.guestLastName && "border-destructive")}
                  />
                  {errors.guestLastName && (
                    <p className="text-sm text-destructive">
                      {errors.guestLastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Contact Row */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="guestEmail">Email *</Label>
                  <Input
                    id="guestEmail"
                    type="email"
                    placeholder="email@example.com"
                    {...register("guestEmail")}
                    className={cn(errors.guestEmail && "border-destructive")}
                  />
                  {errors.guestEmail && (
                    <p className="text-sm text-destructive">
                      {errors.guestEmail.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guestPhone">Phone Number *</Label>
                  <Input
                    id="guestPhone"
                    placeholder="+254 700 000 000"
                    {...register("guestPhone")}
                    className={cn(errors.guestPhone && "border-destructive")}
                  />
                  {errors.guestPhone && (
                    <p className="text-sm text-destructive">
                      {errors.guestPhone.message}
                    </p>
                  )}
                </div>
              </div>

              {/* DOB and Nationality */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="guestDateOfBirth">Date of Birth *</Label>
                  <Input
                    id="guestDateOfBirth"
                    type="date"
                    {...register("guestDateOfBirth")}
                    className={cn(
                      errors.guestDateOfBirth && "border-destructive",
                    )}
                  />
                  {errors.guestDateOfBirth && (
                    <p className="text-sm text-destructive">
                      {errors.guestDateOfBirth.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Controller
                    name="guestNationality"
                    control={control}
                    render={({ field }) => (
                      <NationalityCombobox
                        value={field.value}
                        onValueChange={field.onChange}
                        error={errors.guestNationality?.message}
                      />
                    )}
                  />
                </div>
              </div>

              {/* ID Type Selection */}
              <div className="space-y-3">
                <Label>ID Type *</Label>
                <Controller
                  name="guestIdType"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="national_id" id="national_id" />
                        <Label htmlFor="national_id" className="cursor-pointer">
                          National ID
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="passport" id="passport" />
                        <Label htmlFor="passport" className="cursor-pointer">
                          Passport
                        </Label>
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>

              {/* ID Number */}
              {formData.guestIdType === "national_id" ? (
                <div className="space-y-2">
                  <Label htmlFor="guestIdNumber">National ID Number *</Label>
                  <Input
                    id="guestIdNumber"
                    placeholder="Enter ID number"
                    {...register("guestIdNumber")}
                    className={cn(errors.guestIdNumber && "border-destructive")}
                  />
                  {errors.guestIdNumber && (
                    <p className="text-sm text-destructive">
                      {errors.guestIdNumber.message}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="guestPassportNumber">Passport Number *</Label>
                  <Input
                    id="guestPassportNumber"
                    placeholder="Enter passport number"
                    {...register("guestPassportNumber")}
                    className={cn(
                      errors.guestPassportNumber && "border-destructive",
                    )}
                  />
                  {errors.guestPassportNumber && (
                    <p className="text-sm text-destructive">
                      {errors.guestPassportNumber.message}
                    </p>
                  )}
                </div>
              )}

              {/* ID Document Upload */}
              <div className="space-y-3">
                <Label>ID Document *</Label>
                {!idDocumentPreview ? (
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-primary/50",
                      !idDocumentFile && "border-muted-foreground/25",
                    )}
                    onClick={() =>
                      document.getElementById("idDocument")?.click()
                    }
                  >
                    <Upload className="size-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      Click to upload ID document
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPEG, PNG, WebP, or AVIF (max 5MB)
                    </p>
                    <input
                      id="idDocument"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="hidden"
                      onChange={handleIdDocumentChange}
                    />
                  </div>
                ) : (
                  <div className="relative border rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={idDocumentPreview}
                        alt="ID Document Preview"
                        className="w-32 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium truncate">
                          {idDocumentFile?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {idDocumentFile &&
                            `${(idDocumentFile.size / 1024 / 1024).toFixed(2)} MB`}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={removeIdDocument}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                )}
                {!idDocumentFile && (
                  <p className="text-sm text-destructive">
                    ID document is required
                  </p>
                )}
              </div>

              {/* Guest Notes */}
              <div className="space-y-2">
                <Label htmlFor="guestNotes">Notes (optional)</Label>
                <Textarea
                  id="guestNotes"
                  placeholder="Any additional notes about the guest..."
                  {...register("guestNotes")}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Booking Details */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="size-5 text-primary" />
                Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Property Selection */}
              <div className="space-y-2">
                <Label>Property *</Label>
                <Controller
                  name="propertyId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString() || ""}
                      onValueChange={(value) => {
                        field.onChange(Number(value));
                        handlePropertyChange(value);
                      }}
                    >
                      <SelectTrigger
                        className={cn(
                          "w-full",
                          errors.propertyId && "border-destructive",
                        )}
                      >
                        <SelectValue placeholder="Select a property" />
                      </SelectTrigger>
                      <SelectContent>
                        {formDataCache?.properties.map((property) => (
                          <SelectItem
                            key={property.id}
                            value={property.id.toString()}
                          >
                            {property.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.propertyId && (
                  <p className="text-sm text-destructive">
                    {errors.propertyId.message}
                  </p>
                )}
              </div>

              {/* Unit Selection */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Unit *</Label>
                  <Controller
                    name="unitId"
                    control={control}
                    render={({ field }) => (
                      <>
                        <Select
                          value={field.value?.toString() || ""}
                          onValueChange={(value) => {
                            field.onChange(Number(value));
                            handleUnitChange(value);
                          }}
                          disabled={
                            !isPropertySelected ||
                            selectedProperty?.units.length === 0
                          }
                        >
                          <SelectTrigger
                            className={cn(
                              "w-full",
                              errors.unitId && "border-destructive",
                            )}
                          >
                            <SelectValue
                              placeholder={
                                isPropertySelected
                                  ? "Select a unit"
                                  : "Select a property first"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedProperty?.units.map((unit) => {
                              const isUnavailable = unit.status !== "available";

                              return (
                                <SelectItem
                                  key={unit.id}
                                  value={unit.id.toString()}
                                  disabled={isUnavailable}
                                  className={cn(isUnavailable && "opacity-50")}
                                >
                                  {unit.name} - {unit.type}
                                  {isUnavailable && (
                                    <span className="ml-2 text-xs text-muted-foreground capitalize">
                                      ({unit.status.replace("_", " ")})
                                    </span>
                                  )}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        {selectedProperty &&
                          selectedProperty.units?.length === 0 && (
                            <div className="flex items-center gap-3 text-sm bg-blue-50 p-2 border border-blue-400 rounded-md">
                              <Info className="size-6 text-blue-400" />
                              <span className="text-blue-400">
                                This property has no units. Select a different
                                property.
                              </span>
                            </div>
                          )}
                      </>
                    )}
                  />
                  {errors.unitId && (
                    <p className="text-sm text-destructive">
                      {errors.unitId.message}
                    </p>
                  )}
                </div>

                {/* Number of Guests */}
                <div className="space-y-2">
                  <Label htmlFor="numberOfGuests">
                    Number of Guests
                    {selectedUnit && (
                      <span className="text-sm text-muted-foreground ml-2">
                        (Max: {selectedUnit.maxGuests})
                      </span>
                    )}
                  </Label>
                  <Input
                    id="numberOfGuests"
                    type="number"
                    min={1}
                    max={selectedUnit?.maxGuests || 10}
                    placeholder={
                      selectedUnit
                        ? `Enter 1-${selectedUnit.maxGuests}`
                        : "Select unit first"
                    }
                    disabled={!isUnitSelected}
                    className={cn(
                      errors.numberOfGuests && "border-destructive",
                    )}
                    {...register("numberOfGuests", {
                      valueAsNumber: true,
                      validate: (value: number) => {
                        if (!selectedUnit?.maxGuests) return true;
                        if (value > selectedUnit.maxGuests) {
                          return `Maximum ${selectedUnit.maxGuests} guests allowed.`;
                        }
                        return true;
                      },
                    })}
                  />
                  {errors.numberOfGuests && (
                    <p className="text-sm text-destructive">
                      {errors.numberOfGuests.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Pricing Selection */}
              {isUnitSelected &&
                isMaxGuestsValid &&
                pricingOptions.length > 0 && (
                  <div className="space-y-4">
                    <Label>Stay Duration & Pricing *</Label>
                    <RadioGroup
                      value={formData.priceDuration}
                      onValueChange={(value) => {
                        const pricing = pricingOptions.find(
                          (p) => p.duration === value,
                        );
                        if (pricing) handlePricingSelect(pricing);
                      }}
                      className="grid gap-3 md:grid-cols-2"
                    >
                      {pricingOptions.map((pricing) => {
                        const Icon =
                          durationIcons[pricing.duration as PriceDuration];
                        const isSelected =
                          formData.priceDuration === pricing.duration;
                        const pricingDiscountedPrice = calculateDiscountedPrice(
                          pricing.price,
                          pricing.discountRate,
                        );

                        return (
                          <Label
                            key={pricing.id}
                            htmlFor={`pricing-${pricing.duration}`}
                            className={cn(
                              "cursor-pointer",
                              pricing.duration === "monthly" && "md:col-span-2",
                            )}
                          >
                            <Card
                              className={cn(
                                "transition-all py-2 w-full",
                                isSelected
                                  ? "border-primary ring-2 ring-primary/20"
                                  : "hover:border-primary/50",
                              )}
                            >
                              <CardContent className="flex items-center gap-4 p-4">
                                <RadioGroupItem
                                  value={pricing.duration}
                                  id={`pricing-${pricing.duration}`}
                                  hidden
                                />

                                <div
                                  className={cn(
                                    "size-10 rounded-lg flex items-center justify-center",
                                    isSelected ? "bg-primary/10" : "bg-muted",
                                  )}
                                >
                                  <Icon
                                    className={cn(
                                      "size-5",
                                      isSelected
                                        ? "text-primary"
                                        : "text-muted-foreground",
                                    )}
                                  />
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-foreground">
                                      {getDurationLabel(pricing.duration)}
                                    </p>
                                    {hasDiscount(pricing.discountRate) && (
                                      <span className="text-xs font-medium text-green-600 bg-green-100 px-1.5 py-0.5 rounded">
                                        {formatDiscount(pricing.discountRate)}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {pricing.duration === "custom" &&
                                    pricing.fromDate &&
                                    pricing.toDate ? (
                                      <>
                                        {formatDate(pricing.fromDate)} -{" "}
                                        {formatDate(pricing.toDate)} (
                                        {pricing.nights} nights)
                                      </>
                                    ) : (
                                      <>
                                        {pricing.nights}{" "}
                                        {pricing.nights === 1
                                          ? "night"
                                          : "nights"}{" "}
                                        stay
                                      </>
                                    )}
                                  </p>
                                </div>

                                <div className="text-right">
                                  {hasDiscount(pricing.discountRate) ? (
                                    <>
                                      <p className="text-sm text-muted-foreground line-through">
                                        {formatPrice(pricing.price)}
                                      </p>
                                      <p className="text-lg font-bold text-primary">
                                        {formatPrice(pricingDiscountedPrice)}
                                      </p>
                                    </>
                                  ) : (
                                    <p className="text-lg font-bold text-foreground">
                                      {formatPrice(pricing.price)}
                                    </p>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </Label>
                        );
                      })}
                    </RadioGroup>
                  </div>
                )}

              {/* Period Selector */}
              {isPricingSelected && !isCustomDuration && (
                <div className="space-y-3">
                  <Label>
                    How many {getPeriodLabel(formData.priceDuration)}?
                  </Label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="w-1/12"
                      onClick={() => handlePeriodChange(period - 1)}
                      disabled={period <= 1}
                    >
                      <Minus className="size-4" />
                    </Button>

                    <Input
                      type="number"
                      value={period}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 1) {
                          handlePeriodChange(val);
                        }
                      }}
                      className="w-9/12 text-center"
                      min={1}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="w-1/12"
                      onClick={() => handlePeriodChange(period + 1)}
                    >
                      <Plus className="size-4" />
                    </Button>

                    <span className="text-sm text-muted-foreground">
                      {getPeriodLabel(formData.priceDuration)}
                    </span>
                  </div>
                </div>
              )}

              {/* Check-in/out Dates */}
              {isPricingSelected && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="checkInDate">Check-in Date *</Label>
                    <Input
                      id="checkInDate"
                      type="date"
                      min={today}
                      disabled={isCustomDuration}
                      className={cn(
                        errors.checkInDate && "border-destructive",
                        isCustomDuration && "bg-muted",
                      )}
                      onChange={(e) => {
                        setValue("checkInDate", new Date(e.target.value));
                      }}
                      value={
                        formData.checkInDate
                          ? format(new Date(formData.checkInDate), "yyyy-MM-dd")
                          : ""
                      }
                    />
                    {isCustomDuration && (
                      <p className="text-xs text-muted-foreground">
                        Fixed dates for custom pricing period
                      </p>
                    )}
                    {errors.checkInDate && (
                      <p className="text-sm text-destructive">
                        {errors.checkInDate.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="checkOutDate">Check-out Date</Label>
                    <Input
                      id="checkOutDate"
                      type="date"
                      disabled
                      className="bg-muted"
                      value={
                        formData.checkOutDate
                          ? format(
                              new Date(formData.checkOutDate),
                              "yyyy-MM-dd",
                            )
                          : ""
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Auto-calculated based on duration and period
                    </p>
                  </div>
                </div>
              )}

              {/* Total Calculation */}
              {isPricingSelected && (
                <div className="p-4 rounded-lg bg-muted">
                  <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
                    <span>
                      {formatPrice(discountedPrice)} × {actualPeriod}{" "}
                      {getPeriodLabel(formData.priceDuration)}
                    </span>
                    <span>
                      {calculateTotalNights(
                        formData.priceDuration as PriceDuration,
                        actualPeriod,
                        selectedPricing?.fromDate,
                        selectedPricing?.toDate,
                      )}{" "}
                      nights total
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Amount</span>
                    <span className="text-2xl font-bold text-foreground">
                      {formatPrice(formData.totalAmount || 0)}
                    </span>
                  </div>
                  {hasDiscount(selectedPricing?.discountRate) &&
                    savings > 0 && (
                      <p className="text-xs text-green-600 mt-1 text-right">
                        You save {formatPrice(savings)}
                      </p>
                    )}
                </div>
              )}

              {/* Purpose */}
              <div className="space-y-2">
                <Label>Purpose</Label>
                <Controller
                  name="purpose"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="leisure">Leisure</SelectItem>
                        <SelectItem value="family">Family</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Special Requests */}
              <div className="space-y-2">
                <Label htmlFor="specialRequests">
                  Special Requests (optional)
                </Label>
                <Textarea
                  id="specialRequests"
                  placeholder="Any special requests for this booking..."
                  {...register("specialRequests")}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 3 && (
          <BookingRequestConfirmation
            formData={formData}
            idDocumentPreview={idDocumentPreview}
            idDocumentFile={idDocumentFile}
            selectedPricing={selectedPricing}
            period={period}
            propertyName={selectedProperty?.name || ""}
            unitName={selectedUnit?.name || ""}
            savings={savings}
          />
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between py-6">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={currentStep === 1 ? () => router.back() : handleBack}
            disabled={isSubmitting}
          >
            <ChevronLeft className="size-4 mr-2" />
            {currentStep === 1 ? "Cancel" : "Back"}
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Step {currentStep} of {STEPS.length}
            </span>
          </div>

          {currentStep < STEPS.length ? (
            <Button
              type="button"
              onClick={handleNext}
              className="cursor-pointer"
              disabled={isSubmitting}
            >
              {currentStep === 2 ? "Review" : "Next"}
              <ChevronRight className="size-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => onSubmit(formData)}
              disabled={isSubmitting}
              className="min-w-[140px] cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Submitting...</span>
                </>
              ) : (
                <>
                  <FileText className="size-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
