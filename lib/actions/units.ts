"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { cache } from "react"
import { unstable_cache } from "next/cache";
import type { UnitDetailsResponse } from "@/lib/types/types"

export async function getUnits() {
	return prisma.unit.findMany({
		include: { property: true },
		orderBy: { createdAt: "desc" },
		take: 6
	});
}

export async function updateUnit(id: number, data: any) {
	const unit = await prisma.unit.update({ where: { id }, data });
	revalidatePath("/properties");
	revalidatePath("/dashboard");
	return unit;
}

export const getUnitDetails = cache(async (unitId: string, propertyId: string) => {
	try {
		// validate the inputs
		const parsedUnitId = Number(unitId);
		const parsedPropertyId = Number(propertyId);

		if (isNaN(parsedPropertyId) || isNaN(parsedUnitId)) {
			notFound()
		}

		// Fetch the unit details and the necessary data
		const unit = await prisma.unit.findUnique({
			where: {
				id: parsedUnitId,
				propertyId: parsedPropertyId
			},
			include: {
				property: {
					select: {
						id: true,
						name: true
					}
				},
				media: {
					select: {
						id: true,
						filename: true,
						filePath: true,
						originalName: true
					}
				},
				assignments: {
					where: {
						isActive: true,
					},
					take: 5,
					orderBy: {
						assignedAt: "desc"
					},
					select: {
						id: true,
						isActive: true,
						assignedAt: true,
						returnedAt: true,
						inventoryItem: {
							select: {
								id: true,
								itemName: true,
								category: true
							}
						}
					}

				},
				bookings: {
					take: 5,
					orderBy: {
						checkInDate: "desc"
					},
					select: {
						id: true,
						checkInDate: true,
						checkOutDate: true,
						status: true,
						guest: {
							select: {
								firstName: true,
								lastName: true,
								email: true,
								phone: true,
							}
						}
					}
				}
			}
		})

		if (!unit) {
			notFound()
		}

		return unit as UnitDetailsResponse
	} catch (error) {
		console.error("An error occurred fetching unit details: ", error);
		throw error
	}

})

export const getCachedUnitById = unstable_cache(
	async (unitId: number, propertyId: number) => {
		return await prisma.unit.findUnique({
			where: {
				id: unitId,
				propertyId
			},
			include: {
				property: true,
				media: true,
			}
		})

	}, ["unit"],
	{
		revalidate: 3600,
		tags: ["unit"],
	})