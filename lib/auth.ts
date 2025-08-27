import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { prisma } from "./prisma";
import resend from "./emailClient";

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
		disableSignUp: true,
	},
	sendResetPassword: async ({ user, url, token }, request) => {
		await sendResetPasswordEmail();
	},
	plugins: [
		admin({
			defaultRole: "admin", // First user will be admin
		}),
	],
});
