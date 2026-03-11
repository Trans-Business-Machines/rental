import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

// Define the statement object
export const statement = {
    ...defaultStatements,
    booking: ["create", "read", "update", "delete", "restore"],
    guest: ["create", "read", "update", "delete", "restore", "check-out"],
    property: ["create", "read", "update", "delete", "restore"],
    unit: ["create", "read", "update", "delete", "restore"],
    settings: ["create", "read", "update", "delete"]
} as const


//  Create the access controller instance
export const ac = createAccessControl(statement)

// Define user role and its permissions
export const user = ac.newRole({
    user: ["set-password"],
    booking: ["create", "read", "update"],
    guest: ["create", "read", "update", "check-out"],
    property: ["create", "read", "update"],
    unit: ["create", "read", "update",],
})

// Define marketer role and its permissions
export const marketer = ac.newRole({
    user: ["set-password"],
    booking: ["create", "read"],
    guest: ["read"],
    property: ["read"],
    unit: ["read"],
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
    ...adminAc.statements,
    booking: ["create", "read", "update", "delete", "restore"],
    guest: ["create", "read", "update", "delete", "restore", "check-out"],
    property: ["create", "read", "update", "delete", "restore"],
    unit: ["create", "read", "update", "delete", "restore"],
    settings: ["create", "read", "update", "delete"],
})
