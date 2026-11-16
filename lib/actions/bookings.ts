"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { evaluateUnitStatus, normalizeCheckOutTo10amEAT } from "@/lib/utils"
import { requirePermission, requireRole, getServerSession } from "@/lib/check-permissions"
import { LIMIT, calculateTotalAmount, getDurationLabel, maskIdNumber } from "@/lib/utils"
import { kesToUsd } from "@/lib/currency"
import { exportBookingsSchema, type ExportBookingsFilters } from "@/lib/schemas/booking"
import { EXPORT_MAX_ROWS, eatDayRange, exportDateStamp, toExcelEAT } from "@/lib/export-utils"
import ExcelJS from "exceljs"
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
		await requirePermission("booking", "create");

		const session = await getServerSession();
		const user = session?.user;

		if (!user) {
			return {
				success: false,
				message: "Unauthorized: login required!",
			};
		}

		const isAgent = user.role === "agent";

		// Prevent double booking
		const checkInUTC = new Date(booking.checkInDate);
		const startOfDay = new Date(checkInUTC);
		startOfDay.setUTCHours(-3, 0, 0, 0);
		const endOfDay = new Date(checkInUTC);
		endOfDay.setUTCHours(20, 59, 59, 999);

		const existingBooking = await prisma.booking.findFirst({
			where: {
				propertyId: booking.propertyId,
				unitId: booking.unitId,
				status: { in: ["pending", "reserved", "checked_in"] },
				checkInDate: { gte: startOfDay, lte: endOfDay },
			},
		});

		if (existingBooking) {
			return {
				success: false,
				message: "A booking already exists for this property on the selected check-in date.",
			};
		}

		// Check for duplicate payment code in both tables
		const existingPaymentCode = await prisma.booking.findFirst({
			where: { paymentCode: booking.paymentCode },
		});

		const existingRequestCode = await prisma.bookingRequest.findFirst({
			where: {
				paymentCode: booking.paymentCode,
				status: { in: ["pending", "approved"] },
			},
		});

		if (existingPaymentCode || existingRequestCode) {
			return {
				success: false,
				message: "This payment code already exists and can't be reused!",
			};
		}

		const unitStatus = evaluateUnitStatus(booking.status);
		const checkOutAt10amEAT = normalizeCheckOutTo10amEAT(booking.checkOutDate);

		const result = await prisma.$transaction(
			async (tx) => {

				// 1. create booking
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
							? { requestedById: user.id }
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

				// 2. update unit status
				const unit = await tx.unit.update({
					where: {
						id: newBooking.unit.id,
						propertyId: newBooking.propertyId,
					},
					data: { status: unitStatus },
					select: {
						id: true,
						propertyId: true,
						name: true,
						status: true
					}
				});

				// Update property occupancy
				if (["booked", "reserved", "occupied"].includes(unit.status)) {
					await tx.property.update({
						where: { id: newBooking.propertyId },
						data: { occupied: { increment: 1 } },
					});
				}

				return newBooking;
			},
			{ timeout: 10000, maxWait: 3000, isolationLevel: "ReadCommitted" },
		);

		revalidatePath("/bookings");
		revalidatePath("/dashboard");
		revalidatePath("/properties");

		return { success: true, result };
	} catch (error) {
		console.error("Error creating booking:", error);

		const message =
			error instanceof Error ? error.message : "Failed to create booking!";

		return { success: false, message };
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

		// When transitioning to checked_in,
		//update checkInDate and recalculate checkOutDate
		if (isCheckingInNow) {
			// Update checkInDate and recalculate checkOutDate
			const newCheckInDate = new Date();

			let nightsToAdd: number;
			if (existing.priceDuration === "one_night") {
				nightsToAdd = existing.period;
			} else if (existing.priceDuration === "weekly") {
				nightsToAdd = existing.period * 7;
			} else if (existing.priceDuration === "monthly") {
				nightsToAdd = existing.period * 30;
			} else {
				nightsToAdd = existing.period;
			}

			const newCheckOutDate = new Date(newCheckInDate);
			newCheckOutDate.setDate(newCheckOutDate.getDate() + nightsToAdd);

			updatedBookingData.checkInDate = newCheckInDate;
			updatedBookingData.checkOutDate = normalizeCheckOutTo10amEAT(newCheckOutDate);
		} else if (data.checkOutDate) {
			updatedBookingData.checkOutDate = normalizeCheckOutTo10amEAT(data.checkOutDate);
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

				return { booking, unit };
			},
			{
				timeout: 60000 * 2,
				maxWait: 5000,
				isolationLevel: "ReadCommitted",
			}
		);

		revalidateTag("unit");
		revalidatePath("/bookings");
		revalidatePath("/dashboard");
		return result;

	} catch (error) {
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
						status: "pending",
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
// ================= BOOKINGS EXPORT =================

const STATUS_LABELS: Record<BookingStatus, string> = {
	pending: "Pending",
	reserved: "Reserved",
	checked_in: "Checked In",
	checked_out: "Checked Out",
	cancelled: "Cancelled",
};

export async function exportBookings(filters: ExportBookingsFilters) {
	await requireRole(["admin", "superAdmin"], "Unauthorized: Insufficent permissions.");

	const session = await getServerSession();
	const userRole = session?.user?.role as Role;

	const parsed = exportBookingsSchema.safeParse(filters);
	if (!parsed.success) {
		return { success: false as const, message: parsed.error.errors[0]?.message ?? "Invalid filters" };
	}

	const { propertyId, status, createdFrom, createdTo } = parsed.data;
	const createdAt = eatDayRange(createdFrom, createdTo);

	const where = {
		deletedAt: null,
		...(status !== "all" && { status }),
		...(propertyId !== "all" && { propertyId: parseInt(propertyId) }),
		...(createdAt && { createdAt }),
	};

	const total = await prisma.booking.count({ where });

	if (total === 0) {
		return { success: false as const, message: "No bookings match these filters." };
	}

	if (total > EXPORT_MAX_ROWS) {
		return {
			success: false as const,
			message: `${total.toLocaleString()} bookings match — the export limit is ${EXPORT_MAX_ROWS.toLocaleString()}. Narrow the filters and try again.`,
		};
	}

	const bookings = await prisma.booking.findMany({
		where,
		include: {
			guest: true,
			property: { select: { name: true } },
			unit: { select: { name: true } },
			requestedBy: { select: { name: true } },
			approvedBy: { select: { name: true } },
		},
		orderBy: { createdAt: "asc" },
	});

	const workbook = new ExcelJS.Workbook();
	workbook.created = new Date();
	const sheet = workbook.addWorksheet("Bookings", {
		views: [{ state: "frozen", ySplit: 1 }],
	});

	const dateFmt = "dd mmm yyyy hh:mm";
	const kesFmt = "#,##0";
	const usdFmt = "#,##0.00";

	sheet.columns = [
		{ header: "Booking ID", key: "id", width: 11 },
		{ header: "Status", key: "status", width: 13 },
		{ header: "Guest Name", key: "guestName", width: 24 },
		{ header: "Phone", key: "phone", width: 16 },
		{ header: "Email", key: "email", width: 28 },
		{ header: "ID Type", key: "idType", width: 12 },
		{ header: "ID / Passport No.", key: "idNumber", width: 18 },
		{ header: "Property", key: "property", width: 22 },
		{ header: "Unit", key: "unit", width: 16 },
		{ header: "Check-in", key: "checkIn", width: 18, style: { numFmt: dateFmt } },
		{ header: "Check-out", key: "checkOut", width: 18, style: { numFmt: dateFmt } },
		{ header: "Duration", key: "duration", width: 12 },
		{ header: "Period", key: "period", width: 8 },
		{ header: "Guests", key: "guests", width: 8 },
		{ header: "Unit Price (KES)", key: "unitPrice", width: 16, style: { numFmt: kesFmt } },
		{ header: "Total (KES)", key: "totalKes", width: 14, style: { numFmt: kesFmt } },
		{ header: "Total (USD)", key: "totalUsd", width: 13, style: { numFmt: usdFmt } },
		{ header: "Payment Method", key: "paymentMethod", width: 16 },
		{ header: "Payment Code", key: "paymentCode", width: 16 },
		{ header: "Requested By", key: "requestedBy", width: 18 },
		{ header: "Approved By", key: "approvedBy", width: 18 },
		{ header: "Approved At", key: "approvedAt", width: 18, style: { numFmt: dateFmt } },
		{ header: "Created At", key: "createdAt", width: 18, style: { numFmt: dateFmt } },
	];

	for (const booking of bookings) {
		const { guest } = booking;
		const idValue = guest.idType === "passport" ? guest.passportNumber : guest.idNumber;
		// unitPrice is stored already-discounted and totalAmount may include legacy VAT, so derive the total
		const totalKes = calculateTotalAmount(booking.unitPrice, booking.period);

		sheet.addRow({
			id: booking.id,
			status: STATUS_LABELS[booking.status] ?? booking.status,
			guestName: `${guest.firstName} ${guest.lastName}`,
			phone: guest.phone,
			email: guest.email,
			idType: guest.idType === "passport" ? "Passport" : "National ID",
			idNumber: idValue ? maskIdNumber(idValue, userRole) : "",
			property: booking.property.name,
			unit: booking.unit.name,
			checkIn: toExcelEAT(booking.checkInDate),
			checkOut: toExcelEAT(booking.checkOutDate),
			duration: getDurationLabel(booking.priceDuration),
			period: booking.period,
			guests: booking.numberOfGuests,
			unitPrice: booking.unitPrice,
			totalKes,
			totalUsd: Math.round(kesToUsd(totalKes) * 100) / 100,
			paymentMethod: booking.paymentMethod,
			paymentCode: booking.paymentCode,
			requestedBy: booking.requestedBy?.name ?? "",
			approvedBy: booking.approvedBy?.name ?? "",
			approvedAt: toExcelEAT(booking.approvedAt),
			createdAt: toExcelEAT(booking.createdAt),
		});
	}

	const header = sheet.getRow(1);
	header.font = { bold: true };
	header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
	sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: sheet.columns.length } };

	const buffer = await workbook.xlsx.writeBuffer();

	return {
		success: true as const,
		file: Buffer.from(buffer).toString("base64"),
		filename: `bookings-${exportDateStamp()}.xlsx`,
		count: bookings.length,
	};
}
