import z from "zod";
import { differenceInYears } from "date-fns";

const nameRegex = /^[A-Za-z]+$/;
const phoneRegex = /^\+?(?=(?:\D*\d){7,15}\D*$)[\d\s\-]+$/;

// Helper function to validate age
const isAtLeast18 = (dateString: string): boolean => {
    const birthDate = new Date(dateString);
    const today = new Date();
    return differenceInYears(today, birthDate) >= 18;
};

// Reusable dateOfBirth schema
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

// Shared base fields
const baseGuestFields = {
    firstName: z
        .string()
        .min(3, "At least 3 characters are required.")
        .regex(nameRegex, "Only letters are allowed.")
        .max(20, "At most 20 characters."),
    lastName: z
        .string()
        .min(3, "At least 3 characters are required.")
        .regex(nameRegex, "Only letters are allowed.")
        .max(20, "At most 20 characters."),
    email: z.string().email("Please enter a valid email address."),
    phone: z
        .string()
        .regex(
            phoneRegex,
            "Enter a valid phone number (7-15 digits). Only digits, spaces, hyphens, and a leading + are allowed."
        ),
    dateOfBirth: dateOfBirthSchema,
    nationality: z.string().min(1, "Nationality is required."),
    notes: z.string().max(1000, "At most 1000 characters allowed.").optional(),
};

export const GuestSchema = z.discriminatedUnion("idType", [
    z.object({
        ...baseGuestFields,
        idType: z.literal("national_id"),
        idNumber: z
            .string()
            .min(8, "At least 8 characters are required.")
            .max(10, "At most 10 characters."),
        passportNumber: z.string().optional(),
        idFrontUrl: z.string().optional(),
        idBackUrl: z.string().optional(),
        passportUrl: z.string().optional(),
    }),
    z.object({
        ...baseGuestFields,
        idType: z.literal("passport"),
        passportNumber: z
            .string()
            .min(8, "Passport number must be at least 8 characters.")
            .max(12, "Passport number must be at most 12 characters."),
        idNumber: z.string().optional(),
        passportUrl: z.string().optional(),
        idFrontUrl: z.string().optional(),
        idBackUrl: z.string().optional(),
    }),
]);


export const GuestEditSchema = z
  .object({
    // Personal information
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string(),
    dateOfBirth: z.string(),
    nationality: z.string(),
    idType: z.enum(["national_id", "passport"]),
    idNumber: z.string().optional().or(z.literal("")),
    passportNumber: z.string().optional().or(z.literal("")),

    // Image URLs (set programmatically after upload)
    idFrontUrl: z.string().optional().nullable(),
    idBackUrl: z.string().optional().nullable(),
    passportUrl: z.string().optional().nullable(),

    // Editable fields
    address: z.string().max(200, "At most 200 characters.").optional().or(z.literal("")),
    city: z.string().max(100, "At most 100 characters.").optional().or(z.literal("")),
    country: z.string().max(100, "At most 100 characters.").optional().or(z.literal("")),
    occupation: z.string().max(100, "At most 100 characters.").optional().or(z.literal("")),
    employer: z.string().max(100, "At most 100 characters.").optional().or(z.literal("")),
    emergencyContactName: z.string().max(100).optional().or(z.literal("")),
    emergencyContactPhone: z
      .string()
      .regex(phoneRegex, "Enter a valid phone number.")
      .optional()
      .or(z.literal("")),
    emergencyContactRelation: z.string().max(100).optional().or(z.literal("")),
    verificationStatus: z.enum(["pending", "verified", "rejected"]),
    notes: z.string().max(1000, "At most 1000 characters.").optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.verificationStatus === "rejected") {
        return data.notes && data.notes.trim().length > 0;
      }
      return true;
    },
    {
      message: "Rejection reason is required.",
      path: ["notes"],
    },
  );

export type GuestEditFormData = z.infer<typeof GuestEditSchema>;

export type NewGuest = z.infer<typeof GuestSchema>;

export type GuestIdTypes = Pick<NewGuest, "idType">["idType"];