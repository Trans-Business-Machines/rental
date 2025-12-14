"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import type { GuestUpdateFormData, CreateNewGuest } from "@/lib/types/types"

export async function getGuests(page: number = 1) {
	// Define the limit
	const LIMIT = 6;

	const guests = await prisma.guest.findMany({
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
			}
		},
		orderBy: { createdAt: "desc" },
		take: LIMIT,
		skip: (page - 1) * LIMIT
	});

	// Count all guests and get the number of pages
	const totalGuests = await prisma.guest.count();
	const totalPages = Math.ceil(totalGuests / LIMIT);

	// Get hasNext and hasPrev attributes
	const hasNext = page < totalPages;
	const hasPrev = page > 1 && page <= totalPages

	return {
		totalPages,
		guests,
		currentPage: page,
		hasNext,
		hasPrev
	}

}

export async function getGuestById(id: number) {
	return prisma.guest.findUnique({
		where: { id }, include: {
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

export async function createGuest(data: CreateNewGuest) {
	const guest = await prisma.guest.create({
		data
	});
	revalidatePath("/guests");
	return guest;
}

export async function updateGuest(id: number, data: GuestUpdateFormData) {
	try {
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

export async function deleteGuest(id: number) {
	try {
		await prisma.guest.delete({ where: { id } });
		revalidateTag("booking-form-data");
		revalidatePath("/guests");
	} catch (error) {
		console.error("Failed to delete guest:", error);
		throw new Error("Failed to delete guest.")
	}
}

export async function checkoutGuest(bookingId: number, checkoutData: any) {
	// Mark booking as checked-out and create a checkout report
	const booking = await prisma.booking.update({
		where: { id: bookingId },
		data: { status: "checked_out" },
	});
	const report = await prisma.checkoutReport.create({
		data: {
			...checkoutData,
			bookingId: booking.id,
			guestId: booking.guestId,
			checkoutDate: new Date(),
		},
	});
	revalidatePath("/guests");
	revalidatePath("/properties");
	return { booking, report };
}

export async function getGuestStats() {
	try {
		const totalGuests = await prisma.guest.count();
		const verifiedGuests = await prisma.guest.count({
			where: { verificationStatus: "verified" },
		});
		const pendingGuests = await prisma.guest.count({
			where: { verificationStatus: "pending" },
		});
		const blacklistedGuests = await prisma.guest.count({
			where: { blacklisted: true },
		});

		return {
			total: totalGuests,
			verified: verifiedGuests,
			pending: pendingGuests,
			blacklisted: blacklistedGuests,
		};
	} catch (error) {
		console.error("Error fetching guest stats:", error);
		return {
			total: 0,
			verified: 0,
			pending: 0,
			blacklisted: 0,
		};
	}
}
