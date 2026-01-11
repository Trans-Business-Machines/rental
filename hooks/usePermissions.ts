"use client"

import { authClient } from "@/lib/auth-client"
import type { Role } from "@/lib/types/types"

export function usePermissions() {
    const { data: session } = authClient.useSession()
    const userRole = (session?.user?.role as Role) || "user"

    const isSuperAdmin = userRole === "superAdmin"
    const isAdmin = userRole === "admin"
    const isUser = userRole === "user"

    // Booking permissions
    const canCreateBooking = isAdmin || isSuperAdmin
    const canUpdateBooking = isAdmin || isSuperAdmin
    const canDeleteBooking = isSuperAdmin

    // Guest permissions
    const canCreateGuest = isAdmin || isSuperAdmin
    const canUpdateGuest = isAdmin || isSuperAdmin
    const canDeleteGuest = isSuperAdmin

    // Property permissions
    const canCreateProperty = isAdmin || isSuperAdmin
    const canUpdateProperty = isAdmin || isSuperAdmin
    const canDeleteProperty = isSuperAdmin


    // Unit permissions
    const canCreateUnit = isAdmin || isSuperAdmin
    const canUpdateUnit = isAdmin || isSuperAdmin
    const canDeleteUnit = isSuperAdmin

    // Check specific permission of the current session user
    const checkPermission = async (resource: string, action: string): Promise<boolean> => {

        if (!session?.user?.id) return false

        try {
            const { data } = await authClient.admin.hasPermission({
                permission: {
                    [resource]: action
                }
            })

            return data?.success || false
        } catch {
            return false
        }
    }

    return {
        role: userRole,
        isSuperAdmin,
        isAdmin,
        isUser,
        canCreateBooking,
        canUpdateBooking,
        canDeleteBooking,
        canCreateGuest,
        canUpdateGuest,
        canDeleteGuest,
        canCreateProperty,
        canUpdateProperty,
        canDeleteProperty,
        canCreateUnit,
        canUpdateUnit,
        canDeleteUnit,
        checkPermission
    }

}