"use client"

import { authClient } from "@/lib/auth-client"
import type { Role } from "@/lib/types/types"

export function usePermissions() {
    const { data: session, isPending } = authClient.useSession()
    const userRole = (session?.user?.role as Role) || "user"
    const currentUser = session?.user

    const isSuperAdmin = userRole === "superAdmin"
    const isAdmin = userRole === "admin"
    const isUser = userRole === "user"
    const isAgent = userRole === "agent"

    // Booking permissions
    const canCreateBooking = isAdmin || isSuperAdmin
    const canUpdateBooking = isAdmin || isSuperAdmin
    const canDeleteBooking = isSuperAdmin

    // Guest permissions
    const canCreateGuest = isAdmin || isSuperAdmin
    const canUpdateGuest = isAdmin || isSuperAdmin
    const canCheckOutGuest = isUser || isAdmin || isSuperAdmin
    const canDeleteGuest = isSuperAdmin

    // Property permissions
    const canCreateProperty = isAdmin || isSuperAdmin
    const canUpdateProperty = isAdmin || isSuperAdmin
    const canDeleteProperty = isSuperAdmin


    // Unit permissions
    const canCreateUnit = isAdmin || isSuperAdmin
    const canUpdateUnit = isAdmin || isSuperAdmin
    const canDeleteUnit = isSuperAdmin

    // Inventory permissions
    const canWorkWithInventory = isUser || isAdmin || isSuperAdmin

    return {
        role: userRole,
        isSessionPending: isPending,
        userId: session?.user.id,
        currentUser,
        isAgent,
        isSuperAdmin,
        isAdmin,
        isUser,
        canCreateBooking,
        canUpdateBooking,
        canDeleteBooking,
        canCreateGuest,
        canUpdateGuest,
        canCheckOutGuest,
        canDeleteGuest,
        canCreateProperty,
        canUpdateProperty,
        canDeleteProperty,
        canCreateUnit,
        canUpdateUnit,
        canDeleteUnit,
        canWorkWithInventory,
    }

}