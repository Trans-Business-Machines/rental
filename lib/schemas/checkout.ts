
import { z } from "zod"

export const CheckoutFormSchema = z.object({
    // step 1 Inspection details
    checkoutDate: z.string().min(1, "Checkout date is required"),
    inspector: z
        .string()
        .min(3, "Inspector name must be at least 3 characters")
        .max(100, "Inspector name is too long"),
    notes: z.string().optional(),


    // step 2 Inventory Checklist
    checkoutItems: z.array(
        z.object({
            assignmentId: z.number(),
            checked: z.boolean(),
            condition: z.enum(["good", "damaged", "missing"]),
            damageCost: z.coerce.number().min(0, "Damage cost must be positive"),
            notes: z.string().optional(),
        })
    ),


    // step 3 Final summary
    depositDeduction: z.coerce
        .number()
        .min(0, "Deposit deduction must be positive"),
})

export type CheckoutFormData = z.infer<typeof CheckoutFormSchema>