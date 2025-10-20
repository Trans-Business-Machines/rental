"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getGuests() {
	return prisma.guest.findMany({
		orderBy: { createdAt: "desc" },
		take: 6
	});
}

export async function getGuestById(id: number) {
	return prisma.guest.findUnique({ where: { id } });
}

export async function createGuest(data: any) {
	const guest = await prisma.guest.create({ data });
	revalidatePath("/guests");
	return guest;
}

export async function updateGuest(id: number, data: any) {
	const guest = await prisma.guest.update({ where: { id }, data });
	revalidatePath("/guests");
	return guest;
}

export async function deleteGuest(id: number) {
	await prisma.guest.delete({ where: { id } });
	revalidatePath("/guests");
}

export async function searchGuests(query: string) {
	try {
		const guests = await prisma.guest.findMany({
			where: {
				OR: [
					{
						firstName: {
							contains: query,
						},
					},
					{
						lastName: {
							contains: query,
						},
					},
					{
						email: {
							contains: query,
						},
					},
					{
						phone: {
							contains: query,
						},
					},
					{
						idNumber: {
							contains: query,
						},
					},
					{
						passportNumber: {
							contains: query,
						},
					},
				],
			},
			orderBy: {
				createdAt: "desc",
			},
		});
		return guests;
	} catch (error) {
		console.error("Error searching guests:", error);
		throw new Error("Failed to search guests");
	}
}

// Booking (sign-in/check-in)
export async function createBooking(data: any) {
	const booking = await prisma.booking.create({ data });
	revalidatePath("/guests");
	revalidatePath("/properties");
	return booking;
}

export async function updateBooking(id: number, data: any) {
	const booking = await prisma.booking.update({ where: { id }, data });
	revalidatePath("/guests");
	revalidatePath("/properties");
	return booking;
}

export async function checkoutGuest(bookingId: number, checkoutData: any) {
	// Mark booking as checked-out and create a checkout report
	const booking = await prisma.booking.update({
		where: { id: bookingId },
		data: { status: "checked-out" },
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
