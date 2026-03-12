"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { requirePermission } from "@/lib/check-permissions"
import { LIMIT } from "@/lib/utils"
import type { GuestUpdateFormData, CreateNewGuest } from "@/lib/types/types"

interface GetGuestsParams {
	page?: number;
	search?: string;
	status?: string;
}

export async function getGuests({
	page = 1,
	search = "",
	status = "all",
}: GetGuestsParams = {}) {
	const where = {
		// Exclude soft-deleted guests
		deletedAt: null,

		// Search by first name, last name, email, or phone
		...(search && {
			OR: [
				{ firstName: { contains: search, mode: "insensitive" as const } },
				{ lastName: { contains: search, mode: "insensitive" as const } },
				{ email: { contains: search, mode: "insensitive" as const } },
				{ phone: { contains: search, mode: "insensitive" as const } },
			],
		}),

		// Status filter (verified, pending, blacklisted)
		...(status !== "all" && {
			verificationStatus: status,
		}),
	};

	const [guests, totalGuests] = await Promise.all([
		prisma.guest.findMany({
			where,
			include: {
				bookings: {
					select: {
						id: true,
						status: true,
					},
					orderBy: {
						createdAt: "desc",
					},
					take: 1,
				},
			},
			orderBy: { createdAt: "desc" },
			take: LIMIT,
			skip: (page - 1) * LIMIT,
		}),
		prisma.guest.count({ where }),
	]);

	const totalPages = Math.ceil(totalGuests / LIMIT) || 1;

	const hasNext = page < totalPages;
	const hasPrev = page > 1 && page <= totalPages;

	return {
		totalPages,
		guests,
		currentPage: page,
		hasNext,
		hasPrev,
	};
}

export async function getGuestById(id: number) {
	return prisma.guest.findUnique({
		where: { id, deletedAt: null }, 
		include: {
			media:true,
			bookings: {
				select: {
					id: true,
					status: true,
				},
				orderBy: {
					createdAt: "desc"
				},
				take: 1
			}
		},
	});
}

export async function getSoftDeletedGuests() {
	try {
		const archivedGuests = await prisma.guest.findMany({
			where: {
				deletedAt: {
					not: null
				}
			}
		})

		return archivedGuests
	} catch (error) {
		throw error
	}

}

export async function createGuest(data: CreateNewGuest) {
	// Confirm that the current session user has permission to create a guest
	await requirePermission("guest", "create");

	const { idDocument, ...guestData } = data;

	// Create guest with optional ID document in a transaction
	const guest = await prisma.guest.create({
		data: {
			...guestData,
			// Create media record if ID document was uploaded
			...(idDocument && {
				media: {
					create: {
						filename: idDocument.filename,
						originalName: idDocument.originalName,
						fileSize: idDocument.fileSize,
						mimeType: idDocument.mimeType,
						filePath: idDocument.filePath,
					},
				},
			}),
		},
		include: {
			media: true,
		},
	});

	revalidatePath("/guests");

	return guest;
}

export async function updateGuest(id: number, data: GuestUpdateFormData) {
	try {

		await requirePermission("guest", "update")

		const updatedGuest = await prisma.guest.update({ where: { id }, data });

		// check if the updatedGuest has been verified
		if (updatedGuest.verificationStatus === "verified") {
			revalidateTag("booking-form-data")
		}

		// revalidate the guests page
		revalidatePath("/guests");
		return updatedGuest;
	} catch (error) {
		console.error("Failed to update guest: ", error)
		throw new Error("Failed to update guest")
	}
}

export async function softDeleteGuest(id: number) {
	try {

		// confirm that the current session user can soft delete booking
		await requirePermission("guest", "update")

		await prisma.guest.update({
			where: {
				id
			},
			data: {
				deletedAt: new Date()
			}
		})

		revalidateTag("booking-form-data");
		revalidatePath("/guests");


		return {
			success: true,
		}


	} catch (error) {
		console.error("Error soft deleting guest:", error);
		throw error
	}

}

export async function deleteGuest(id: number) {
	try {
		await requirePermission("guest", "delete")

		await prisma.guest.delete({ where: { id } });

		revalidateTag("booking-form-data");
		revalidatePath("/guests");

	} catch (error) {
		console.error("Failed to delete guest:", error);
		throw error
	}
}

export async function restoreGuest(id: number) {
	try {
		await requirePermission("guest", "restore")

		await prisma.guest.update({
			where: {
				id
			},
			data: {
				deletedAt: null
			}
		})

		revalidateTag("booking-form-data");
		revalidatePath("/guests");

	} catch (error) {
		console.error("Error restoring guest: ", error)
		throw error
	}
}

export async function getGuestStats() {
	try {
		const totalGuests = await prisma.guest.count({
			where: {
				deletedAt: null
			}

		});

		const verifiedGuests = await prisma.guest.count({
			where: { verificationStatus: "verified", deletedAt: null },
		});
		const pendingGuests = await prisma.guest.count({
			where: { verificationStatus: "pending", deletedAt: null },
		});
		const blacklistedGuests = await prisma.guest.count({
			where: { blacklisted: true, deletedAt: null },
		});

		return {
			total: totalGuests,
			verified: verifiedGuests,
			pending: pendingGuests,
			blacklisted: blacklistedGuests,
		};
	} catch {
		return {
			total: 0,
			verified: 0,
			pending: 0,
			blacklisted: 0,
		};
	}
}
