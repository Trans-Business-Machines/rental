"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { evaluateUnitStatus, normalizeCheckOutTo10amEAT } from "@/lib/utils"
import { requirePermission, getServerSession } from "@/lib/check-permissions"
import { LIMIT } from "@/lib/utils"
import { redirect } from "next/navigation";
import type {
	BookingStatus,
	CreateBookingData,
	GetBookingsParams,
	UpdatedBookingData,
	Role
} from "@/lib/types/types";



export async function getBookings({
	page = 1,
	search = "",
	status = "all",
	propertyId = "all",
}: GetBookingsParams = {}) {
	try {
		const session = await getServerSession();
		const user = session?.user

		if (!user) {
			redirect("/login")
		}

		const userRole = user.role as Role


		const where = {
			// Exclude soft-deleted bookings
			deletedAt: null,

			// Show only the bookings made by an agent if user is agent
			...(userRole === "agent" && {
				requestedById: user.id
			}),

			// Search by guest name or unit name
			...(search && {
				OR: [
					{ guest: { firstName: { contains: search, mode: "insensitive" as const } } },
					{ guest: { lastName: { contains: search, mode: "insensitive" as const } } },
					{ unit: { name: { contains: search, mode: "insensitive" as const } } },
				],
			}),

			// Status filter
			...(status !== "all" && {
				status: status as BookingStatus,
			}),

			// Property filter
			...(propertyId !== "all" && {
				propertyId: parseInt(propertyId),
			}),
		};

		const [bookings, totalBookings] = await Promise.all([
			prisma.booking.findMany({
				where,
				include: {
					guest: true,
					property: true,
					unit: true,
					requestedBy: {
						select: {
							name: true
						}
					},
					approvedBy: {
						select: {
							name: true
						}
					},
				},
				orderBy: {
					createdAt: "desc",
				},
				take: LIMIT,
				skip: (page - 1) * LIMIT,
			}),
			prisma.booking.count({ where }),
		]);

		const totalPages = Math.ceil(totalBookings / LIMIT) || 1;

		const hasNext = page < totalPages;
		const hasPrev = page > 1 && page <= totalPages;

		return {
			totalPages,
			bookings,
			currentPage: page,
			hasPrev,
			hasNext,
		};
	} catch (error) {
		console.error("Error fetching bookings:", error);
		return {
			totalPages: 0,
			bookings: [],
			currentPage: 1,
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
				requestedBy: {
					select: {
						name: true
					}
				},
				approvedBy: {
					select: {
						name: true
					}
				},
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
		const session = await getServerSession();
		const user = session?.user

		if (!user) {
			redirect("/login")
		}

		const userRole = user.role as Role

		const booking = await prisma.booking.findUnique({
			where: {
				id,
				deletedAt: null,
				...(userRole === "agent" && {
					requestedById: user.id
				}),
			},
			include: {
				guest: true,
				property: true,
				unit: true,
				requestedBy: {
					select: {
						name: true
					}
				},
				approvedBy: {
					select: {
						name: true
					}
				}
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
		await requirePermission("booking", "create");

		const session = await getServerSession();
		const user = session?.user;

		if (!user) {
			throw new Error("Unauthorized: login required!")
		}

		// Determine if user is an agent or admin/superAdmin
		const isAgent = user.role === "agent";

		// Prevent double booking: check if any booking exists for this property with checkInDate on the same day
		const checkInUTC = new Date(booking.checkInDate);
		const startOfDay = new Date(checkInUTC);
		startOfDay.setUTCHours(-3, 0, 0, 0); // 00:00 EAT === 21:00 UTC previous day
		const endOfDay = new Date(checkInUTC);
		endOfDay.setUTCHours(20, 59, 59, 999); // 23:59 EAT

		const existingBooking = await prisma.booking.findFirst({
			where: {
				propertyId: booking.propertyId,
				unitId: booking.unitId,
				status: {
					in: ["pending", "reserved", "checked_in"],
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
		const unitStatus = evaluateUnitStatus(booking.status);

		// Se the checkout time to 10am
		const checkOutAt10amEAT = normalizeCheckOutTo10amEAT(booking.checkOutDate);

		// use a prisma transaction to create booking and then update unit status
		const result = await prisma.$transaction(
			async (tx) => {
				// create booking
				const newBooking = await tx.booking.create({
					data: {
						guestId: booking.guestId,
						propertyId: booking.propertyId,
						unitId: booking.unitId,
						priceDuration: booking.priceDuration,
						unitPrice: booking.unitPrice,
						period: booking.period,
						discountRate: booking.discountRate || null,
						totalAmount: booking.totalAmount,
						checkInDate: booking.checkInDate,
						checkOutDate: checkOutAt10amEAT,
						numberOfGuests: booking.numberOfGuests,
						source: booking.source,
						purpose: booking.purpose,
						paymentCode: booking.paymentCode,
						paymentMethod: booking.paymentMethod,
						specialRequests: booking.specialRequests,
						status: booking.status,
						...(isAgent
							? {
								requestedById: user.id,
							}
							: {
								requestedById: user.id,
								approvedById: user.id,
								approvedAt: new Date(),
							}),

					},
					include: {
						unit: true,
						guest: true,
					},
				});

				// update unit status
				await tx.unit.update({
					where: {
						id: newBooking.unit.id,
						propertyId: newBooking.propertyId,
					},
					data: {
						status: unitStatus,
					},
				});

				// increment property occupied count
				if (["checked_in", "reserved"].includes(booking.status)) {
					await tx.property.update({
						where: {
							id: booking.propertyId,
						},
						data: {
							occupied: {
								increment: 1,
							},
						},
					});
				}

				return newBooking;
			},
			{ timeout: 10000, maxWait: 3000, isolationLevel: "ReadCommitted" }
		);

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
	data: UpdatedBookingData
) {
	try {
		// Confirm that the current session user has permission to update a booking
		await requirePermission("booking", "update");

		// Fetch existing booking so we can detect real status transitions
		const existing = await prisma.booking.findUnique({
			where: { id },
			select: {
				status: true,
				propertyId: true,
				priceDuration: true,
				period: true,
			},
		});

		if (!existing) {
			throw new Error("Booking not found");
		}

		// Get the corresponding unit status based on the new booking status
		const unitStatus = evaluateUnitStatus(data.status);

		// Only increment occupied on an actual transition into checked_in
		const isCheckingInNow =
			data.status === "checked_in" && existing.status !== "checked_in";

		// Build the update payload
		const updatedBookingData: Record<string, unknown> = {
			...data,
		};

		// When transitioning to checked_in, update checkInDate and recalculate checkOutDate
		if (isCheckingInNow) {
			const newCheckInDate = new Date();

			// Calculate nights based on pricing duration
			let nightsToAdd: number;
			if (existing.priceDuration === "one_night") {
				nightsToAdd = existing.period;
			} else if (existing.priceDuration === "weekly") {
				nightsToAdd = existing.period * 7;
			} else if (existing.priceDuration === "monthly") {
				nightsToAdd = existing.period * 30;
			} else {
				// Default fallback
				nightsToAdd = existing.period;
			}

			const newCheckOutDate = new Date(newCheckInDate);
			newCheckOutDate.setDate(newCheckOutDate.getDate() + nightsToAdd);

			updatedBookingData.checkInDate = newCheckInDate;
			updatedBookingData.checkOutDate = normalizeCheckOutTo10amEAT(newCheckOutDate);
		} else if (data.checkOutDate) {
			// For non-check-in updates, normalize the checkout date if provided
			updatedBookingData.checkOutDate = normalizeCheckOutTo10amEAT(data.checkOutDate);
		}

		// Use a prisma transaction to ensure atomicity and data consistency
		const result = await prisma.$transaction(
			async (tx) => {
				// update booking
				const booking = await tx.booking.update({
					where: { id },
					data: updatedBookingData,
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
						propertyId: booking.property.id,
					},
					data: {
						status: unitStatus,
					},
				});

				// increment property occupied count only on real transition
				if (isCheckingInNow) {
					await tx.property.update({
						where: { id: booking.propertyId },
						data: {
							occupied: {
								increment: 1,
							},
						},
					});
				}

				return { booking, unit };
			},
			{ timeout: 6000, maxWait: 3000, isolationLevel: "ReadCommitted" }
		);

		revalidateTag("unit");
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

		const session = await getServerSession();
		const user = session?.user;

		if (!user) {
			redirect("/login")
		}

		const isAgent = user.role === "agent"

		const totalBookings = await prisma.booking.count({
			where: {
				deletedAt: null,
				...(isAgent && {
					requestedById: user.id
				})
			}
		});
		const pendingBookings = await prisma.booking.count({
			where: { status: "pending", deletedAt: null },
		});
		const checkedInBookings = await prisma.booking.count({
			where: {
				status: "checked_in",
				deletedAt: null,
				...(isAgent && {
					requestedById: user.id
				})
			},
		});
		const reservedBookings = await prisma.booking.count({
			where: {
				status: "reserved",
				deletedAt: null,
				...(isAgent && {
					requestedById: user.id
				})
			},
		});

		return {
			total: totalBookings,
			checkedIn: checkedInBookings,
			reserved: reservedBookings,
			...(!isAgent && { pending: pendingBookings, })
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
	const [guests, properties] = await Promise.all([
		prisma.guest.findMany({
			where: {
				verificationStatus: "verified",
				deletedAt: null,
			},
			select: {
				id: true,
				firstName: true,
				lastName: true,
				email: true,
				bookings: {
					where: {
						status: {
							in: ["checked_in", "pending", "reserved"],
						},
					},
					orderBy: {
						checkOutDate: "desc",
					},
					select: {
						id: true,
						status: true,
						unitPrice: true,
					},
					take: 1,
				},
				bookingRequests: {
					where: {
						status: {
							in: ["pending", "approved"],
						},
					},
					orderBy: {
						createdAt: "desc",
					},
					select: {
						id: true,
						status: true,
					},
					take: 1,
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		}),

		prisma.property.findMany({
			where: {
				deletedAt: null,
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
						type: true,
					},
					orderBy: {
						name: "asc",
					},
				},
			},
			orderBy: {
				name: "asc",
			},
		}),
	]);

	const processedGuests = guests.map((guest) => ({
		...guest,
		isCheckedIn: guest.bookings.length > 0 || guest.bookingRequests.length > 0,
	}));

	return {
		properties,
		guests: processedGuests,
	};
};