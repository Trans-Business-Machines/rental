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

export const GuestSchema = z.discriminatedUnion("idType", [
    z.object({
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
                "Enter a valid phone number (7–15 digits). Only digits, spaces, hyphens, and a leading + are allowed."
            ),
        nationality: z.string().min(1, "Nationality is required."),
        idType: z.literal("national_id"),
        dateOfBirth: dateOfBirthSchema,
        idNumber: z
            .string()
            .min(8, "At least 8 characters are required.")
            .max(10, "At most 10 characters."),
        passportNumber: z.string().optional(),
        idDocument: z
            .object({
                filename: z.string(),
                originalName: z.string(),
                fileSize: z.number(),
                mimeType: z.string(),
                filePath: z.string(),
            })
            .optional(),
        notes: z.string().max(1000, "At most 1000 characters allowed.").optional(),
    }),
    z.object({
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
                "Enter a valid phone number (7–15 digits). Only digits, spaces, hyphens, and a leading + are allowed."
            ),
        dateOfBirth: dateOfBirthSchema,
        nationality: z.string().min(1, "Nationality is required."),
        idType: z.literal("passport"),
        idNumber: z.string().optional(),
        passportNumber: z
            .string()
            .min(8, "Passport number must be at least 8 characters.")
            .max(12, "Passport number must be at most 12 characters."),
        idDocument: z
            .object({
                filename: z.string(),
                originalName: z.string(),
                fileSize: z.number(),
                mimeType: z.string(),
                filePath: z.string(),
            })
            .optional(),
        notes: z.string().max(1000, "At most 1000 characters allowed.").optional(),
    }),
]);

export type NewGuest = z.infer<typeof GuestSchema>;

export type GuestIdTypes = Pick<NewGuest, "idType">["idType"];