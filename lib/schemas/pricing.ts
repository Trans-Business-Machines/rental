import { z } from "zod";

export const PricingFormSchema = z.object({
    unitType: z.string().min(1, "Unit type is required"),
    duration: z.enum(["one_night", "weekly", "monthly"], {
        required_error: "Please select a duration",
    }),
    price: z
        .number({
            required_error: "Price is required",
            invalid_type_error: "Price must be a number",
        })
        .min(1, "Price must be greater than 0"),
    nights: z.number().nullable().optional(),
    discountRate: z
        .number()
        .int("Discount must be a whole number")
        .min(0, "Discount cannot be negative")
        .max(100, "Discount cannot exceed 100%")
        .nullable()
        .optional(),
    isActive: z.boolean(),
});

export type PricingFormData = z.infer<typeof PricingFormSchema>;

export const PricingEditSchema = PricingFormSchema;
export type PricingEditFormData = z.infer<typeof PricingEditSchema>;