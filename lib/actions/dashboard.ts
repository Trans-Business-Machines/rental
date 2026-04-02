"use server"

import { prisma } from "@/lib/prisma"
import { LIMIT } from "@/lib/utils"
import { getServerSession } from "@/lib/check-permissions"
import type { UnitStatus, BookingStatus, Role } from "@/lib/types/types";


interface GetRecentBookingsParams {
    page?: number;
    search?: string;
    status?: string;
}

interface GetUnitsParams {
    page?: number;
    search?: string;
    status?: string;
}

interface GetInventoryItemsParams {
    page?: number;
    search?: string;
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

export async function getUnits({
    page = 1,
    search = "",
    status = "all",
}: GetUnitsParams = {}) {

    const where = {
        // Search by unit name or property name
        ...(search && {
            OR: [
                { name: { contains: search, mode: "insensitive" as const } },
                { property: { name: { contains: search, mode: "insensitive" as const } } },
            ],
        }),

        // Status filter
        ...(status !== "all" && {
            status: status as UnitStatus,
        }),
    };

    const [units, totalUnits] = await Promise.all([
        prisma.unit.findMany({
            where,
            include: {
                property: true,
                bookings: {
                    where: {
                        OR: [

                            { status: "checked_in" },

                            {
                                status: { in: ["pending", "reserved"] },
                            },
                        ],
                    },
                    include: {
                        guest: true,
                    },
                    take: 1,
                    orderBy: {
                        checkInDate: "asc",
                    },
                },
            },
            take: LIMIT,
            skip: (page - 1) * LIMIT,
            orderBy: {
                createdAt: "asc",
            },
        }),
        prisma.unit.count({ where }),
    ]);

    const totalPages = Math.ceil(totalUnits / LIMIT) || 1;

    const hasNext = page < totalPages;
    const hasPrev = page > 1 && page <= totalPages;

    return {
        totalPages,
        units,
        currentPage: page,
        hasNext,
        hasPrev,
    };
}

export async function getRecentBookings(
    {
        page = 1,
        search = "",
        status = "all",
    }: GetRecentBookingsParams = {}) {

    const session = await getServerSession();
    const user = session?.user

    if (!user) {
        throw new Error("Unauthorized: Login required");
    }

    const userRole = user?.role as Role;

    const where = {
        // if agent, include own bookings
        ...(userRole === "agent" && {
            requestedById: user.id
        }),

        // Search by guest name, property name, or unit name
        ...(search && {
            OR: [
                { guest: { firstName: { contains: search, mode: "insensitive" as const } } },
                { guest: { lastName: { contains: search, mode: "insensitive" as const } } },
                { property: { name: { contains: search, mode: "insensitive" as const } } },
                { unit: { name: { contains: search, mode: "insensitive" as const } } },
            ],
        }),

        // Status filter
        ...(status !== "all" && {
            status: status as BookingStatus,
        }),
    };

    const [recentBookings, totalBookings] = await Promise.all([
        prisma.booking.findMany({
            where,
            include: {
                guest: true,
                property: true,
                unit: true,
                requestedBy: {
                    select: {
                        name: true
                    }
                },
                approvedBy: {
                    select: {
                        name: true
                    }
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            take: LIMIT,
            skip: (page - 1) * LIMIT,
        }),
        prisma.booking.count({ where }),
    ]);

    const totalPages = Math.ceil(totalBookings / LIMIT) || 1;

    const hasNext = page < totalPages;
    const hasPrev = page > 1 && page <= totalPages;

    return {
        recentBookings,
        totalPages,
        currentPage: page,
        hasNext,
        hasPrev,
    };
}



export async function getInventoryItems({
    page = 1,
    search = "",
}: GetInventoryItemsParams = {}) {
    const where = {
        // Search by item name
        ...(search && {
            itemName: { contains: search, mode: "insensitive" as const },
        }),
    };

    const [items, totalItems] = await Promise.all([
        prisma.inventoryItem.findMany({
            where,
            include: {
                assignments: {
                    where: {
                        isActive: true,
                    },
                    select: {
                        id: true,
                        unit: { select: { id: true, name: true } },
                        property: { select: { id: true, name: true } },
                        assignedAt: true,
                        serialNumber: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            take: LIMIT,
            skip: (page - 1) * LIMIT,
        }),
        prisma.inventoryItem.count({ where }),
    ]);

    // Add availability info to each item
    const inventoryItems = items.map((item) => ({
        ...item,
        availableQuantity: item.quantity, // Store quantity is available quantity
        assignedQuantity: item.assignments.length, // Count of active assignments
        isAvailable: item.quantity > 0, // Can be assigned if quantity > 0
    }));

    const totalPages = Math.ceil(totalItems / LIMIT) || 1;

    const hasNext = page < totalPages;
    const hasPrev = page > 1 && page <= totalPages;

    return {
        totalPages,
        inventoryItems,
        currentPage: page,
        hasPrev,
        hasNext,
    };
}

