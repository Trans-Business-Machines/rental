import { createAccessControl } from "better-auth/plugins/access";

// Define the statement object
export const statement = {
    booking: ["create", "read", "update", "delete", "restore"],
    guest: ["create", "read", "update", "delete", "restore"],
    property: ["create", "read", "update", "delete", "restore"],
    unit: ["create", "read", "update", "delete", "restore"],
    user: ["create", "read", "update", "delete", "ban", "setRole"],
} as const


//  Create the access controller instance
export const ac = createAccessControl(statement)

// Define user role and its permissions
export const user = ac.newRole({
    booking: ["read"],
    guest: ["read"],
    property: ["read"],
    unit: ["read"]
})

// Define the admin role and its permissions
export const admin = ac.newRole({
    booking: ["create", "read", "update"],
    guest: ["create", "read", "update"],
    property: ["create", "read", "update"],
    unit: ["create", "read", "update",],
    user: ["create", "read", "update", "ban",]
})

// Define the superAdmin role and its permissions
export const superAdmin = ac.newRole({
    booking: ["create", "read", "update", "delete", "restore"],
    guest: ["create", "read", "update", "delete", "restore"],
    property: ["create", "read", "update", "delete", "restore"],
    unit: ["create", "read", "update", "delete", "restore"],
    user: ["create", "read", "update", "delete", "ban", "setRole"],
})
