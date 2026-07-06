"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
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
import {
  Users,
  Building,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Moon,
  Calendar,
  CalendarIcon,
  CalendarDays,
  CalendarRange,
  Minus,
  Plus,
  FileText,
  CheckCircle2,
  Info,
  ClipboardCheck,
  UserPlus,
  UserCheck,
} from "lucide-react";
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
  calculateTotalWithVAT,
  calculateVAT,
  calculateDiscountedPrice,
  getStartOfDay,
  getEndOfDay,
  formatDateKE,
} from "@/lib/utils";
import {
  BookingRequestFormSchema,
  type BookingRequestFormData,
} from "@/lib/schemas/booking-requests";
import { ClientMediaService } from "@/lib/services/clientMediaService";
import { createGuest } from "@/lib/actions/guests";
import { useCreateBookingRequest } from "@/hooks/useBookingRequests";
import { getBookingRequestFormData } from "@/lib/actions/booking-requests";
import { NationalityCombobox } from "@/components/NationalityCombobox";
import { GuestCombobox } from "@/components/AgentGuestCombobox";
import { BookingRequestConfirmation } from "@/components/BookingRequestConfirmation";
import { ImageUploadSlot } from "./ImageUploadSlot";
import { format } from "date-fns";
import { toast } from "sonner";
import type {
  PriceDuration,
  UnitTypePricing,
  GuestSearchResult,
  ImageSlot,
} from "@/lib/types/types";
import { getPaymentSettings } from "@/lib/actions/payments";
import { DatePicker } from "@/components/DatePicker";

const STEPS = [
  { id: 1, title: "Select Guest", icon: Users },
  { id: 2, title: "Booking Details", icon: Building },
  { id: 3, title: "Confirm", icon: ClipboardCheck },
];

const durationIcons: Record<PriceDuration, React.ElementType> = {
  one_night: Moon,
  weekly: Calendar,
  monthly: CalendarDays,
  custom: CalendarRange,
};

// Get unit type label
const getUnitTypeLabel = (type: string) => {
  const typeLabels: Record<string, string> = {
    one_bedroom: "1 Bedroom",
    two_bedroom: "2 Bedroom",
    three_bedroom: "3 Bedroom",
  };
  return typeLabels[type] || type.replace("_", " ");
};

const emptySlot: ImageSlot = { file: null, preview: null, uploadedUrl: null };

export function BookingRequestForm({ agentId }: { agentId: string }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image upload state
  const [frontImage, setFrontImage] = useState<ImageSlot>(emptySlot);
  const [backImage, setBackImage] = useState<ImageSlot>(emptySlot);
  const [passportImage, setPassportImage] = useState<ImageSlot>(emptySlot);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Image input refs
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const passportInputRef = useRef<HTMLInputElement>(null);

  // Guest type state
  const [guestType, setGuestType] = useState<"existing" | "new">("existing");
  const [selectedGuest, setSelectedGuest] = useState<GuestSearchResult | null>(
    null,
  );

  // Pricing state
  const [selectedPricing, setSelectedPricing] =
    useState<UnitTypePricing | null>(null);
  const [period, setPeriod] = useState<number>(1);
  const [customNights, setCustomNights] = useState<number>(1);

  const createBookingRequest = useCreateBookingRequest();

  // Fetch form data
  const { data: formDataCache, isLoading } = useQuery({
    queryKey: ["booking-request-form-data"],
    queryFn: () => getBookingRequestFormData(),
  });

  const { data: paymentSettings } = useQuery({
    queryKey: ["payment-settings"],
    queryFn: () => getPaymentSettings(),
  });

  // Get current datetime for datetime-local input
  const now = format(new Date(), "yyyy-MM-dd");

  const {
    register,
    control,
    watch,
    setValue,
    trigger,
    clearErrors,
    formState: { errors },
  } = useForm<BookingRequestFormData>({
    mode: "onChange",
    resolver: zodResolver(BookingRequestFormSchema),
    defaultValues: {
      guestType: "existing",
      guestIdType: "national_id",
      existingGuestId: 0,
      priceDuration: "one_night",
      period: 1,
      numberOfGuests: 1,
      unitPrice: 0,
      paymentMethod: "mpesa_till",
      paymentCode: "",
      totalAmount: 0,
      propertyId: 0,
      unitId: 0,

      checkInDate: now,
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
  const isCustomDuration = selectedPricing?.duration === "custom";

  const isMaxGuestsValid =
    formData.numberOfGuests !== undefined &&
    formData.numberOfGuests > 0 &&
    (selectedUnit?.maxGuests
      ? formData.numberOfGuests <= selectedUnit.maxGuests
      : true);

  // Calculate discounted price
  const discountedPrice = selectedPricing
    ? calculateDiscountedPrice(
        selectedPricing.price,
        selectedPricing.discountRate,
      )
    : 0;

  // Calculate total nights and total amount based on pricing type
  const totalNights = selectedPricing
    ? isCustomDuration
      ? customNights
      : calculateTotalNights(
          selectedPricing.duration as PriceDuration,
          period,
          selectedPricing.fromDate,
          selectedPricing.toDate,
        )
    : 0;

  // Total Price with VAT
  const subtotal = selectedPricing
    ? isCustomDuration
      ? discountedPrice * customNights
      : calculateTotalAmount(discountedPrice, period)
    : 0;

  const vatAmount = calculateVAT(subtotal);
  const totalAmount = calculateTotalWithVAT(subtotal);

  // Calculate savings
  const savings = selectedPricing
    ? isCustomDuration
      ? (selectedPricing.price - discountedPrice) * customNights
      : calculateTotalAmount(selectedPricing.price, period) -
        calculateTotalAmount(discountedPrice, period)
    : 0;

  // Update checkout date when check-in, duration, or period changes
  useEffect(() => {
    if (formData.checkInDate && selectedPricing) {
      const checkIn = new Date(formData.checkInDate);

      let checkOut: Date;

      if (isCustomDuration) {
        checkOut = new Date(checkIn);
        checkOut.setDate(checkOut.getDate() + customNights);
      } else {
        checkOut = calculateCheckoutDate(
          checkIn,
          selectedPricing.duration as PriceDuration,
          period,
          selectedPricing.fromDate,
          selectedPricing.toDate,
        );
      }

      const discounted = calculateDiscountedPrice(
        selectedPricing.price,
        selectedPricing.discountRate,
      );

      const subtotalCalc = isCustomDuration
        ? discounted * customNights
        : calculateTotalAmount(discounted, period);
      const total = calculateTotalWithVAT(subtotalCalc);

      checkOut.setHours(10, 0, 0, 0);
      setValue("checkOutDate", checkOut);
      setValue("unitPrice", discounted);
      setValue("discountRate", selectedPricing.discountRate || null);
      setValue("totalAmount", total);
      setValue("period", isCustomDuration ? customNights : period);
    }
  }, [
    formData.checkInDate,
    selectedPricing,
    period,
    customNights,
    isCustomDuration,
    setValue,
  ]);

  // ------------------ Image handlers ------------------

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

  const clearAllImages = () => {
    setFrontImage(emptySlot);
    setBackImage(emptySlot);
    setPassportImage(emptySlot);
    setUploadError(null);
    if (frontInputRef.current) frontInputRef.current.value = "";
    if (backInputRef.current) backInputRef.current.value = "";
    if (passportInputRef.current) passportInputRef.current.value = "";
  };

  // ------------------ Step field mapping ------------------

  const getStepFields = (step: number): (keyof BookingRequestFormData)[] => {
    if (step === 1) {
      if (guestType === "existing") {
        return ["existingGuestId"];
      }

      const fields: (keyof BookingRequestFormData)[] = [
        "guestFirstName",
        "guestLastName",
        "guestEmail",
        "guestPhone",
        "guestDateOfBirth",
        "guestNationality",
      ];

      if (formData.guestIdType === "national_id") {
        fields.push("guestIdNumber");
      } else {
        fields.push("guestPassportNumber");
      }

      return fields;
    }

    if (step === 2) {
      return [
        "propertyId",
        "unitId",
        "checkInDate",
        "numberOfGuests",
        "paymentMethod",
        "paymentCode",
      ];
    }

    return [];
  };

  // Validate current step
  const validateStep = async (step: number): Promise<boolean> => {
    clearErrors();

    const fields = getStepFields(step);
    const isValid = await trigger(fields);

    if (!isValid) {
      toast.error("Please fix the errors in the form.");
      return false;
    }

    if (step === 1) {
      if (guestType === "existing" && !selectedGuest) {
        toast.error("Please select a guest.");
        return false;
      }

      if (guestType === "new") {
        const idType = watch("guestIdType");
        if (idType === "national_id") {
          if (!frontImage.file || !backImage.file) {
            toast.error("Please upload both front and back ID images.");
            return false;
          }
        } else {
          if (!passportImage.file) {
            toast.error("Please upload a passport image.");
            return false;
          }
        }
      }
    }

    if (step === 2) {
      if (!selectedPricing) {
        toast.error("Please select a pricing option.");
        return false;
      }

      if (
        isCustomDuration &&
        selectedPricing?.fromDate &&
        selectedPricing?.toDate &&
        formData.checkInDate
      ) {
        const checkInDate = new Date(formData.checkInDate);
        const fromDate = getStartOfDay(selectedPricing.fromDate);
        const toDate = getEndOfDay(selectedPricing.toDate);

        if (checkInDate < fromDate || checkInDate > toDate) {
          toast.error(
            `Check-in date must be between ${formatDateKE(selectedPricing.fromDate)} and ${formatDateKE(selectedPricing.toDate)}`,
          );
          return false;
        }
      }
    }

    return true;
  };

  // ------------------ Guest handlers ------------------
  const handleGuestTypeChange = (type: "existing" | "new") => {
    setGuestType(type);
    setValue("guestType", type);
    clearErrors();

    if (type === "existing") {
      setValue("guestFirstName", "");
      setValue("guestLastName", "");
      setValue("guestEmail", "");
      setValue("guestPhone", "");
      setValue("guestDateOfBirth", "");
      setValue("guestNationality", "");
      setValue("guestIdType", "national_id");
      setValue("guestIdNumber", "");
      setValue("guestPassportNumber", "");
      setValue("guestNotes", "");
      clearAllImages();
    } else {
      setSelectedGuest(null);
      setValue("existingGuestId", 0);
    }
  };

  const handleGuestSelect = (guest: GuestSearchResult | null) => {
    setSelectedGuest(guest);
    if (guest) {
      setValue("existingGuestId", guest.id);
    } else {
      setValue("existingGuestId", 0);
    }
  };

  // ------------------ Pricing handlers ------------------
  const handlePricingSelect = (pricing: UnitTypePricing) => {
    setSelectedPricing(pricing);
    setValue("priceDuration", pricing.duration as PriceDuration);

    const discounted = calculateDiscountedPrice(
      pricing.price,
      pricing.discountRate,
    );
    setValue("unitPrice", discounted);
    setValue("discountRate", pricing.discountRate || null);

    setPeriod(1);
    setCustomNights(1);
    setValue("period", 1);
  };

  const handlePeriodChange = (newPeriod: number) => {
    if (newPeriod < 1) return;
    setPeriod(newPeriod);
    setValue("period", newPeriod);
  };

  const handleCustomNightsChange = (nights: number) => {
    if (nights < 1) return;
    setCustomNights(nights);
    setValue("period", nights);
  };

  const handlePropertyChange = (value: string) => {
    setValue("propertyId", Number(value));
    setValue("unitId", 0);
    setValue("numberOfGuests", 1);
    setValue("checkInDate", now);

    const defaultCheckout = new Date();
    defaultCheckout.setHours(10, 0, 0, 0);
    setValue("checkOutDate", defaultCheckout);

    setValue("priceDuration", "one_night");
    setValue("unitPrice", 0);
    setValue("period", 1);
    setValue("discountRate", null);
    setValue("totalAmount", 0);
    setSelectedPricing(null);
    setPeriod(1);
    setCustomNights(1);
  };

  const handleUnitChange = (value: string) => {
    setValue("unitId", Number(value));
    setValue("numberOfGuests", 1);
    setValue("checkInDate", now);

    const defaultCheckout = new Date();
    defaultCheckout.setHours(10, 0, 0, 0);
    setValue("checkOutDate", defaultCheckout);

    setValue("period", 1);
    setValue("discountRate", null);
    setValue("totalAmount", 0);
    setPeriod(1);
    setCustomNights(1);

    const unit = selectedProperty?.units.find((u) => u.id.toString() === value);
    const firstPricing = unit?.pricingOptions?.[0];

    if (firstPricing) {
      setSelectedPricing(firstPricing);
      setValue("priceDuration", firstPricing.duration as PriceDuration);

      const discounted = calculateDiscountedPrice(
        firstPricing.price,
        firstPricing.discountRate,
      );
      setValue("unitPrice", discounted);
      setValue("discountRate", firstPricing.discountRate || null);
    } else {
      setSelectedPricing(null);
      setValue("priceDuration", "one_night");
      setValue("unitPrice", 0);
    }
  };

  // ------------------ Navigation ------------------
  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (!isValid) return;

    setCurrentStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ------------------ Form submission ------------------
  const onSubmit = async () => {
    if (!selectedPricing) {
      toast.error("Please select a pricing option.");
      return;
    }

    if (guestType === "existing" && !selectedGuest) {
      toast.error("Please select a guest.");
      return;
    }

    setIsSubmitting(true);
    const uploadedUrls: string[] = [];

    try {
      const discounted = calculateDiscountedPrice(
        selectedPricing.price,
        selectedPricing.discountRate,
      );

      const isCustom = selectedPricing.duration === "custom";
      const finalPeriod = isCustom ? customNights : period;
      const finalSubtotal = isCustom
        ? discounted * customNights
        : calculateTotalAmount(discounted, period);
      const finalTotalAmount = calculateTotalWithVAT(finalSubtotal);

      let guestId: number;

      if (guestType === "existing") {
        guestId = selectedGuest!.id;
      } else {
        const idType = formData.guestIdType;

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

        const newGuest = await createGuest({
          firstName: formData.guestFirstName,
          lastName: formData.guestLastName,
          email: formData.guestEmail,
          phone: formData.guestPhone,
          dateOfBirth: formData.guestDateOfBirth,
          nationality: formData.guestNationality,
          notes: formData.guestNotes || undefined,
          registeredBy: agentId,
          ...(idType === "national_id"
            ? {
                idType: "national_id" as const,
                idNumber: formData.guestIdNumber!,
                idFrontUrl: idFrontUrl!,
                idBackUrl: idBackUrl!,
              }
            : {
                idType: "passport" as const,
                passportNumber: formData.guestPassportNumber!,
                passportUrl: passportUrl!,
              }),
        });

        guestId = newGuest.id;
      }

      await createBookingRequest.mutateAsync({
        guestId,
        propertyId: Number(formData.propertyId),
        unitId: Number(formData.unitId),
        checkInDate: new Date(formData.checkInDate),
        checkOutDate: new Date(formData.checkOutDate),
        numberOfGuests: formData.numberOfGuests,
        priceDuration: formData.priceDuration,
        unitPrice: discounted,
        period: finalPeriod,
        discountRate: selectedPricing.discountRate || null,
        totalAmount: finalTotalAmount,
        paymentMethod: formData.paymentMethod,
        paymentCode: formData.paymentCode,
        purpose: formData.purpose || null,
        specialRequests: formData.specialRequests || null,
      });

      router.push("/booking-requests");
    } catch (error) {
      console.error("Error submitting booking request:", error);

      for (const url of uploadedUrls) {
        try {
          await ClientMediaService.deleteGuestIdImage(url);
        } catch (cleanupError) {
          console.error("Failed to cleanup uploaded image:", cleanupError);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-28 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Render
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

      {/* Form */}
      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        {/* ------------------ Step 1: Select Guest ------------------ */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-5 text-primary" />
                Select Guest
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Guest Type Selection */}
              <div className="space-y-3">
                <Label>Guest Type</Label>
                <RadioGroup
                  value={guestType}
                  onValueChange={(value) =>
                    handleGuestTypeChange(value as "existing" | "new")
                  }
                  className="grid gap-3 md:grid-cols-2 pb-6"
                >
                  <Label htmlFor="guest-existing" className="cursor-pointer">
                    <Card
                      className={cn(
                        "transition-all py-2 w-full",
                        guestType === "existing"
                          ? "border-primary ring-2 ring-primary/20"
                          : "hover:border-primary/50",
                      )}
                    >
                      <CardContent className="flex items-center gap-4 p-4">
                        <RadioGroupItem
                          value="existing"
                          id="guest-existing"
                          hidden
                        />
                        <div
                          className={cn(
                            "size-10 rounded-lg flex items-center justify-center",
                            guestType === "existing"
                              ? "bg-primary/10"
                              : "bg-muted",
                          )}
                        >
                          <UserCheck
                            className={cn(
                              "size-5",
                              guestType === "existing"
                                ? "text-primary"
                                : "text-muted-foreground",
                            )}
                          />
                        </div>
                        <div>
                          <p className="font-medium">Existing Guest</p>
                          <p className="text-sm text-muted-foreground">
                            Select from registered guests
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Label>

                  <Label htmlFor="guest-new" className="cursor-pointer">
                    <Card
                      className={cn(
                        "transition-all py-2 w-full",
                        guestType === "new"
                          ? "border-primary ring-2 ring-primary/20"
                          : "hover:border-primary/50",
                      )}
                    >
                      <CardContent className="flex items-center gap-4 p-4">
                        <RadioGroupItem value="new" id="guest-new" hidden />
                        <div
                          className={cn(
                            "size-10 rounded-lg flex items-center justify-center",
                            guestType === "new" ? "bg-primary/10" : "bg-muted",
                          )}
                        >
                          <UserPlus
                            className={cn(
                              "size-5",
                              guestType === "new"
                                ? "text-primary"
                                : "text-muted-foreground",
                            )}
                          />
                        </div>
                        <div>
                          <p className="font-medium">New Guest</p>
                          <p className="text-sm text-muted-foreground">
                            Enter guest details manually
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Label>
                </RadioGroup>
              </div>

              {/* Existing Guest Selection */}
              {guestType === "existing" && (
                <div className="space-y-2">
                  <Label>Select Guest *</Label>
                  <GuestCombobox
                    value={selectedGuest}
                    onSelect={handleGuestSelect}
                    onAddNew={() => handleGuestTypeChange("new")}
                    error={!selectedGuest ? "Please select a guest" : undefined}
                  />
                </div>
              )}

              {/* New Guest Form */}
              {guestType === "new" && (
                <>
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
                        className={cn(
                          errors.guestLastName && "border-destructive",
                        )}
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
                        className={cn(
                          errors.guestEmail && "border-destructive",
                        )}
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
                        className={cn(
                          errors.guestPhone && "border-destructive",
                        )}
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
                      <Label htmlFor="nationality">Nationality *</Label>
                      <Controller
                        name="guestNationality"
                        control={control}
                        render={({ field }) => (
                          <NationalityCombobox
                            value={field.value || ""}
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
                          onValueChange={(value) => {
                            field.onChange(value);
                            clearAllImages();
                          }}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="national_id"
                              id="national_id"
                            />
                            <Label
                              htmlFor="national_id"
                              className="cursor-pointer"
                            >
                              National ID
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="passport" id="passport" />
                            <Label
                              htmlFor="passport"
                              className="cursor-pointer"
                            >
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
                      <Label htmlFor="guestIdNumber">
                        National ID Number *
                      </Label>
                      <Input
                        id="guestIdNumber"
                        placeholder="Enter ID number"
                        {...register("guestIdNumber")}
                        className={cn(
                          errors.guestIdNumber && "border-destructive",
                        )}
                      />
                      {errors.guestIdNumber && (
                        <p className="text-sm text-destructive">
                          {errors.guestIdNumber.message}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="guestPassportNumber">
                        Passport Number *
                      </Label>
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

                  {/* ID Document Images */}
                  <div className="space-y-3">
                    <Label>
                      {formData.guestIdType === "national_id"
                        ? "National ID Images (Front & Back)"
                        : "Passport Image"}{" "}
                      *
                    </Label>

                    {formData.guestIdType === "national_id" ? (
                      <div className="grid grid-cols-2 gap-4">
                        {/* Front Image */}
                        <ImageUploadSlot
                          label="Front"
                          image={frontImage}
                          inputRef={frontInputRef}
                          disabled={isSubmitting}
                          onSelect={(e) => handleFileSelect(e, setFrontImage)}
                          onRemove={() =>
                            removeFile(setFrontImage, frontInputRef)
                          }
                        />
                        <ImageUploadSlot
                          label="Back"
                          image={backImage}
                          inputRef={backInputRef}
                          disabled={isSubmitting}
                          onSelect={(e) => handleFileSelect(e, setBackImage)}
                          onRemove={() =>
                            removeFile(setBackImage, backInputRef)
                          }
                        />
                      </div>
                    ) : (
                      <div className="max-w-sm">
                        <ImageUploadSlot
                          label="Passport"
                          image={passportImage}
                          inputRef={passportInputRef}
                          disabled={isSubmitting}
                          onSelect={(e) =>
                            handleFileSelect(e, setPassportImage)
                          }
                          onRemove={() =>
                            removeFile(setPassportImage, passportInputRef)
                          }
                        />
                      </div>
                    )}

                    {uploadError && (
                      <p className="text-sm text-destructive">{uploadError}</p>
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
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* ------------------ Step 2: Booking Details ------------------ */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="size-5 text-primary" />
                Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Guest Summary */}
              <div className="p-4 rounded-lg bg-muted">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Guest
                </Label>
                {guestType === "existing" && selectedGuest ? (
                  <div className="mt-1">
                    <p className="font-medium">
                      {selectedGuest.firstName} {selectedGuest.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedGuest.email} • {selectedGuest.phone}
                    </p>
                  </div>
                ) : (
                  <div className="mt-1">
                    <p className="font-medium">
                      {formData.guestFirstName} {formData.guestLastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formData.guestEmail} • {formData.guestPhone}
                    </p>
                  </div>
                )}
              </div>

              {/* Property section */}
              <div className="space-y-2">
                <Label>
                  Property <span className="text-lipstick-red">*</span>
                </Label>
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
                          "w-full text-night",
                          errors.propertyId && "border-destructive",
                        )}
                      >
                        <SelectValue />
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
                  <Label>
                    Unit <span className="text-lipstick-red">*</span>
                  </Label>
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
                            <SelectValue />
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
                                  {unit.name} - {getUnitTypeLabel(unit.type)}
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
                    <Label>
                      Stay Duration & Pricing{" "}
                      <span className="text-lipstick-red">*</span>
                    </Label>
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
                              pricing.duration === "custom" && "md:col-span-2",
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

              {/* Period/Nights Selector */}
              {isPricingSelected && (
                <div className="space-y-3">
                  <Label>
                    {isCustomDuration
                      ? "How many nights?"
                      : `How many ${getPeriodLabel(formData.priceDuration)}?`}
                  </Label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="w-1/12"
                      onClick={() => {
                        if (isCustomDuration) {
                          handleCustomNightsChange(customNights - 1);
                        } else {
                          handlePeriodChange(period - 1);
                        }
                      }}
                      disabled={
                        isCustomDuration ? customNights <= 1 : period <= 1
                      }
                    >
                      <Minus className="size-4" />
                    </Button>

                    <Input
                      type="number"
                      value={isCustomDuration ? customNights : period}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 1) {
                          if (isCustomDuration) {
                            handleCustomNightsChange(val);
                          } else {
                            handlePeriodChange(val);
                          }
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
                      onClick={() => {
                        if (isCustomDuration) {
                          handleCustomNightsChange(customNights + 1);
                        } else {
                          handlePeriodChange(period + 1);
                        }
                      }}
                    >
                      <Plus className="size-4" />
                    </Button>

                    <span className="text-sm text-muted-foreground">
                      {isCustomDuration
                        ? customNights === 1
                          ? "night"
                          : "nights"
                        : getPeriodLabel(formData.priceDuration)}
                    </span>
                  </div>
                </div>
              )}

              {isPricingSelected &&
                formData.paymentMethod === "mpesa_till" &&
                paymentSettings && (
                  <div className="flex items-center gap-4 p-3 rounded-lg border-green-200">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-green-600">
                        Paybill Number
                      </p>
                      <p className="text-sm font-bold text-green-800">
                        {paymentSettings.paybillNumber}
                      </p>
                    </div>
                    <div className="w-px h-8 bg-green-200" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-green-600">
                        Account Number
                      </p>
                      <p className="text-sm font-bold text-green-800">
                        {paymentSettings.accountNumber}
                      </p>
                    </div>
                  </div>
                )}

              {/* Check-in & check-out Dates */}
              {isPricingSelected && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="checkInDate">Check-in Date</Label>
                    <Controller
                      name="checkInDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select check-in date"
                          minDate={new Date()}
                          error={!!errors.checkInDate}
                        />
                      )}
                    />
                    {isCustomDuration &&
                      selectedPricing?.fromDate &&
                      selectedPricing?.toDate && (
                        <p className="text-xs text-muted-foreground">
                          Must be between{" "}
                          {formatDateKE(selectedPricing.fromDate)} and{" "}
                          {formatDateKE(selectedPricing.toDate)}
                        </p>
                      )}
                    {errors.checkInDate && (
                      <p className="text-sm text-red-400">
                        {errors.checkInDate.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="checkOutDate">Check-out Date</Label>
                    <div className="flex items-center h-10 w-full rounded-md border bg-muted px-3 text-sm">
                      <CalendarIcon className="mr-2 size-4 text-muted-foreground" />
                      <span
                        className={
                          formData.checkOutDate
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        {formData.checkOutDate
                          ? format(
                              new Date(formData.checkOutDate),
                              "EEEE, MMMM d, yyyy 'at' hh:mm a",
                            )
                          : "Awaiting check-in date"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Auto-calculated · Default check-out time is 10:00 AM
                    </p>
                  </div>
                </div>
              )}

              {/* Total Amount Display */}
              {isPricingSelected && (
                <div className="p-4 rounded-lg bg-muted">
                  <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
                    <span>
                      {formatPrice(discountedPrice)} × {totalNights}{" "}
                      {totalNights === 1 ? "night" : "nights"}
                    </span>
                    {selectedPricing?.discountRate &&
                      selectedPricing.discountRate > 0 && (
                        <span className="text-green-600 text-xs">
                          {(selectedPricing.discountRate * 100).toFixed(0)}%
                          discount applied
                        </span>
                      )}
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
                    <span>VAT (16%)</span>
                    <span>{formatPrice(vatAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-medium">Total Amount</span>
                    <span className="text-2xl font-bold text-foreground">
                      {formatPrice(totalAmount)}
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

              {/* Payment Method */}
              {isPricingSelected && (
                <article className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">
                      Payment Method{" "}
                      <span className="text-lipstick-red">*</span>
                    </Label>
                    <Controller
                      name="paymentMethod"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            className={cn(
                              "w-full",
                              errors.paymentMethod && "border-destructive",
                            )}
                          >
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mpesa_till">
                              Mpesa Paybill
                            </SelectItem>
                            <SelectItem value="credit_card">
                              Credit Card
                            </SelectItem>
                            <SelectItem value="debit_card">
                              Debit Card
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.paymentMethod && (
                      <p className="text-sm text-destructive">
                        {errors.paymentMethod.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment-code">
                      Payment Reference Code{" "}
                      <span className="text-lipstick-red">*</span>
                    </Label>
                    <Input
                      id="payment-code"
                      type="text"
                      placeholder={
                        formData.paymentMethod === "mpesa_till"
                          ? "e.g. KTUDKLM900 (10 characters)"
                          : "e.g. KTUDKLM90012345 (15 characters)"
                      }
                      className={cn(errors.paymentCode && "border-destructive")}
                      {...register("paymentCode")}
                    />
                    {errors.paymentCode && (
                      <p className="text-sm text-destructive">
                        {errors.paymentCode.message}
                      </p>
                    )}
                  </div>
                </article>
              )}

              {/* Purpose */}
              <div className="space-y-2">
                <Label>
                  Purpose <span className="text-lipstick-red">*</span>
                </Label>
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
                        <SelectItem value="other">Other</SelectItem>
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

        {/* ═══════════════ Step 3: Confirmation ═══════════════ */}
        {currentStep === 3 && (
          <BookingRequestConfirmation
            guestType={guestType}
            selectedGuest={selectedGuest}
            formData={formData}
            frontImagePreview={frontImage.preview}
            backImagePreview={backImage.preview}
            passportImagePreview={passportImage.preview}
            selectedPricing={selectedPricing}
            period={isCustomDuration ? customNights : period}
            propertyName={selectedProperty?.name || ""}
            unitName={selectedUnit?.name || ""}
            savings={savings}
            paymentCode={formData.paymentCode}
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
              className="cursor-pointer md:w-36"
              disabled={isSubmitting}
            >
              {currentStep === 2 ? "Review" : "Next"}
              <ChevronRight className="size-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => onSubmit()}
              disabled={isSubmitting}
              className="min-w-[100px] cursor-pointer"
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
