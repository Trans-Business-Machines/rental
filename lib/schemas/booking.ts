import { z } from "zod";

export const BookingFormSchema = z.object({
    guestId: z.string().min(1, "Guest is required"),
    propertyId: z.string().min(1, "Property is required"),
    unitId: z.string().min(1, "Unit is required"),
    checkInDate: z.string().min(1, "Check-in date is required"),
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
    paymentCode: z.string().min(1, "Payment reference code is required").length(10, "Must be 10 characters").toUpperCase(),
    status: z.enum(["pending", "reserved", "checked_in"]),
    specialRequests: z.string().optional(),
});

export type BookingFormData = z.infer<typeof BookingFormSchema>;