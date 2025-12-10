"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"


export async function getDashboardStats() {
    // count all units in the DB
    const totalUnits = await prisma.unit.count()

    // Get all occupied units from DB
    const occupiedUnits = await prisma.unit.count({
        where: {
            status: "occupied"
        }
    })

    // Get all available units from DB
    const availableUnits = await prisma.unit.count({
        where: {
            status: "available"
        }
    })


    // Get all units under maintenance from DB
    const maintenanceUnits = await prisma.unit.count({
        where: {
            status: "maintenance"
        }
    })

    return {
        total: totalUnits,
        occupied: occupiedUnits,
        available: availableUnits,
        maintenance: maintenanceUnits
    };
}

export async function getUnits(page: number = 1) {
    // Define the limit for each Unit Page
    const LIMIT = 6;

    // Get all units with their current bookings to determine status
    const units = await prisma.unit.findMany({
        include: {
            property: true,
            bookings: {
                where: {
                    status: {
                        in: ["pending", "reserved", "checked_in"]
                    },
                    checkOutDate: {
                        gte: new Date(),
                    },
                },
                include: {
                    guest: true,

                },
                take: 1,
                orderBy: {
                    checkOutDate: "asc",
                },
            },
        },
        take: LIMIT,
        skip: (page - 1) * LIMIT
    });

    // count how many units there in the DB
    const totalUnits = await prisma.unit.count();
    const totlaPages = Math.ceil(totalUnits / LIMIT);

    // Determine whether there are previous and next pages
    const hasNext = page < totlaPages;
    const hasPrev = page > 1 && page <= totlaPages

    return {
        totlaPages,
        units,
        currentPage: page,
        hasNext,
        hasPrev
    }
}

export async function getRecentBookings(page: number = 1) {
    // Define the limit for each Bokkings Page
    const LIMIT = 6;

    // Get recent bookings
    const recentBookings = await prisma.booking.findMany({
        include: {
            guest: true,
            property: true,
            unit: true,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: LIMIT,
        skip: (page - 1) * LIMIT
    });

    // Calculate the total pages for booking.
    const totalBookings = await prisma.booking.count();
    const totalPages = Math.ceil(totalBookings / LIMIT)

    // Get hasNext and hasPrev attributes
    const hasNext = page < totalPages;
    const hasPrev = page > 1 && page <= totalPages;

    return {
        totalPages,
        recentBookings,
        hasPrev,
        hasNext
    }
}

export async function getInventoryItems(page: number = 1) {
    // Define the limit for each Unit Page
    const LIMIT = 6;

    // Get inventory items
    const inventoryItems = await prisma.inventoryItem.findMany({
        include: {
            assignments: {
                where: {
                    isActive: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc"
        },
        take: LIMIT,
        skip: (page - 1) * LIMIT
    });

    // Count items and get the number of pages
    const totalItems = await prisma.inventoryItem.count();
    const totalPages = Math.ceil(totalItems / LIMIT);

    // Get hasNext and hasPrev attributes
    const hasNext = page < totalPages;
    const hasPrev = page > 1 && page <= totalPages;

    return {
        totalPages,
        inventoryItems,
        hasPrev,
        hasNext
    }
}

export async function updateUnitStatus(
    unitId: number, data: { rent: number }
) {
    try {

        const result = await prisma.unit.update({
            where: {
                id: unitId
            },
            data
        })

        if (!result) {
            throw new Error("Could not update unit with id " + unitId)
        }

        revalidatePath("/dashboard");
        return result

    } catch (error) {
        console.error("Error updating unit rent and status: ", error);
        return null;
    }

}