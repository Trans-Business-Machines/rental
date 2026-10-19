"use server";

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { cache } from "react";
import { BUCKET } from "@/lib/utils";
import { extractFilePath, supabase } from "@/lib/services/MediaService"
import type { UnitDetailsResponse } from "@/lib/types/types"

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

		const pricings = await prisma.unitTypePricing.findMany({
			where: {
				unitType: unit.type
			}
		})

		return { ...unit, pricingOptions: pricings } as UnitDetailsResponse
	} catch (error) {
		console.error("An error occurred fetching unit details: ", error);
		throw error
	}
})

export const getUnitById = async (unitId: string, propertyId: string) => {

	const parsedUnitId = parseInt(unitId)
	const parsedPropertyId = parseInt(propertyId)

	if (isNaN(parsedPropertyId) || isNaN(parsedUnitId)) {
		notFound()
	}

	const unit = await prisma.unit.findUnique({
		where: {
			id: parsedUnitId,
			propertyId: parsedPropertyId
		},
		include: {
			property: true,
			media: true,
		}
	})

	if (!unit) {
		notFound()
	}

	const pricing = await prisma.unitTypePricing.findFirst({
		where: {
			unitType: unit.type
		}
	})

	return {
		...unit,
		pricingOptions: pricing ? [pricing] : []
	}
}

export async function deleteUnitImages(urls: string[]) {
	const filePaths = urls.map((url) => extractFilePath(url, "unit"));

	if (filePaths.length > 0) {
		const { error } = await supabase.storage
			.from(BUCKET)
			.remove(filePaths);

		if (error) {
			console.error("Failed to delete unit images from storage:", error);
			return { success: false, message: "Failed to delete images" };
		}

		return { success: true, message: "Images deleted successfully." };
	}

	return { success: false, message: "No images to delete" };
}