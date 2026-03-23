"use server"

import { prisma } from "@/lib/prisma"
import type { PriceDuration } from "@/lib/types/types"

const pricingData = [
    // 1 Bedroom Pricing
    {
        unitType: "1 bedroom",
        duration: "one_night" as PriceDuration,
        price: 9000,
        nights: 1,
        discountRate: null,
    },
    {
        unitType: "1 bedroom",
        duration: "weekly" as PriceDuration,
        price: 45000,
        nights: 7,
        discountRate: 0.1, // 10% off
    },
    {
        unitType: "1 bedroom",
        duration: "monthly" as PriceDuration,
        price: 150000,
        nights: 30,
        discountRate: 0.15, // 15% off
    },
    // 2 Bedroom Pricing
    {
        unitType: "2 bedroom",
        duration: "one_night" as PriceDuration,
        price: 12000,
        nights: 1,
        discountRate: null,
    },
    {
        unitType: "2 bedroom",
        duration: "weekly" as PriceDuration,
        price: 60000,
        nights: 7,
        discountRate: 0.1, // 10% off
    },
    {
        unitType: "2 bedroom",
        duration: "monthly" as PriceDuration,
        price: 200000,
        nights: 30,
        discountRate: 0.15, // 15% off
    },
]


async function main() {
    console.log("Seeding unit type pricing...")

    for (const pricing of pricingData) {
        await prisma.unitTypePricing.create({
            data: {
                unitType: pricing.unitType,
                duration: pricing.duration,
                price: pricing.price,
                nights: pricing.nights,
                discountRate: pricing.discountRate,
                isActive: true,
            }

        })
    }

    console.log("Seeding completed!");
}


main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

