"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createAdminUser(formData: FormData) {
	try {
		const name = formData.get("name") as string;
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;

		if (!name || !email || !password) {
			return {
				success: false,
				error: "Name, email, and password are required",
			};
		}

		// Validate password strength
		if (password.length < 8) {
			return {
				success: false,
				error: "Password must be at least 8 characters long",
			};
		}

		// Safety check: Ensure no users exist before creating admin
		const userCount = await prisma.user.count();
		if (userCount > 0) {
			return {
				success: false,
				error: "Admin account already exists. Setup is only allowed for the first user.",
			};
		}

		// Create the first admin user using the admin plugin
		await auth.api.createUser({
			body: {
				name,
				email,
				password,
				role: "admin",
				data: {
					emailVerified: true,
				},
			},
		});

		revalidatePath("/login");

		return {
			success: true,
			message: "Admin account created successfully",
		};
	} catch (error) {
		console.error("Error creating admin user:", error);
		return {
			success: false,
			error: "Failed to create admin account",
		};
	}
}
