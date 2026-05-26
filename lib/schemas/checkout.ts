import { z } from "zod"

const checkoutItemSchema = z.object({
    itemId: z.number(),
    itemName: z.string(),
    category: z.string(),
    totalQuantity: z.number().min(1),
    damagedCount: z.number().min(0),
    missingCount: z.number().min(0),
    assignmentIds: z.array(z.number()),
}).refine(
    (item) => item.damagedCount + item.missingCount <= item.totalQuantity,
    { message: "Damaged plus missing cannot exceed total quantity" }
);

export const CheckoutFormSchema = z.object({
    checkoutDate: z.string().min(1, "Checkout date is required"),
    checkoutItems: z.array(checkoutItemSchema),
    overallDamageCost: z.number({
        required_error: "Overall damage cost is required."
    }).positive({
        message: "Overall cost must be a postive number"
    }).min(0),
    notes: z.string().optional(),
})
    .refine(
        (data) => {
            if (data.overallDamageCost > 0) {
                return !!data.notes && data.notes.trim() !== "";
            }
            return true;
        },
        {
            message: "Notes are required when there are damaged or missing items",
            path: ["notes"],
        }
    )

export type CheckoutFormData = z.infer<typeof CheckoutFormSchema>;