"use server";

import { prisma } from "@/lib/prisma";

export async function getAllPricing() {
  try {
    const pricings = await prisma.unitTypePricing.findMany({
      where: { isActive: true },
      orderBy: [{ unitType: "asc" }, { duration: "asc" }],
    });

    return pricings;
  } catch (error) {
    console.error("Error getting all pricing: ", error);
    throw error;
  }
}

export async function getPricingByUnitType(unitType: string) {
  try {
    const pricings = await prisma.unitTypePricing.findMany({
      where: {
        unitType,
        isActive: true,
      },
      orderBy: { duration: "asc" },
    });

    return pricings;
  } catch (error) {
    console.error("Error getting pricing by unit type: ", error);
    throw error;
  }
}

export async function getUnitPricingOptions(unitId: number) {
  try {
    // Get unit to determine its type
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      select: { type: true },
    });

    if (!unit) {
      throw new Error("Unit not found");
    }

    // Get all active pricing for this unit type
    const pricings = await prisma.unitTypePricing.findMany({
      where: {
        unitType: unit.type,
        isActive: true,
      },
      orderBy: { duration: "asc" },
    });

    return pricings;
  } catch (error) {
    console.error("Error getting unit pricing options: ", error);
    throw error;
  }
}

export async function getPricingById(id: number) {
  try {
    const pricing = await prisma.unitTypePricing.findUnique({
      where: { id },
    });

    return pricing;
  } catch (error) {
    console.error("Error getting pricing by id: ", error);
    throw error;
  }
}