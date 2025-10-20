"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getUnits() {
	return prisma.unit.findMany({
		include: { property: true },
		orderBy: { createdAt: "desc" },
		take: 6
	});
}

export async function getUnitsByProperty(propertyId: number) {
	return prisma.unit.findMany({
		where: { propertyId },
		include: { property: true },
		orderBy: { createdAt: "desc" },
	});
}

export async function getUnitById(id: number) {
	return prisma.unit.findUnique({
		where: { id },
		include: { property: true },
	});
}

export async function createUnit(data: any) {
	const unit = await prisma.unit.create({ data });
	revalidatePath("/properties");
	revalidatePath("/dashboard");
	return unit;
}

export async function updateUnit(id: number, data: any) {
	const unit = await prisma.unit.update({ where: { id }, data });
	revalidatePath("/properties");
	revalidatePath("/dashboard");
	return unit;
}

export async function deleteUnit(id: number) {
	await prisma.unit.delete({ where: { id } });
	revalidatePath("/properties");
	revalidatePath("/dashboard");
}

export async function getUnitAvailability() {
	try {
		// Get all units with their properties and current bookings
		const units = await prisma.unit.findMany({
			include: {
				property: {
					select: { id: true, name: true, deletedAt: true },
				},
				bookings: {
					where: {
						AND: [
							{
								status: {
									in: ["confirmed", "checked_in"],
								},
							},
							{
								checkOutDate: {
									gte: new Date(), // Not yet checked out
								},
							},
						],
					},
					select: {
						id: true,
						checkOutDate: true,
						status: true,
						guest: {
							select: {
								firstName: true,
								lastName: true,
							},
						},
					},
					orderBy: {
						checkOutDate: "asc", // Get the earliest checkout date first
					},
				},
			},
			where: {
				property: {
					deletedAt: null, // Only active properties
				},
			},
			orderBy: [{ property: { name: "asc" } }, { name: "asc" }],
		});

		// Categorize units by availability
		const available: typeof units = [];
		const occupied: typeof units = [];
		const maintenance: typeof units = [];

		units.forEach((unit) => {
			if (unit.status === "maintenance") {
				maintenance.push(unit);
			} else if (unit.bookings.length > 0) {
				occupied.push(unit);
			} else {
				available.push(unit);
			}
		});

		return {
			total: units.length,
			available: available.length,
			occupied: occupied.length,
			maintenance: maintenance.length,
			availableUnits: available,
			occupiedUnits: occupied,
			maintenanceUnits: maintenance,
		};
	} catch (error) {
		console.error("Error fetching unit availability:", error);
		return {
			total: 0,
			available: 0,
			occupied: 0,
			maintenance: 0,
			availableUnits: [],
			occupiedUnits: [],
			maintenanceUnits: [],
		};
	}
}
