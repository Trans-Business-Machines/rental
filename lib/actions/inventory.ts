"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getInventoryItems() {
	try {
		const items = await prisma.inventoryItem.findMany({
			include: {
				property: true,
				unit: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});
		return items;
	} catch (error) {
		console.error("Error fetching inventory items:", error);
		throw new Error("Failed to fetch inventory items");
	}
}

export async function getInventoryItemById(id: number) {
	try {
		const item = await prisma.inventoryItem.findUnique({
			where: { id },
			include: {
				property: true,
				unit: true,
			},
		});
		return item;
	} catch (error) {
		console.error("Error fetching inventory item:", error);
		throw new Error("Failed to fetch inventory item");
	}
}

export async function createInventoryItem(data: {
	propertyId: number;
	unitId: number;
	category: string;
	itemName: string;
	description: string;
	quantity: number;
	condition: string;
	purchaseDate: Date;
	purchasePrice: number;
	currentValue: number;
	location: string;
	serialNumber?: string;
	supplier?: string;
	warrantyExpiry?: Date;
	notes?: string;
}) {
	try {
		const item = await prisma.inventoryItem.create({
			data: {
				...data,
				status: "active",
				lastInspected: new Date(),
			},
			include: {
				property: true,
				unit: true,
			},
		});
		revalidatePath("/inventory");
		return item;
	} catch (error) {
		console.error("Error creating inventory item:", error);
		throw new Error("Failed to create inventory item");
	}
}

export async function updateInventoryItem(
	id: number,
	data: {
		propertyId: number;
		unitId: number;
		category: string;
		itemName: string;
		description: string;
		quantity: number;
		condition: string;
		purchaseDate: Date;
		purchasePrice: number;
		currentValue: number;
		location: string;
		serialNumber?: string;
		supplier?: string;
		warrantyExpiry?: Date;
		status: string;
		notes?: string;
	}
) {
	try {
		const item = await prisma.inventoryItem.update({
			where: { id },
			data,
			include: {
				property: true,
				unit: true,
			},
		});
		revalidatePath("/inventory");
		return item;
	} catch (error) {
		console.error("Error updating inventory item:", error);
		throw new Error("Failed to update inventory item");
	}
}

export async function deleteInventoryItem(id: number) {
	try {
		await prisma.inventoryItem.delete({
			where: { id },
		});
		revalidatePath("/inventory");
	} catch (error) {
		console.error("Error deleting inventory item:", error);
		throw new Error("Failed to delete inventory item");
	}
}

export async function searchInventoryItems(query: string) {
	try {
		const items = await prisma.inventoryItem.findMany({
			where: {
				OR: [
					{
						itemName: {
							contains: query,
						},
					},
					{
						description: {
							contains: query,
						},
					},
					{
						property: {
							name: {
								contains: query,
							},
						},
					},
					{
						unit: {
							name: {
								contains: query,
							},
						},
					},
				],
			},
			include: {
				property: true,
				unit: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});
		return items;
	} catch (error) {
		console.error("Error searching inventory items:", error);
		throw new Error("Failed to search inventory items");
	}
}

export async function getInventoryByProperty(propertyId: number) {
	try {
		const items = await prisma.inventoryItem.findMany({
			where: { propertyId },
			include: {
				property: true,
				unit: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});
		return items;
	} catch (error) {
		console.error("Error fetching inventory by property:", error);
		throw new Error("Failed to fetch inventory by property");
	}
}

export async function getInventoryByUnit(unitId: number) {
	try {
		const items = await prisma.inventoryItem.findMany({
			where: { unitId },
			include: {
				property: true,
				unit: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});
		return items;
	} catch (error) {
		console.error("Error fetching inventory by unit:", error);
		throw new Error("Failed to fetch inventory by unit");
	}
}
