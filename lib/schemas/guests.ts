import z from "zod"

const nameRegex = /^[A-Za-z]+$/;
const phoneRegex = /^[0-9+\-\s]+$/;

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
            .regex(nameRegex, "Only letters are allowed")
            .max(20, "At most 20 characters."),
        email: z.string().email("Please enter a valid email address."),
        phone: z
            .string()
            .regex(
                phoneRegex,
                "Only digits, plus (+), dash (-), and spaces are allowed.",
            )
            .min(10, "At least 10 digits.")
            .max(15, "At most 15 digits."),
        nationality: z.string().min(1, "Nationality is required."),
        idType: z.literal("national_id"),
        dateOfBirth: z
            .string()
            .refine(
                (dateString) => new Date(dateString) < new Date(),
                "Date of birth must be in the past.",
            ),
        idNumber: z
            .string()
            .min(8, "At least 8 characters are required.")
            .max(10, "At most 10 characters"),
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
                "Only digits, plus (+), dash (-), and spaces are allowed.",
            )
            .min(10, "At least 10 digits.")
            .max(15, "At most 15 digits"),
        dateOfBirth: z
            .string()
            .refine(
                (dateString) => new Date(dateString) < new Date(),
                "Date of birth must be in the past.",
            ),
        nationality: z.string().min(1, "Nationality is required."),
        idType: z.literal("passport"),
        idNumber: z.string().optional(),
        passportNumber: z.string().length(9, "Passport should have 9 characters."),
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