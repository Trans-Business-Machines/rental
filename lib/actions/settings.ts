"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/check-permissions";
import { revalidatePath } from "next/cache";
import { getDurationNights } from "@/lib/utils";
import type { UpdatePricingParams, CreatePricingParams } from "@/lib/types/types";


export async function getUnitTypePricings() {
    try {
        await requireRole(["superAdmin"]);

        const unitPricings = await prisma.unitTypePricing.findMany({
            orderBy: [{ unitType: "asc" }, { createdAt: "desc" }],
        });

        return unitPricings;
    } catch (error) {
        console.error("Error getting unit pricings: ", error);
        throw error;
    }
}

export async function createUnitTypePricing(data: CreatePricingParams) {
    try {
        await requireRole(["superAdmin"]);

        // One pricing per unit type and duration.
        const existingPricing = await prisma.unitTypePricing.findFirst({
            where: {
                unitType: data.unitType,
                duration: data.duration,
            },
        });

        if (existingPricing) {
            throw new Error(
                `Pricing for ${data.unitType} (${data.duration}) already exists. Use edit to update the price.`
            );
        }

        const pricing = await prisma.unitTypePricing.create({
            data: {
                unitType: data.unitType,
                duration: data.duration,
                price: data.price,
                nights: getDurationNights(data.duration),
                discountRate: data.discountRate || null,
                isActive: data.isActive ?? true,
            },
        });

        revalidatePath("/settings");
        revalidatePath("/properties");
        revalidatePath("/bookings");

        return pricing;
    } catch (error) {
        console.error("Error creating unit pricing: ", error);
        throw error;
    }
}

export async function updateUnitTypePricing(data: UpdatePricingParams) {
    try {
        await requireRole(["superAdmin"]);

        // Get existing pricing to determine duration
        const existing = await prisma.unitTypePricing.findUnique({
            where: { id: data.id },
        });

        if (!existing) {
            throw new Error("Pricing not found");
        }

        // Nights follow the duration, so only recompute when it changes.
        const nights = data.duration
            ? getDurationNights(data.duration)
            : existing.nights;

        const updatedPricing = await prisma.unitTypePricing.update({
            where: { id: data.id },
            data: {
                unitType: data.unitType,
                duration: data.duration,
                price: data.price,
                nights,
                discountRate: data.discountRate,
                isActive: data.isActive,
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

export async function deleteUnitTypePricing(id: number) {
    try {
        await requireRole(["superAdmin"]);

        await prisma.unitTypePricing.delete({
            where: { id },
        });

        revalidatePath("/settings");
        revalidatePath("/properties");
        revalidatePath("/bookings");

        return { success: true };
    } catch (error) {
        console.error("Error deleting unit pricing: ", error);
        throw error;
    }
}