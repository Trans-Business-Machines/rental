"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getBookings() {
	try {
		const bookings = await prisma.booking.findMany({
			include: {
				guest: true,
				property: true,
				unit: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});
		return bookings;
	} catch (error) {
		console.error("Error fetching bookings:", error);
		return [];
	}
}

export async function getBookingById(id: number) {
	try {
		const booking = await prisma.booking.findUnique({
			where: { id },
			include: {
				guest: true,
				property: true,
				unit: true,
			},
		});
		return booking;
	} catch (error) {
		console.error("Error fetching booking:", error);
		return null;
	}
}

export async function createBooking(data: {
	guestId: number;
	propertyId: number;
	unitId: number;
	checkInDate: Date;
	checkOutDate: Date;
	numberOfGuests: number;
	totalAmount: number;
	source: string;
	purpose: string;
	specialRequests?: string;
}) {
	try {
		const booking = await prisma.booking.create({
			data: {
				...data,
				status: "pending",
			},
			include: {
				guest: true,
				property: true,
				unit: true,
			},
		});
		revalidatePath("/bookings");
		return booking;
	} catch (error) {
		console.error("Error creating booking:", error);
		throw error;
	}
}

export async function updateBooking(
	id: number,
	data: {
		checkInDate?: Date;
		checkOutDate?: Date;
		numberOfGuests?: number;
		totalAmount?: number;
		status?: string;
		purpose?: string;
		specialRequests?: string;
	}
) {
	try {
		const booking = await prisma.booking.update({
			where: { id },
			data,
			include: {
				guest: true,
				property: true,
				unit: true,
			},
		});
		revalidatePath("/bookings");
		return booking;
	} catch (error) {
		console.error("Error updating booking:", error);
		throw error;
	}
}

export async function deleteBooking(id: number) {
	try {
		await prisma.booking.delete({
			where: { id },
		});
		revalidatePath("/bookings");
		return true;
	} catch (error) {
		console.error("Error deleting booking:", error);
		throw error;
	}
}

export async function searchBookings(query: string) {
	try {
		const bookings = await prisma.booking.findMany({
			where: {
				OR: [
					{
						guest: {
							OR: [
								{ firstName: { contains: query } },
								{ lastName: { contains: query } },
								{ email: { contains: query } },
							],
						},
					},
					{
						property: {
							name: { contains: query },
						},
					},
					{
						unit: {
							name: { contains: query },
						},
					},
				],
			},
			include: {
				guest: true,
				property: true,
				unit: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});
		return bookings;
	} catch (error) {
		console.error("Error searching bookings:", error);
		return [];
	}
}

export async function getAllPropertiesWithUnits() {
	try {
		const properties = await prisma.property.findMany({
			include: {
				units: true,
			},
			orderBy: {
				name: "asc",
			},
		});
		return properties;
	} catch (error) {
		console.error("Error fetching properties with units:", error);
		return [];
	}
}

export async function getRecentBookings(limit: number = 5) {
	try {
		const bookings = await prisma.booking.findMany({
			include: {
				guest: true,
				property: true,
				unit: true,
			},
			orderBy: {
				createdAt: "desc",
			},
			take: limit,
		});
		return bookings;
	} catch (error) {
		console.error("Error fetching recent bookings:", error);
		return [];
	}
}

export async function getMonthlyRevenue() {
	try {
		const currentDate = new Date();
		const startOfMonth = new Date(
			currentDate.getFullYear(),
			currentDate.getMonth(),
			1
		);
		const endOfMonth = new Date(
			currentDate.getFullYear(),
			currentDate.getMonth() + 1,
			0
		);

		const bookings = await prisma.booking.findMany({
			where: {
				createdAt: {
					gte: startOfMonth,
					lte: endOfMonth,
				},
				status: {
					in: ["confirmed", "checked-in", "checked-out"],
				},
			},
		});

		const totalRevenue = bookings.reduce(
			(sum, booking) => sum + booking.totalAmount,
			0
		);
		return totalRevenue;
	} catch (error) {
		console.error("Error calculating monthly revenue:", error);
		return 0;
	}
}

export async function getBookingStats() {
	try {
		const totalBookings = await prisma.booking.count();
		const confirmedBookings = await prisma.booking.count({
			where: { status: "confirmed" },
		});
		const checkedInBookings = await prisma.booking.count({
			where: { status: "checked-in" },
		});
		const completedBookings = await prisma.booking.count({
			where: { status: "checked-out" },
		});

		return {
			total: totalBookings,
			confirmed: confirmedBookings,
			checkedIn: checkedInBookings,
			completed: completedBookings,
		};
	} catch (error) {
		console.error("Error fetching booking stats:", error);
		return {
			total: 0,
			confirmed: 0,
			checkedIn: 0,
			completed: 0,
		};
	}
}
