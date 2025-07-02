import { authClient } from "@/lib/auth-client";

export function useRoles() {
	const { data: session } = authClient.useSession();

	const roles = session?.user?.role ? [session.user.role] : [];

	const has = (requiredRoles: string | string[]) => {
		if (!session?.user?.role) return false;

		const requiredRolesArray = Array.isArray(requiredRoles)
			? requiredRoles
			: [requiredRoles];
		return requiredRolesArray.includes(session.user.role);
	};

	return {
		roles,
		has,
		isLoading: session === undefined,
	};
}
