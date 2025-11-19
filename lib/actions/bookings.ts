"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getBookings(page: number = 1) {
	try {
		// Define the Limit used for pagination
		const LIMIT = 2;

		const bookings = await prisma.booking.findMany({
			include: {
				guest: true,
				property: true,
				unit: true,
			},
			orderBy: {
				createdAt: "desc",
			},
			take: LIMIT,
			skip: (page - 1) * LIMIT
		});

		// Count bookings and find the totalPages
		const totalBookings = await prisma.booking.count()
		const totalPages = Math.ceil(totalBookings / LIMIT);

		// Get hasNext and hasPrev attributes
		const hasNext = page < totalPages;
		const hasPrev = page > 1 && page <= totalPages;

		return {
			totalPages,
			bookings,
			hasPrev,
			hasNext
		}

	} catch (error) {
		console.error("Error fetching bookings:", error);
		return {
			totalPages: 0,
			bookings: [],
			hasPrev: false,
			hasNext: false,
		};
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
	paymentMethod?: string;
	specialRequests?: string;
}) {
	try {
		// Prevent double booking: check if any booking exists for this property with checkInDate on the same day
		const startOfDay = new Date(data.checkInDate);
		startOfDay.setHours(0, 0, 0, 0);
		const endOfDay = new Date(data.checkInDate);
		endOfDay.setHours(23, 59, 59, 999);
		const existingBooking = await prisma.booking.findFirst({
			where: {
				propertyId: data.propertyId,
				unitId: data.unitId,
				checkInDate: {
					gte: startOfDay,
					lte: endOfDay,
				},
			},
		});
		if (existingBooking) {
			throw new Error(
				"A booking already exists for this property on the selected check-in date. Double booking is not allowed."
			);
		}

		const booking = await prisma.booking.create({
			data: {
				...data,
				status: "confirmed",
			},
			include: {
				guest: true,
				property: true,
				unit: true,
			},
		});
		revalidatePath("/bookings");
		revalidatePath("/dashboard");
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
		paymentMethod?: string;
		source?: string;
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
		revalidatePath("/dashboard");
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
		revalidatePath("/dashboard");
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

export async function getBookingsByUnit(unitId: number) {
	try {
		const bookings = await prisma.booking.findMany({
			where: { unitId },
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
		console.error("Error fetching bookings by unit:", error);
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
		const pendingBookings = await prisma.booking.count({
			where: { status: "pending" },
		});
		const completedBookings = await prisma.booking.count({
			where: { status: "completed" },
		});

		return {
			total: totalBookings,
			confirmed: confirmedBookings,
			pending: pendingBookings,
			completed: completedBookings,
		};
	} catch (error) {
		console.error("Error fetching booking stats:", error);
		return {
			total: 0,
			confirmed: 0,
			pending: 0,
			completed: 0,
		};
	}
}
