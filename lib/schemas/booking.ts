import { z } from "zod";

/**
 * Extracts total minutes from a datetime-local string (e.g. "2025-06-01T14:30")
 * datetime-local is always the user's local time, no timezone conversion needed.
 */
/* const getMinutesFromDateTimeLocal = (val: string): number => {
    const [hours, minutes] = val.split("T")[1].split(":").map(Number);
    return hours * 60 + minutes;
} */;

export const BookingFormSchema = z
    .object({
        guestId: z.string().min(1, "Guest is required"),
        propertyId: z.string().min(1, "Property is required"),
        unitId: z.string().min(1, "Unit is required"),
        checkInDate: z
            .string()
            .min(1, "Check-in date is required")
            .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid check-in date format"),
        checkOutDate: z.string().min(1, "Check-out date is required"),
        numberOfGuests: z
            .number()
            .min(1, "At least 1 guest is required")
            .max(20, "Maximum 20 guests allowed"),
        priceDuration: z.enum(["one_night", "weekly", "monthly", "custom"], {
            required_error: "Please select a duration",
        }),
        period: z.number().min(1),
        unitPrice: z.number().min(0),
        discountRate: z.number().nullable().optional(),
        paymentMethod: z.string().min(1, "Payment method is required"),
        paymentCode: z.string().min(1, "Payment code is required").toUpperCase(),
        status: z.enum(["pending", "reserved", "checked_in"]),
        specialRequests: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.paymentMethod === "mpesa_till") {
            if (data.paymentCode.length !== 10) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "M-Pesa payment code must be exactly 10 characters",
                    path: ["paymentCode"],
                });
            }
        } else if (
            data.paymentMethod === "credit_card" ||
            data.paymentMethod === "debit_card"
        ) {
            if (data.paymentCode.length !== 15) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Card payment code must be exactly 15 characters",
                    path: ["paymentCode"],
                });
            }
        }
    });

export type BookingFormData = z.infer<typeof BookingFormSchema>;