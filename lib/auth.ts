import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { prisma } from "./prisma";
import { sendPasswordResetEmail } from "./services/email"

export const runtime = "nodejs";

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
				name: user.name || undefined,
			});
		},
	},
	plugins: [
		admin({
			defaultRole: "admin",
		}),
	],
});
