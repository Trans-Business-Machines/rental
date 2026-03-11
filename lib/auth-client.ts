import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { toast } from "sonner";
import { ac, admin, superAdmin, user, marketer, } from "@/lib/permissions"

export const authClient = createAuthClient({
	plugins: [adminClient({
		ac,
		roles: {
			user,
			admin,
			superAdmin,
			marketer
		}
	})],
	fetchOptions: {
		onError(e) {
			if (e.error.status === 429) {
				toast.error("Too many requests. Please try again later.");
			}
		},
	},
});