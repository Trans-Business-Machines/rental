"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/check-permissions";
import { revalidatePath } from "next/cache";
import type { UpdatePricingParams } from "@/lib/types/types";

export async function getUnitTypePricings() {
    try {
        await requireRole(["superAdmin"]);

        const unitPricings = await prisma.unitTypePricing.findMany({
            orderBy: [{ unitType: "asc" }, { price: "asc" }],
        });

        return unitPricings;
    } catch (error) {
        console.error("Error getting unit pricings: ", error);
        throw error;
    }
}


export async function updateUnitTypePricing({
    id,
    duration,
    price,
    nights,
}: UpdatePricingParams) {
    try {
        await requireRole(["superAdmin"]);

        const updatedPricing = await prisma.unitTypePricing.update({
            where: { id },
            data: {
                duration,
                price,
                nights,
            },
        });

        revalidatePath("/settings");
        revalidatePath("/properties");
        revalidatePath("/bookings");

        return updatedPricing;
    } catch (error) {
        console.error("Error updating unit pricing: ", error);
        throw error;
    }
}