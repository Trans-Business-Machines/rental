import { auth } from "./auth"
import { headers } from "next/headers"
import type { Role } from "@/lib/types/types"


export async function getServerSession() {
	const session = await auth.api.getSession({
		headers: await headers()
	})

	return session
}

export async function checkServerPermission(resource: string, action: string) {
	const session = await getServerSession()

	if (!session?.user?.id) {
		return false
	}

	try {
		const { success } = await auth.api.userHasPermission({
			headers: await headers(),
			body: {
				permissions: {
					[resource]: [action]
				}
			}
		})


		return success || false

	} catch {

		return false
	}
}

export async function requirePermission(resource: string, action: string) {
	const hasPermission = await checkServerPermission(resource, action)

	if (!hasPermission) {
		throw new Error("Unauthorized: Insufficent permissions.")
	}

}

export async function requireRole(allowedRoles: Role[]) {
	const session = await getServerSession();
	const userRole = (session?.user?.role as Role) || "user"

	if (!allowedRoles.includes(userRole)) {
		throw new Error("Unauthorized: Insufficent role.")
	}

}