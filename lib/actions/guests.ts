"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { requirePermission, getServerSession } from "@/lib/check-permissions"
import { LIMIT, BUCKET } from "@/lib/utils"
import type {
	GuestUpdateFormData,
	CreateNewGuest,
	Role,
	VerificationStatus
} from "@/lib/types/types"
import { supabase, extractFilePath } from "@/lib/services/MediaService"


interface GetGuestsParams {
	page?: number;
	search?: string;
	status?: string;
}

/*function extractFilePath(url: string): string {
	const parts = url.split("/guest-documents/");
	if (parts.length < 2) {
		throw new Error(`Could not extract file path from URL: ${url}`);
	}

	const filename = parts[1].split("?")[0];
	return `guest-documents/${filename}`;
}*/

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
		const rejectedGuests = await prisma.guest.count({
			where: { verificationStatus: "rejected", deletedAt: null },
		});

		return {
			total: totalGuests,
			verified: verifiedGuests,
			pending: pendingGuests,
			rejected: rejectedGuests,
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
			verificationStatus: status as VerificationStatus,
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
			orderBy: [
				{ verificationStatus: "asc" },
				{ createdAt: "desc" },
			],
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
			bookings: {
				select: {
					id: true,
					status: true,
				},
				orderBy: {
					createdAt: "desc"
				},
				take: 1
			},
			registeredBy: {
				select: {
					name: true
				}
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

export async function searchGuestsForBooking(
	query: string
) {
	const session = await getServerSession();

	if (!session?.user?.id) {
		throw new Error("Unauthorized");
	}

	const userRole = session.user.role as Role;

	// Agents only can search guests
	if (!["agent"].includes(userRole)) {
		throw new Error("Unauthorized");
	}

	const guests = await prisma.guest.findMany({
		where: {
			deletedAt: null,
			verificationStatus: {
				in: ["verified"],
			},
			...(query.trim() && {
				OR: [
					{ firstName: { contains: query, mode: "insensitive" } },
					{ lastName: { contains: query, mode: "insensitive" } },
					{ email: { contains: query, mode: "insensitive" } },
					{ phone: { contains: query } },
				],
			}),
		},
		select: {
			id: true,
			firstName: true,
			lastName: true,
			email: true,
			phone: true,
			bookings: {
				where: {
					status: { in: ["pending", "reserved", "checked_in"] },
				},
				select: {
					status: true,
					unit: {
						select: { name: true },
					},
				},
				take: 1,
				orderBy: { createdAt: "desc" },
			},
			bookingRequests: {
				where: {
					status: { in: ["pending", "approved"] },
				},
				select: {
					status: true,
					unit: {
						select: { name: true },
					},
				},
				take: 1,
				orderBy: { createdAt: "desc" },
			},
		},
		take: 20,
		orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
	});

	return guests.map((guest) => {
		// Bookings take precedence since they're confirmed stays
		if (guest.bookings[0]) {
			return {
				id: guest.id,
				firstName: guest.firstName,
				lastName: guest.lastName,
				email: guest.email,
				phone: guest.phone,
				activeBookingStatus: guest.bookings[0].status as
					| "pending"
					| "reserved"
					| "checked_in",
				activeBookingUnit: guest.bookings[0].unit.name,
			};
		}

		// Check for pending/approved booking requests
		if (guest.bookingRequests[0]) {
			const requestStatus =
				guest.bookingRequests[0].status === "approved" ? "reserved" : "pending";

			return {
				id: guest.id,
				firstName: guest.firstName,
				lastName: guest.lastName,
				email: guest.email,
				phone: guest.phone,
				activeBookingStatus: requestStatus as "pending" | "reserved",
				activeBookingUnit: guest.bookingRequests[0].unit.name,
			};
		}

		// No active booking or request
		return {
			id: guest.id,
			firstName: guest.firstName,
			lastName: guest.lastName,
			email: guest.email,
			phone: guest.phone,
			activeBookingStatus: null,
			activeBookingUnit: null,
		};
	});
}

export async function createGuest(data: CreateNewGuest) {
	try {
		// Confirm that the current session user has permission to create a guest
		await requirePermission("guest", "create");

		const { registeredBy, ...guestData } = data;


		// Check that the guest does not exist
		const existingGuest = await prisma.guest.findUnique({
			where: {
				email: guestData.email
			}
		})

		if (existingGuest) {
			throw new Error("A guest with this email already exists.")
		}

		const guest = await prisma.guest.create({
			data: {
				...guestData,
				...(registeredBy && {
					registeredBy: {
						connect: { id: registeredBy },
					},
				})
			},
		});

		revalidatePath("/guests");

		return guest;

	} catch (error) {
		console.error("Error creating guest: ", error)

		if (error instanceof Error) {
			throw error
		} else {
			throw new Error("Failed to create guest.")
		}
	}
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
		await requirePermission("guest", "delete");

		const guest = await prisma.guest.findUnique({
			where: {
				id,
			},
			select: {
				idType: true,
				idFrontUrl: true,
				idBackUrl: true,
				passportUrl: true,
			}
		})

		if (!guest) {
			return {
				success: false,
				message: "Guest not found"
			}
		}

		const filePaths: string[] = []

		if (guest.idType === "national_id") {
			if (guest.idFrontUrl) filePaths.push(guest.idFrontUrl);
			if (guest.idBackUrl) filePaths.push(guest.idBackUrl);
		} else if (guest.idType === "passport") {
			if (guest.passportUrl) filePaths.push(guest.passportUrl);
		}

		// Delete images from the bucket.
		const result = await deleteGuestImages(filePaths);

		if (!result.success) {
			return result
		}

		const deletedGuest = await prisma.guest.delete({ where: { id } });

		revalidateTag("booking-form-data");
		revalidatePath("/guests");

		return {
			success: true,
			message: `${deletedGuest.firstName + " " + deletedGuest.lastName} has successfully been deleted`
		}

	} catch (error) {
		console.error("Failed to delete guest:", error);
		throw error
	}
}

export async function deleteGuestImages(urls: string[]) {

	const filePaths = urls.map(url => extractFilePath(url, "guest"))

	if (filePaths.length > 0) {
		const { error } = await supabase.storage
			.from(BUCKET)
			.remove(filePaths);

		if (error) {
			console.error("Failed to delete guest images from storage:", error);

			return {
				success: false,
				message: "Failed to delete images"
			}
		}

		return {
			success: true,
			message: "Images deleted successfully."
		}
	}


	return {
		success: false,
		message: "Failed to delete images"
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

