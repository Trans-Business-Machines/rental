"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { evaluateUnitStatus } from "@/lib/utils"
import { requirePermission } from "@/lib/check-permissions"
import { LIMIT } from "@/lib/utils"
import type { BookingStatus, CreateBookingData, } from "@/lib/types/types"

export async function getBookings(page: number = 1) {
	try {
		const bookings = await prisma.booking.findMany({
			where: {
				deletedAt: null
			},
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

export async function getSoftDeletedBookings() {
	try {
		const bookings = await prisma.booking.findMany({
			where: {
				deletedAt: {
					not: null
				}
			},
			include: {
				guest: true,
				property: true,
				unit: true,
			},
		})

		return bookings

	} catch (error) {
		console.log("Error getting soft deleted bookings.")
		throw error
	}
}

export async function getBookingById(id: number) {
	try {
		const booking = await prisma.booking.findUnique({
			where: { id, deletedAt: null },
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

export async function createBooking(booking: CreateBookingData) {
	try {

		// Confirm that the current session user has permission to create a booking
		await requirePermission("booking", "create")

		// Prevent double booking: check if any booking exists for this property with checkInDate on the same day
		const startOfDay = new Date(booking.checkInDate);
		startOfDay.setHours(0, 0, 0, 0);

		const endOfDay = new Date(booking.checkInDate);
		endOfDay.setHours(23, 59, 59, 999);

		const existingBooking = await prisma.booking.findFirst({
			where: {
				propertyId: booking.propertyId,
				unitId: booking.unitId,
				status: {
					in: ["pending", "reserved", "checked_in"]
				},
				checkInDate: {
					gte: startOfDay,
					lte: endOfDay,
				},
			},
		});

		if (existingBooking) {
			throw new Error(
				"A booking already exists for this property on the selected check-in date."
			);
		}

		// Get the corresponding unit status based on booking status
		const unitStatus = evaluateUnitStatus(booking.status)

		// use a prisma transaction to create booking and then update unit status
		const result = await prisma.$transaction(
			async (tx) => {
				// create booking
				const newBooking = await tx.booking.create({
					data: booking,
					include: {
						unit: true,
						guest: true,
					}
				})

				// update unit status
				await tx.unit.update({
					where: {
						id: newBooking.unit.id,
						propertyId: newBooking.propertyId
					},
					data: {
						status: unitStatus
					}

				})

				// increment property occupied count
				if (booking.status === "checked_in") {
					await tx.property.update({
						where: {
							id: booking.propertyId
						},
						data: {
							occupied: {
								increment: 1
							}
						}

					})
				}

				return newBooking
			}, { timeout: 10000, maxWait: 3000, isolationLevel: "ReadCommitted" })

		revalidatePath("/bookings");
		revalidatePath("/dashboard");
		revalidatePath("/properties");

		return result;
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
		paymentMethod?: string;
		source?: string;
		purpose?: string;
		specialRequests?: string;
		status: BookingStatus;
	}
) {
	try {

		// Confirm that the current session user has permission to create a booking
		await requirePermission("booking", "update")

		//  Get the corresponding unit status based on booking status
		const unitStatus = evaluateUnitStatus(data.status)

		// we use a prisma transaction to ensure atomicity and data consistency
		const result = await prisma.$transaction(
			async (tx) => {
				// update booking
				const booking = await tx.booking.update({
					where: { id },
					data,
					include: {
						guest: true,
						property: true,
						unit: true,
					},
				});

				// update unit status
				const unit = await tx.unit.update({
					where: {
						id: booking.unit.id,
						propertyId: booking.property.id
					},
					data: {
						status: unitStatus
					}
				})

				// increment property occupied count
				if (booking.status === "checked_in") {
					await tx.property.update({
						where: {
							id: booking.propertyId
						},
						data: {
							occupied: {
								increment: 1
							}
						}

					})
				}

				return {
					booking,
					unit
				}

			}, { timeout: 10000, maxWait: 3000, isolationLevel: "ReadCommitted" })

		revalidateTag("unit")
		revalidatePath("/bookings");
		revalidatePath("/dashboard");
		return result;
	} catch (error) {
		console.error("Error updating booking:", error);
		throw error;
	}
}

export async function softDeleteBooking(id: number) {
	try {
		// confirm that the current session user can soft delete booking
		await requirePermission("booking", "update")

		await prisma.booking.update({
			where: {
				id
			},
			data: {
				deletedAt: new Date()
			}
		})

		revalidatePath("/bookings");
		revalidatePath("/dashboard");

		return {
			success: true,
		}


	} catch (error) {
		console.error("Error soft deleting booking:", error);
		throw error
	}

}

export async function deleteBooking(id: number) {
	try {
		// confirm that the current session user can hard delete booking
		await requirePermission("booking", "delete")


		await prisma.booking.delete({
			where: { id },
		});

		revalidatePath("/bookings");
		revalidatePath("/dashboard");

		return {
			success: true,
		}

	} catch (error) {
		console.error("Error hard deleting booking:", error);
		throw error;
	}
}

export async function restoreBooking(id: number) {
	try {
		// confirm that the current session user can restore a deleted booking
		await requirePermission("booking", "restore");

		await prisma.booking.update({
			where: {
				id
			},
			data: {
				deletedAt: null
			}
		})

		revalidatePath("/bookings");
		revalidatePath("/dashboard");

		return {
			success: true
		}
	} catch (error) {
		console.error("Error occured when restoring booking: ", error)
		throw error
	}
}

export async function getBookingStats() {
	try {
		const totalBookings = await prisma.booking.count({
			where: {
				deletedAt: null
			}
		});
		const pendingBookings = await prisma.booking.count({
			where: { status: "pending", deletedAt: null },
		});
		const checkedInBookings = await prisma.booking.count({
			where: { status: "checked_in", deletedAt: null },
		});
		const reservedBookings = await prisma.booking.count({
			where: { status: "reserved", deletedAt: null },
		});

		return {
			total: totalBookings,
			checkedIn: checkedInBookings,
			pending: pendingBookings,
			reserved: reservedBookings,
		};
	} catch (error) {
		console.error("Error fetching booking stats:", error);
		return {
			total: 0,
			checkedIn: 0,
			pending: 0,
			reserved: 0,
		};
	}
}

export const getBookingFormData = async () => {
	// Retrieve guest and property info from the DB all in one go
	const [guests, properties] = await Promise.all([
		prisma.guest.findMany({
			where: {
				verificationStatus: "verified",
				deletedAt: null
			},
			select: {
				id: true,
				firstName: true,
				lastName: true,
				email: true,
				bookings: {
					where: {
						status: {
							in: ["checked_in", "pending", "reserved"]
						},
					},
					orderBy: {
						checkOutDate: "desc"
					},
					select: {
						id: true,
						status: true,

					},
					take: 1
				}
			},
			orderBy: {
				createdAt: "desc"
			}
		}),

		prisma.property.findMany({
			where: {
				deletedAt: null
			},
			select: {
				id: true,
				name: true,
				units: {
					select: {
						id: true,
						name: true,
						maxGuests: true,
						status: true,
						rent: true,
					},
					orderBy: {
						name: "asc"
					}
				}
			},
			orderBy: {
				name: "asc"
			}
		})
	])

	// Add an isCheckedIn field to guests data
	const processedGuests = guests.map(guest => ({
		...guest,
		isCheckedIn: guest.bookings.length > 0
	}))

	return {
		properties,
		guests: processedGuests
	}
}