"use server"

import { prisma } from "@/lib/prisma"

export async function getUserStats() {
    try {
        const totalUsers = await prisma.user.count()
        const adminUsers = await prisma.user.count({
            where: {
                role: "admin"
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
