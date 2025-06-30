"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getProperties() {
	try {
		const properties = await prisma.property.findMany({
			include: {
				tenants: true,
				amenities: true,
			},
			orderBy: {
				createdAt: "desc",
			},
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
			where: { id },
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

export async function searchProperties(query: string) {
	try {
		const properties = await prisma.property.findMany({
			where: {
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
		include: { units: true },
		orderBy: { name: "asc" },
	});
}
