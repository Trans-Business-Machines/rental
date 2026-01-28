import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

// Define the statement object
export const statement = {
    ...defaultStatements,
    booking: ["create", "read", "update", "delete", "restore"],
    guest: ["create", "read", "update", "delete", "restore", "check-out"],
    property: ["create", "read", "update", "delete", "restore"],
    unit: ["create", "read", "update", "delete", "restore"],
} as const


//  Create the access controller instance
export const ac = createAccessControl(statement)

// Define user role and its permissions
export const user = ac.newRole({
    booking: ["read"],
    guest: ["read"],
    property: ["read"],
    unit: ["read"],
    user: ["set-password"]
})

// Define the admin role and its permissions
export const admin = ac.newRole({
    booking: ["create", "read", "update"],
    guest: ["create", "read", "update", "check-out"],
    property: ["create", "read", "update"],
    unit: ["create", "read", "update",],
    ...adminAc.statements,
})

// Define the superAdmin role and its permissions
export const superAdmin = ac.newRole({
    booking: ["create", "read", "update", "delete", "restore"],
    guest: ["create", "read", "update", "delete", "restore", "check-out"],
    property: ["create", "read", "update", "delete", "restore"],
    unit: ["create", "read", "update", "delete", "restore"],
    ...adminAc.statements,
})
