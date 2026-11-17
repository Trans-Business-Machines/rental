import z from "zod";
import { INVENTORY_CATEGORIES } from "@/lib/inventory-categories";
import { STOCK_LEVEL_VALUES } from "@/lib/inventory-stock";

// ================= STOCK REPORT =================
export const stockReportSchema = z.object({
    // A report covers exactly one property; its name and address head the PDF.
    propertyId: z.coerce
        .number({ invalid_type_error: "Select a property" })
        .int()
        .positive("Select a property"),
    category: z
        .string()
        .default("all")
        .refine(
            (value) => value === "all" || (INVENTORY_CATEGORIES as string[]).includes(value),
            "Invalid category",
        ),
    stock: z.enum(["all", ...STOCK_LEVEL_VALUES]).default("all"),
});

export type StockReportFilters = z.input<typeof stockReportSchema>;
