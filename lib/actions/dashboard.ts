"use server"

import { prisma } from "@/lib/prisma"

export async function getDashboardData() {
    // Get all units with their current bookings to determine status
    const units = await prisma.unit.findMany({
        include: {
            property: true,
            bookings: {
                where: {
                    status: "confirmed",
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
        take: 6,
    });

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
        take: 6,
    });

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
            itemName: "asc",
        },
        take: 6,
    });

    // Calculate monthly revenue from current month bookings
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const monthlyBookings = await prisma.booking.findMany({
        where: {
            createdAt: {
                gte: currentMonth,
                lt: nextMonth,
            },
        },
    });

    const monthlyRevenue = monthlyBookings.reduce(
        (sum, booking) => sum + booking.totalAmount,
        0
    );

    return {
        units,
        recentBookings,
        inventoryItems,
        monthlyRevenue,
    };
}

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