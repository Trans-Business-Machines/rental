import { z } from "zod";
import { differenceInYears } from "date-fns";

const nameRegex = /^[A-Za-z]+$/;
const phoneRegex = /^\+?(?=(?:\D*\d){7,15}\D*$)[\d\s\-]+$/;

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

/**
 * Shared payment code cross-field validation.
 * M-Pesa till → exactly 10 characters, card → exactly 15 characters.
 */
const validatePaymentCode = (
  data: { paymentMethod: string; paymentCode: string },
  ctx: z.RefinementCtx
) => {
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
};

// Form-level schema (used by zodResolver + trigger)
// Every field has real validation rules, but only
// the relevant fields are triggered per step.
export const BookingRequestFormSchema = z
  .object({
    // Step 1: Guest
    guestType: z.enum(["existing", "new"]),
    // Required only when guestType === "existing" (enforced below)
    existingGuestId: z.number().nullable().optional(),

    // Guest detail fields are only collected when guestType === "new".
    // They're optional here so an existing-guest submission (where these
    // inputs are never rendered) doesn't fail validation; presence is
    // enforced conditionally in the superRefine below, while format is
    // still checked whenever a value is actually provided.
    // ".or(z.literal(''))" is required (not just ".optional()") because RHF
    // doesn't clear a field's value when its input unmounts (e.g. switching
    // guestType away from "new", or toggling guestIdType between
    // national_id/passport) - the stale "" would otherwise fail .min()/regex.
    guestFirstName: z
      .string()
      .min(3, "At least 3 characters are required.")
      .regex(nameRegex, "Only letters are allowed.")
      .max(20, "At most 20 characters.")
      .optional()
      .or(z.literal("")),
    guestLastName: z
      .string()
      .min(3, "At least 3 characters are required.")
      .regex(nameRegex, "Only letters are allowed.")
      .max(20, "At most 20 characters.")
      .optional()
      .or(z.literal("")),
    guestEmail: z.string().email("Invalid email address.").optional().or(z.literal("")),
    guestPhone: z
      .string()
      .regex(
        phoneRegex,
        "Enter a valid phone number (7–15 digits). Only digits, spaces, hyphens, and a leading + are allowed."
      )
      .optional()
      .or(z.literal("")),
    guestDateOfBirth: dateOfBirthSchema.optional().or(z.literal("")),
    guestNationality: z
      .string()
      .min(1, "Nationality is required.")
      .optional()
      .or(z.literal("")),
    guestIdType: z.enum(["national_id", "passport"]),
    // Required only when guestType === "new" and guestIdType === "national_id"
    guestIdNumber: z
      .string()
      .min(8, "At least 8 characters are required.")
      .max(10, "At most 10 characters.")
      .optional()
      .or(z.literal("")),
    // Required only when guestType === "new" and guestIdType === "passport"
    guestPassportNumber: z
      .string()
      .min(8, "Passport number must be at least 8 characters.")
      .max(12, "Passport number must be at most 12 characters.")
      .optional()
      .or(z.literal("")),
    guestNotes: z.string().nullable().optional(),

    // ID Document metadata (handled manually, not validated by Zod)
    idDocumentFilename: z.string().optional(),
    idDocumentOriginalName: z.string().optional(),
    idDocumentMimeType: z.string().optional(),
    idDocumentFileSize: z.number().optional(),

    // Step 2: Booking Details (required regardless of guest type)
    propertyId: z.number().min(1, "Property is required."),
    unitId: z.number().min(1, "Unit is required."),
    checkInDate: z
      .string()
      .min(1, "Check-in date is required."),

    checkOutDate: z.date(),
    numberOfGuests: z.number().min(1, "At least 1 guest is required."),
    priceDuration: z.enum(["one_night", "weekly", "monthly", "custom"]),
    unitPrice: z.number().min(1, "Price is required."),
    period: z.number().min(1),
    discountRate: z.number().nullable().optional(),
    totalAmount: z.number().min(1, "Total amount is required."),
    paymentMethod: z.string().min(1, "Payment method is required."),
    paymentCode: z.string().min(1, "Payment code is required.").toUpperCase(),
    purpose: z.string().nullable().optional(),
    specialRequests: z.string().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    validatePaymentCode(data, ctx);

    if (data.guestType === "existing") {
      if (!data.existingGuestId || data.existingGuestId < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select a guest.",
          path: ["existingGuestId"],
        });
      }
      return;
    }

    // guestType === "new": guest detail fields become required
    if (!data.guestFirstName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least 3 characters are required.",
        path: ["guestFirstName"],
      });
    }
    if (!data.guestLastName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least 3 characters are required.",
        path: ["guestLastName"],
      });
    }
    if (!data.guestEmail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid email address.",
        path: ["guestEmail"],
      });
    }
    if (!data.guestPhone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Enter a valid phone number (7–15 digits). Only digits, spaces, hyphens, and a leading + are allowed.",
        path: ["guestPhone"],
      });
    }
    if (!data.guestDateOfBirth) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Date of birth is required.",
        path: ["guestDateOfBirth"],
      });
    }
    if (!data.guestNationality) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nationality is required.",
        path: ["guestNationality"],
      });
    }

    if (data.guestIdType === "national_id" && !data.guestIdNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "ID number is required for National ID.",
        path: ["guestIdNumber"],
      });
    }
    if (data.guestIdType === "passport" && !data.guestPassportNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passport number is required for Passport.",
        path: ["guestPassportNumber"],
      });
    }
  });

export type BookingRequestFormData = z.infer<typeof BookingRequestFormSchema>;

// Base booking details schema (always required)
const bookingDetailsSchema = {
  propertyId: z.number().min(1, "Property is required"),
  unitId: z.number().min(1, "Unit is required"),
  checkInDate: z
    .string()
    .min(1, "Check-in date is required."),
  checkOutDate: z.date(),
  numberOfGuests: z.number().min(1, "At least 1 guest is required"),
  priceDuration: z.enum(["one_night", "weekly", "monthly", "custom"]),
  unitPrice: z.number().min(1, "Price is required"),
  period: z.number().min(1),
  discountRate: z.number().nullable().optional(),
  totalAmount: z.number().min(1, "Total amount is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  paymentCode: z.string().min(1, "Payment code is required").toUpperCase(),
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
  guestPhone: z
    .string()
    .regex(
      phoneRegex,
      "Enter a valid phone number (7–15 digits). Only digits, spaces, hyphens, and a leading + are allowed."
    ),
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
    .min(8, "Passport number must be at least 8 characters.")
    .max(12, "Passport number must be at most 12 characters.")
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
  .superRefine(validatePaymentCode)
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

export type ExistingGuestBookingRequestData = z.infer<typeof ExistingGuestBookingRequestSchema>;
export type NewGuestBookingRequestData = z.infer<typeof NewGuestBookingRequestSchema>;