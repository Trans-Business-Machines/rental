"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/check-permissions";
import { revalidatePath } from "next/cache";
import { differenceInDays } from "date-fns";
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

        // Check if pricing already exists for this unit type and duration
        const existingPricing = await prisma.unitTypePricing.findFirst({
            where: {
                unitType: data.unitType,
                duration: data.duration,
                // For custom duration, also check date overlap
                ...(data.duration === "custom" && data.fromDate && data.toDate
                    ? {
                        OR: [
                            {
                                // New range starts within existing range
                                fromDate: { lte: data.fromDate },
                                toDate: { gte: data.fromDate },
                            },
                            {
                                // New range ends within existing range
                                fromDate: { lte: data.toDate },
                                toDate: { gte: data.toDate },
                            },
                            {
                                // New range completely contains existing range
                                fromDate: { gte: data.fromDate },
                                toDate: { lte: data.toDate },
                            },
                        ],
                    }
                    : {}),
            },
        });

        if (existingPricing) {
            if (data.duration === "custom") {
                throw new Error(
                    `A custom pricing for ${data.unitType} already exists with overlapping dates`
                );
            }
            throw new Error(
                `Pricing for ${data.unitType} (${data.duration}) already exists. Use edit to update the price.`
            );
        }

        // Calculate nights based on duration
        let nights: number | null = null;

        switch (data.duration) {
            case "one_night":
                nights = 1;
                break;
            case "weekly":
                nights = 7;
                break;
            case "monthly":
                nights = 30;
                break;
            case "custom":
                if (data.fromDate && data.toDate) {
                    nights = differenceInDays(data.toDate, data.fromDate);
                }
                break;
        }

        const pricing = await prisma.unitTypePricing.create({
            data: {
                unitType: data.unitType,
                duration: data.duration,
                price: data.price,
                nights,
                fromDate: data.duration === "custom" ? data.fromDate : null,
                toDate: data.duration === "custom" ? data.toDate : null,
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

        const duration = data.duration || existing.duration;

        // Calculate nights based on duration
        let nights: number | null = existing.nights;

        if (data.duration) {
            switch (data.duration) {
                case "one_night":
                    nights = 1;
                    break;
                case "weekly":
                    nights = 7;
                    break;
                case "monthly":
                    nights = 30;
                    break;
                case "custom":
                    if (data.fromDate && data.toDate) {
                        nights = differenceInDays(data.toDate, data.fromDate);
                    }
                    break;
            }
        } else if (duration === "custom" && data.fromDate && data.toDate) {
            nights = differenceInDays(data.toDate, data.fromDate);
        }

        const updatedPricing = await prisma.unitTypePricing.update({
            where: { id: data.id },
            data: {
                unitType: data.unitType,
                duration: data.duration,
                price: data.price,
                nights,
                fromDate: duration === "custom" ? data.fromDate : null,
                toDate: duration === "custom" ? data.toDate : null,
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