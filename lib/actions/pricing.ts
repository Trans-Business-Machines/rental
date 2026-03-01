"use server"

import { prisma } from "@/lib/prisma"

export async function getUnitPricingOptions(unitId: number) {
    
  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    select: { type: true },
  });

  if (!unit) {
    throw new Error("Unit not found");
  }

  const pricingOptions = await prisma.unitTypePricing.findMany({
    where: { unitType: unit.type },
    orderBy: { price: "asc" },
  });

  return pricingOptions;
}