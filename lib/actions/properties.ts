"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "../auth";
import { unstable_cache } from "next/cache";

interface GetPropertiesParams {
	page?: number;
	search?: string;
}

export async function getProperties({
	page = 1,
	search = "",
}: GetPropertiesParams = {}) {
	try {
		const LIMIT = 3;

		const where = {
			// Exclude soft-deleted properties
			deletedAt: null,

			// Search by name, address, or description
			...(search && {
				OR: [
					{ name: { contains: search, mode: "insensitive" as const } },
					{ address: { contains: search, mode: "insensitive" as const } },
					{ description: { contains: search, mode: "insensitive" as const } },
				],
			}),
		};

		const [properties, totalProperties] = await Promise.all([
			prisma.property.findMany({
				where,
				include: {
					tenants: true,
					amenities: true,
					media: true,
				},
				orderBy: {
					createdAt: "desc",
				},
				take: LIMIT,
				skip: (page - 1) * LIMIT,
			}),
			prisma.property.count({ where }),
		]);

		const totalPages = Math.ceil(totalProperties / LIMIT) || 1;

		const hasNext = page < totalPages;
		const hasPrev = page > 1 && page <= totalPages;

		return {
			totalPages,
			properties,
			currentPage: page,
			hasNext,
			hasPrev,
		};
	} catch (error) {
		console.error("Error fetching properties:", error);
		return {
			totalPages: 0,
			properties: [],
			currentPage: 1,
			hasNext: false,
			hasPrev: false,
		};
	}
}

export const getCachedProperty = unstable_cache(
	async (propertyId: number) => {
		const property = await prisma.property.findUnique({
			where: { id: propertyId, deletedAt: null, },
			include: {
				tenants: true,
				amenities: true,
				media: true,
				_count: {
					select: {
						units: true
					}
				}

			},
		});

		const pricings = await prisma.unitTypePricing.findMany()


		return {
			property,
			pricings
		}
	},
	["property"],
	{
		revalidate: 60,
		tags: ["property"],
	}
)

export async function getPropertyNames() {
	try {
		const propertyNames = await prisma.property.findMany({
			where: {
				deletedAt: null
			},
			select: {
				name: true,
				id: true,
				units: {
					select: {
						id: true,
						name: true,

					},
					orderBy: {
						name: "asc"
					}
				}
			},
			orderBy: {
				name: "asc"
			}
		})

		return propertyNames

	} catch (error) {
		console.error("An Error occured while getting property names: ", error)
		return [];
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
				status: {
					in: ["pending", "reserved"]
				},
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
