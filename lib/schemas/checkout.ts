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
    depositDeduction: z.number().min(0),
    overallDamageCost: z.number().min(0),
    notes: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof CheckoutFormSchema>;