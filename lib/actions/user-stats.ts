"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "@/lib/check-permissions"

const LIMIT = 6;

interface GetUsersParams {
    page?: number;
    search?: string;
    role?: string;
    status?: string;
}

export async function getUserStats() {
    try {
        const totalUsers = await prisma.user.count()
        const adminUsers = await prisma.user.count({
            where: {
                role: {
                    in: ["admin", "superAdmin"]
                }
            }
        })

        const regularUsers = await prisma.user.count({
            where: {
                role: "user"
            }
        })

        const bannedUsers = await prisma.user.count({
            where: {
                banned: true
            }
        })

        return {
            total: totalUsers,
            admins: adminUsers,
            regular: regularUsers,
            banned: bannedUsers
        }

    } catch (error) {
        if (error instanceof Error) {
            console.error("An error occured while getting user stats: ", error)
            return {
                total: 0,
                admins: 0,
                regular: 0,
                banned: 0
            }
        } else {
            console.error("An unknown error occured: ", error)
            return {
                total: 0,
                admins: 0,
                regular: 0,
                banned: 0
            }
        }
    }
}

export async function getUsers({
    page = 1,
    search = "",
    role = "all",
    status = "all",
}: GetUsersParams = {}) {
    try {
        const session = await getServerSession();

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        const currentUserId = session.user.id;
        const currentUserRole = session.user.role;

        // Build where clause
        const where = {
            // Always exclude current user
            id: { not: currentUserId },

            // Admin can only see users with "user" role
            ...(currentUserRole === "admin" && {
                role: {
                    in: ["user"]
                },
            }),

            // Search by name or email
            ...(search && {
                OR: [
                    { name: { contains: search, mode: "insensitive" as const } },
                    { email: { contains: search, mode: "insensitive" as const } },
                ],
            }),

            // Role filter (only for superAdmin)
            ...(role !== "all" &&
                currentUserRole === "superAdmin" && {
                role: role,
            }),

            // Status filter
            ...(status === "banned" && { banned: true }),
            ...(status === "active" && { banned: false }),
        };

        const [users, totalUsers] = await Promise.all([
            prisma.user.findMany({
                where,
                orderBy: {
                    createdAt: "desc",
                },
                take: LIMIT,
                skip: (page - 1) * LIMIT,
            }),
            prisma.user.count({ where }),
        ]);

        const totalPages = Math.ceil(totalUsers / LIMIT) || 1;

        const hasNext = page < totalPages;
        const hasPrev = page > 1 && page <= totalPages;

        return {
            users,
            totalPages,
            currentPage: page,
            hasNext,
            hasPrev,
        };
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }

}