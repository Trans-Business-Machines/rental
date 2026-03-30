import { z } from "zod";

const nameRegex = /^[A-Za-z]+$/;
const phoneRegex = /^\+?[0-9]\d{1,14}$/

export const BookingRequestSchema = z.object({
    // Guest Details
    guestFirstName: z
        .string()
        .min(3, "At least 3 characters are required.")
        .regex(nameRegex, "Only letters are allowed.")
        .max(20, "At most 20 characters."),
    guestLastName: z
        .string()
        .min(3, "At least 3 characters are required.")
        .regex(nameRegex, "Only letters are allowed")
        .max(20, "At most 20 characters."),
    guestEmail: z.string().email("Invalid email address"),
    guestPhone: z.string().regex(phoneRegex, "Invalid phone number."),
    guestDateOfBirth: z.string().min(1, "Date of birth is required"),
    guestNationality: z.string().min(1, "Nationality is required"),
    guestIdType: z.enum(["national_id", "passport"]),
    guestIdNumber: z
        .string()
        .min(8, "At least 8 characters are required.")
        .max(10, "At most 10 characters").nullable().optional(),
    guestPassportNumber: z.string().length(9, "Passport should have 9 characters.").nullable().optional(),
    guestNotes: z.string().nullable().optional(),

    // ID Document - NOT validated by schema (handled manually)
    idDocumentFilename: z.string().optional(),
    idDocumentOriginalName: z.string().optional(),
    idDocumentMimeType: z.string().optional(),
    idDocumentFileSize: z.number().optional(),

    // Booking Details
    propertyId: z.number().min(1, "Property is required"),
    unitId: z.number().min(1, "Unit is required"),
    checkInDate: z.date(),
    checkOutDate: z.date(),
    numberOfGuests: z.number().min(1, "At least 1 guest is required"),
    priceDuration: z.enum(["one_night", "weekly", "monthly", "custom"]),
    unitPrice: z.number().min(1, "Price is required"),
    period: z.number().min(1),
    discountRate: z.number().nullable().optional(),
    totalAmount: z.number().min(1, "Total amount is required"),
    purpose: z.string().nullable().optional(),
    specialRequests: z.string().nullable().optional(),
})
    .refine(
        (data) => {
            // If idType is national_id, idNumber is required
            if (data.guestIdType === "national_id") {
                return !!data.guestIdNumber;
            }
            return true;
        },
        {
            message: "ID number is required for National ID",
            path: ["guestIdNumber"],
        }
    )
    .refine(
        (data) => {
            // If idType is passport, passportNumber is required
            if (data.guestIdType === "passport") {
                return !!data.guestPassportNumber;
            }
            return true;
        },
        {
            message: "Passport number is required for Passport",
            path: ["guestPassportNumber"],
        }
    )
    .refine(
        (data) => {
            // checkOutDate must be after checkInDate
            return data.checkOutDate > data.checkInDate;
        },
        {
            message: "Check-out date must be after check-in date",
            path: ["checkOutDate"],
        }
    );

export type BookingRequestFormData = z.infer<typeof BookingRequestSchema>;