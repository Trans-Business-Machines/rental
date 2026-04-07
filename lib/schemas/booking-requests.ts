// lib/schemas/booking-requests.ts
import { z } from "zod";
import { differenceInYears } from "date-fns";

const nameRegex = /^[A-Za-z]+$/;
const phoneRegex = /^\+?[0-9]\d{1,14}$/;

const isAtLeast18 = (dateString: string): boolean => {
  const birthDate = new Date(dateString);
  const today = new Date();
  return differenceInYears(today, birthDate) >= 18;
};

const dateOfBirthSchema = z
  .string()
  .refine(
    (dateString) => new Date(dateString) < new Date(),
    "Date of birth must be in the past."
  )
  .refine(
    (dateString) => isAtLeast18(dateString),
    "Guest must be at least 18 years old."
  );

// Base booking details schema (always required)
const bookingDetailsSchema = {
  propertyId: z.number().min(1, "Property is required"),
  unitId: z.number().min(1, "Unit is required"),
  checkInDate: z
    .string()
    .min(1, "Check-in date is required")
    .regex(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,
      "Invalid check-in date format"
    ),
  checkOutDate: z.date(),
  numberOfGuests: z.number().min(1, "At least 1 guest is required"),
  priceDuration: z.enum(["one_night", "weekly", "monthly", "custom"]),
  unitPrice: z.number().min(1, "Price is required"),
  period: z.number().min(1),
  discountRate: z.number().nullable().optional(),
  totalAmount: z.number().min(1, "Total amount is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  paymentCode: z
    .string()
    .min(1, "Payment reference code is required")
    .length(10, "Must be 10 characters")
    .toUpperCase(),
  purpose: z.string().nullable().optional(),
  specialRequests: z.string().nullable().optional(),
};

// Schema for existing guest booking request
export const ExistingGuestBookingRequestSchema = z.object({
  guestType: z.literal("existing"),
  existingGuestId: z.number().min(1, "Please select a guest"),
  ...bookingDetailsSchema,
});

// Base schema for new guest (without refinements)
const NewGuestBookingRequestBaseSchema = z.object({
  guestType: z.literal("new"),
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
  guestDateOfBirth: dateOfBirthSchema,
  guestNationality: z.string().min(1, "Nationality is required"),
  guestIdType: z.enum(["national_id", "passport"]),
  guestIdNumber: z
    .string()
    .min(8, "At least 8 characters are required.")
    .max(10, "At most 10 characters")
    .nullable()
    .optional(),
  guestPassportNumber: z
    .string()
    .length(9, "Passport should have 9 characters.")
    .nullable()
    .optional(),
  guestNotes: z.string().nullable().optional(),

  // ID Document - NOT validated by schema (handled manually)
  idDocumentFilename: z.string().optional(),
  idDocumentOriginalName: z.string().optional(),
  idDocumentMimeType: z.string().optional(),
  idDocumentFileSize: z.number().optional(),

  ...bookingDetailsSchema,
});

// Combined schema using discriminated union (without refinements)
export const BookingRequestSchema = z.discriminatedUnion("guestType", [
  ExistingGuestBookingRequestSchema,
  NewGuestBookingRequestBaseSchema,
]);

// Schema with refinements for form validation (use this for full validation)
export const NewGuestBookingRequestSchema = NewGuestBookingRequestBaseSchema
  .refine(
    (data) => {
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
      if (data.guestIdType === "passport") {
        return !!data.guestPassportNumber;
      }
      return true;
    },
    {
      message: "Passport number is required for Passport",
      path: ["guestPassportNumber"],
    }
  );

// Combined form data type that allows all fields (for useForm)
export type BookingRequestFormData = {
  guestType: "existing" | "new";
  existingGuestId?: number;
  guestFirstName?: string;
  guestLastName?: string;
  guestEmail?: string;
  guestPhone?: string;
  guestDateOfBirth?: string;
  guestNationality?: string;
  guestIdType?: "national_id" | "passport";
  guestIdNumber?: string | null;
  guestPassportNumber?: string | null;
  guestNotes?: string | null;
  idDocumentFilename?: string;
  idDocumentOriginalName?: string;
  idDocumentMimeType?: string;
  idDocumentFileSize?: number;
  propertyId: number;
  unitId: number;
  checkInDate: string;
  checkOutDate: Date;
  numberOfGuests: number;
  priceDuration: "one_night" | "weekly" | "monthly" | "custom";
  unitPrice: number;
  period: number;
  discountRate?: number | null;
  totalAmount: number;
  paymentMethod: string;
  paymentCode: string;
  purpose?: string | null;
  specialRequests?: string | null;
};

export type ExistingGuestBookingRequestData = z.infer<typeof ExistingGuestBookingRequestSchema>;
export type NewGuestBookingRequestData = z.infer<typeof NewGuestBookingRequestSchema>;