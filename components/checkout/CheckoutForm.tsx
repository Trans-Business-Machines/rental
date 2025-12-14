"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckoutFormSchema, CheckoutFormData } from "@/lib/schemas/checkout";
import { ProgressBar } from "@/components/checkout/ProgressBar";
import { Step1InspectionDetails } from "@/components/checkout/Step1InspectionDetails";
import { Step2InventoryChecklist } from "@/components/checkout/Step2InventoryChecklist";
import { Step3FinancialSummary } from "@/components/checkout/Step3FinancialSummary";
import { createCheckoutReport } from "@/lib/actions/checkout";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type {
  BookingsForCheckout,
  InventoryAssignmentForUnit,
} from "@/lib/types/types";

interface CheckoutFormProps {
  bookings: BookingsForCheckout;
  assignments: InventoryAssignmentForUnit;
  bookingId: number;
}

export function CheckoutForm({
  bookings,
  assignments,
  bookingId,
}: CheckoutFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  //  Get the guest's booking data we are checking out
  const selectedBooking = bookings.find((b) => b.id === bookingId);

  // Initialize React Hook Form
  const {
    register,
    watch,
    setValue,
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(CheckoutFormSchema),
    defaultValues: {
      checkoutDate: today,
      inspector: "",
      notes: "",
      checkoutItems: [],
      depositDeduction: 0,
    },
    mode: "onChange",
  });

  const formData = watch();

  // Define which fields to validate per step
  const stepFields: Record<number, (keyof CheckoutFormData)[]> = {
    1: ["checkoutDate", "inspector"],
    2: ["checkoutItems"],
    3: ["depositDeduction"],
  };

  // Validate current step
  const validateStep = async (step: number): Promise<boolean> => {
    const fields = stepFields[step];
    const result = await trigger(fields as any);
    return result;
  };

  // Handle next button
  const handleNext = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    const isValid = await validateStep(currentStep);

    if (!isValid) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    // Additional validation for Step 2
    if (currentStep === 2) {
      const checkoutItems = formData.checkoutItems || [];
      const uncheckedItems = checkoutItems.filter((item) => !item.checked);

      if (uncheckedItems.length > 0) {
        toast.error("All items must be inspected before proceeding.");
        return;
      }

      // check if damaged items have a damaged cost
      const damagedWithoutCost = checkoutItems.filter(
        (item) =>
          item.checked &&
          item.condition === "damaged" &&
          (!item.damageCost || item.damageCost === 0)
      );

      if (damagedWithoutCost.length > 0) {
        toast.error("Please enter a damage cost for damaged items.");
        return;
      }
    }

    setCurrentStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle back button
  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle form submission
  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);

    if (!selectedBooking) {
      toast.error("Kindly select a booking.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Filter only checked items
      const checkedItems = data.checkoutItems
        .filter((item) => item.checked)
        .map((item) => ({
          assignmentId: item.assignmentId,
          condition: item.condition,
          damageCost: item.damageCost,
          notes: item.notes,
        }));

      // Prepare data for server action
      const checkoutData = {
        bookingId: selectedBooking.id,
        guestId: selectedBooking.guestId,
        checkoutDate: new Date(data.checkoutDate),
        inspector: data.inspector,
        totalDamageCost: checkedItems.reduce(
          (sum, item) => sum + item.damageCost,
          0
        ),
        depositDeduction: data.depositDeduction,
        notes: data.notes,
        checkoutItems: checkedItems,
      };

      console.log(checkoutData);

      await createCheckoutReport(checkoutData);

      toast.success("Checkout completed successfully!");
      router.push("/bookings");
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to complete checkout. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      {/* Progress Bar */}
      <ProgressBar currentStep={currentStep} />

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Step 1: Inspection Details */}
        {currentStep === 1 && (
          <Step1InspectionDetails
            selectedBooking={selectedBooking || null}
            register={register}
            errors={errors}
          />
        )}

        {/* Step 2: Inventory Checklist */}
        {currentStep === 2 && (
          <Step2InventoryChecklist
            assignments={assignments}
            watch={watch}
            setValue={setValue}
            control={control}
          />
        )}

        {/* Step 3: Financial Summary */}
        {currentStep === 3 && (
          <Step3FinancialSummary
            selectedBooking={selectedBooking || null}
            assignments={assignments}
            watch={watch}
            register={register}
            errors={errors}
          />
        )}

        {/* Navigation Buttons */}
        <article className="fixed lg:static bottom-0 left-0 right-0 bg-background border-t  lg:pt-6 lg:border-t z-50">
          <div className="container mx-auto px-4 py-4 lg:px-0 lg:py-0">
            <div className="flex justify-between items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || isSubmitting}
                className="min-w-[80px] bg-transparent"
              >
                Back
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  Step {currentStep} of 3
                </span>
                <span className="text-xs text-muted-foreground sm:hidden">
                  {currentStep}/3
                </span>
              </div>

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="min-w-[80px]"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">Checking out...</span>
                    </>
                  ) : (
                    <span>Checkout</span>
                  )}
                </Button>
              )}
            </div>
          </div>
        </article>
      </form>
    </section>
  );
}
