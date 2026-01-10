import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin as adminPlugin } from "better-auth/plugins";
import { prisma } from "./prisma";
import { sendPasswordResetEmail } from "./services/email"
import { ac, admin, superAdmin, user } from "@/lib/permissions"


export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
		disableSignUp: true,
		sendResetPassword: async ({ user, url }) => {
			await sendPasswordResetEmail({
				email: user.email,
				resetLink: url,
				name: user.name || "there",
			});
		},
	},
	plugins: [
		adminPlugin({
			ac,
			roles: {
				user,
				admin,
				superAdmin
			},
			defaultRole: "user",
		}),
	],
	trustedOrigins: [
		"https://rentalsmanager.app",
		"https://www.rentalsmanager.app",
		"https://rental-six-xi.vercel.app",
		"http://localhost:3000",
	]
});
