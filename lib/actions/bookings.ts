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
