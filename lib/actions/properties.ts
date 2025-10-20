"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "../auth";

export async function getProperties() {
	try {
		const properties = await prisma.property.findMany({
			where: {
				deletedAt: null,
			},
			include: {
				tenants: true,
				amenities: true,
			},
			orderBy: {
				createdAt: "desc",
			},
			take: 6
		});
		return properties;
	} catch (error) {
		console.error("Error fetching properties:", error);
		throw new Error("Failed to fetch properties");
	}
}

export async function getPropertyById(id: number) {
	try {
		const property = await prisma.property.findUnique({
			where: {
				id,
				deletedAt: null,
			},
			include: {
				tenants: true,
				amenities: true,
			},
		});
		return property;
	} catch (error) {
		console.error("Error fetching property:", error);
		throw new Error("Failed to fetch property");
	}
}

export async function createProperty(data: {
	name: string;
	address: string;
	type: string;
	totalUnits?: number | null;
	rent: number;
	description: string;
	image: string;
}) {
	try {
		const property = await prisma.property.create({
			data: {
				...data,
				occupied: 0,
				status: "active",
			},
			include: {
				tenants: true,
				amenities: true,
				units: true,
			},
		});
		revalidatePath("/properties");
		return property;
	} catch (error) {
		console.error("Error creating property:", error);
		throw new Error("Failed to create property");
	}
}

export async function updateProperty(
	id: number,
	data: {
		name: string;
		address: string;
		type: string;
		totalUnits?: number | null;
		rent: number;
		description: string;
		image: string;
	}
) {
	try {
		const property = await prisma.property.update({
			where: { id },
			data,
			include: {
				tenants: true,
				amenities: true,
				units: true,
			},
		});
		revalidatePath("/properties");
		return property;
	} catch (error) {
		console.error("Error updating property:", error);
		throw new Error("Failed to update property");
	}
}

export async function deleteProperty(id: number) {
	try {
		await prisma.property.delete({
			where: { id },
		});
		revalidatePath("/properties");
	} catch (error) {
		console.error("Error deleting property:", error);
		throw new Error("Failed to delete property");
	}
}

export async function softDeleteProperty(id: number) {
	try {
		// Get the current session using cookies
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user || session.user.role !== "admin") {
			throw new Error("Unauthorized: Only admins can delete properties");
		}

		// Soft delete the property
		await prisma.property.update({
			where: { id },
			data: {
				deletedAt: new Date(),
			},
		});

		revalidatePath("/properties");
		return { success: true };
	} catch (error) {
		console.error("Error soft deleting property:", error);
		throw new Error("Failed to delete property");
	}
}

export async function searchProperties(query: string) {
	try {
		const properties = await prisma.property.findMany({
			where: {
				deletedAt: null,
				OR: [
					{
						name: {
							contains: query,
						},
					},
					{
						address: {
							contains: query,
						},
					},
				],
			},
			include: {
				tenants: true,
				amenities: true,
				units: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});
		return properties;
	} catch (error) {
		console.error("Error searching properties:", error);
		throw new Error("Failed to search properties");
	}
}

export async function getAllPropertiesWithUnits() {
	return prisma.property.findMany({
		where: {
			deletedAt: null,
		},
		include: { units: true },
		orderBy: { name: "asc" },
	});
}

export async function getPropertyStats() {
	try {
		const totalProperties = await prisma.property.count({
			where: { deletedAt: null },
		});
		const activeProperties = await prisma.property.count({
			where: {
				status: "active",
				deletedAt: null,
			},
		});

		// Get total units across all properties
		const propertiesWithUnits = await prisma.property.findMany({
			where: { deletedAt: null },
			include: {
				units: true,
			},
		});

		const totalUnits = propertiesWithUnits.reduce((sum, property) => {
			return sum + (property.totalUnits || property.units.length);
		}, 0);

		const occupiedUnits = propertiesWithUnits.reduce((sum, property) => {
			return sum + (property.occupied || 0);
		}, 0);

		return {
			total: totalProperties,
			active: activeProperties,
			totalUnits,
			occupiedUnits,
		};
	} catch (error) {
		console.error("Error fetching property stats:", error);
		return {
			total: 0,
			active: 0,
			totalUnits: 0,
			occupiedUnits: 0,
		};
	}
}

export async function getUpcomingCheckins(limit: number = 5) {
	try {
		const today = new Date();
		const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

		const upcomingBookings = await prisma.booking.findMany({
			where: {
				checkInDate: {
					gte: today,
					lte: nextWeek,
				},
				status: "confirmed",
			},
			include: {
				guest: true,
				property: true,
				unit: true,
			},
			orderBy: {
				checkInDate: "asc",
			},
			take: limit,
		});

		return upcomingBookings;
	} catch (error) {
		console.error("Error fetching upcoming check-ins:", error);
		return [];
	}
}
