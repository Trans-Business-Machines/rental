import { z } from "zod"

const checkoutItemSchema = z.object({
    itemId: z.string(),
    itemName: z.string(),
    category: z.string(),
    // Outstanding quantity in the unit; the server spreads flagged counts
    // across the item's assignments, so no assignment IDs are needed here.
    totalQuantity: z.number().positive(),
    damagedCount: z.number().int().min(0),
    missingCount: z.number().int().min(0),
    // Replacement cost per unit in KES, used only to suggest the damage cost.
    unitCost: z.number().nullable(),
}).refine(
    (item) => item.damagedCount + item.missingCount <= item.totalQuantity,
    { message: "Damaged plus missing cannot exceed total quantity" }
);

export const CheckoutFormSchema = z.object({
    checkoutDate: z.string().min(1, "Checkout date is required"),
    checkoutItems: z.array(checkoutItemSchema),
    overallDamageCost: z.number({
        required_error: "Overall Damage cost is required, minmum is 0",
        invalid_type_error: "Overall Damage cost is required, minmum is 0"
    }).min(0, "Overall Damage cost is required, minmum is 0"),
    notes: z.string().optional(),
})
    .refine(
        (data) => {
            if (hasFlaggedItems(data.checkoutItems)) {
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

type CheckoutFormItem = CheckoutFormData["checkoutItems"][number];

export function hasFlaggedItems(items: CheckoutFormItem[]): boolean {
    return items.some((item) => item.damagedCount > 0 || item.missingCount > 0);
}

/** Damaged and missing units are both charged at full replacement cost (KES). */
export function itemReplacementCost(item: CheckoutFormItem): number {
    return (item.damagedCount + item.missingCount) * (item.unitCost ?? 0);
}

export function suggestedReplacementCost(items: CheckoutFormItem[]): number {
    return items.reduce((sum, item) => sum + itemReplacementCost(item), 0);
}
