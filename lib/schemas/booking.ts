import { z } from "zod"

export const BookingFormSchema = z
    .object({
        guestId: z.string().min(1, "Guest is required."),
        propertyId: z.string().min(1, "Property is required."),
        unitId: z.string().min(1, "Unit is required."),
        numberOfGuests: z.coerce
            .number({
                required_error: "Number of guests is required.",
                invalid_type_error: "Must be a number",
            })
            .positive("Must be a positive number")
            .int("Must be a whole number"),
        priceDuration: z.enum(["one_night", "weekly"], {
            required_error: "Please select a stay duration",
        }),
        period: z.coerce.number().min(1, "Period must be at least 1"),
        unitPrice: z.coerce.number().min(1, "Unit price is required"),
        checkInDate: z
            .string()
            .min(1, "Check-in date is required.")
            .refine(
                (dateString) =>
                    new Date(dateString) >=
                    new Date(new Date().toISOString().split("T")[0]),
                "Check-in date cannot be in the past."
            ),
        checkOutDate: z.string().min(1, "Check-out date is required."),
        paymentMethod: z.string().min(1, "Payment method is required."),
        status: z.enum([
            "pending",
            "reserved",
            "checked_in",
            "checked_out",
            "cancelled",
        ]),
        specialRequests: z.string().max(1000, "Special request is too long.").optional(),
    })
    .refine((data) => new Date(data.checkOutDate) > new Date(data.checkInDate), {
        message: "Check-out date must be after check-in date.",
        path: ["checkOutDate"],
    });

export type BookingFormData = z.infer<typeof BookingFormSchema>;