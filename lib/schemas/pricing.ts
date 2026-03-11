import { z } from "zod";

export const PricingEditSchema = z.object({
    duration: z.enum(["one_night", "weekly"], {
        required_error: "Please select a duration",
    }),
    price: z
        .number({
            required_error: "Price is required",
            invalid_type_error: "Price must be a number",
        })
        .min(1, "Price must be greater than 0"),
    nights: z.number().min(1),
});

export type PricingEditFormData = z.infer<typeof PricingEditSchema>;