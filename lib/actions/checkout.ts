"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requirePermission } from "../check-permissions";
import { LIMIT } from "@/lib/utils"

interface GetCheckoutReportsProps {
	page: number
	search?: string,
	sortOrder?: "none" | "asc" | "desc";
}

export async function getCheckoutReports({ page = 1, sortOrder, search }: GetCheckoutReportsProps) {
	try {

		// Build the where clause
		const where = {
			// search filter
			OR: [
				{
					guest: {
						lastName: {
							contains: search, mode: "insensitive" as const
						}
					}
				},
				{
					guest: {
						firstName: {
							contains: search, mode: "insensitive" as const
						}
					}
				}
			]



		}

		const reports = await prisma.checkoutReport.findMany({
			where,
			include: {
				booking: {
					include: {
						guest: true,
						property: true,
						unit: true,
					},
				},
				guest: true,
				checkoutItems: {
					include: {
						inventoryAssignment: true,
					},
				},
			},
			orderBy: {
				createdAt: sortOrder === "none" ? "desc" : sortOrder,

			},
			take: LIMIT,
			skip: (page - 1) * LIMIT
		});

		// count reports and calculate the total number of pages
		const totalReports = await prisma.checkoutReport.count({
			where
		});
		const totalPages = Math.ceil(totalReports / LIMIT);

		// get hasNext and hasPrev attributes
		const hasNext = page < totalPages;
		const hasPrev = page > 1 && page <= totalPages

		return {
			totalPages,
			reports,
			currentPage: page,
			hasNext,
			hasPrev
		}
	} catch (error) {
		console.error("Error fetching checkout reports:", error);
		return {
			totalPages: 0,
			reports: [],
			currentPage: 0,
			hasNext: false,
			hasPrev: false,
		};
	}
}

export async function getBookingsForCheckout() {
	try {
		const bookings = await prisma.booking.findMany({
			where: {
				status: "checked_in",
			},
			include: {
				guest: true,
				property: true,
				unit: true,
			},
			orderBy: {
				checkOutDate: "asc",
			},
		});
		return bookings;
	} catch (error) {
		console.error("Error fetching bookings for checkout:", error);
		return [];
	}
}

export async function getCheckoutReportById(id: number) {
	try {
		const report = await prisma.checkoutReport.findUnique({
			where: { id },
			include: {
				booking: {
					include: {
						guest: true,
						property: true,
						unit: true,
					},
				},
				guest: true,
				checkoutItems: {
					include: {
						inventoryAssignment: true,
					},
				},
			},
		});
		return report;
	} catch (error) {
		console.error("Error fetching checkout report:", error);
		return null;
	}
}

/* export async function createCheckoutReport(data: {
	bookingId: number;
	guestId: number;
	checkoutDate: Date;
	inspector: string;
	totalDamageCost: number;
	depositDeduction: number;
	notes?: string;
	checkoutItems: {
		assignmentId: number;
		condition: "good" | "damaged" | "missing";
		damageCost: number;
		notes?: string;
	}[];
}) {

	// check if current user can checkout a guest
	await requirePermission("guest", "check-out")

	try {
		const { checkoutItems, ...reportData } = data;

		// Use transaction to ensure atomicity
		const result = await prisma.$transaction(
			async (tx) => {
				// 1. Create the checkout report
				const report = await tx.checkoutReport.create({
					data: {
						...reportData,
						status: "completed",
					},
					include: {
						booking: {
							include: {
								guest: true,
								property: true,
								unit: true,
							},
						},
						guest: true,
					},
				});

				// 2. Process each checkout item
				for (const item of checkoutItems) {
					// Get the assignment (item.inventoryItemId is actually assignmentId)
					const assignment = await tx.inventoryAssignment.findUnique({
						where: { id: item.assignmentId },
						include: { inventoryItem: true },
					});

					if (!assignment) {
						throw new Error(
							`Assignment with ID ${item.assignmentId} not found`
						);
					}

					// Create checkout item record
					await tx.checkoutItem.create({
						data: {
							checkoutReportId: report.id,
							inventoryAssignmentId: item.assignmentId,
							condition: item.condition,
							damageCost: item.damageCost,
							notes: item.notes,
						},
					});

					// Mark assignment as returned (inactive)
					await tx.inventoryAssignment.update({
						where: { id: assignment.id },
						data: {
							isActive: false,
							returnedAt: new Date(),
							notes: item.notes
								? `${assignment.notes || ""}\n\nCheckout: ${item.notes}`.trim()
								: assignment.notes,
						},
					});

					// Handle inventory based on condition
					if (item.condition === "good") {
						// Return to stock - increment quantity
						await tx.inventoryItem.update({
							where: { id: assignment.inventoryItem.id },
							data: {
								quantity: { increment: 1 },
							},
						});

						// Create movement record - return to store
						await tx.inventoryMovement.create({
							data: {
								inventoryItemId: assignment.inventoryItem.id,
								fromUnitId: assignment.unitId,
								toUnitId: null,
								movedBy: data.inspector,
								direction: "to_store",
								quantity: 1,
								notes: `Returned from checkout in good condition`,
							},
						});
					} else if (item.condition === "damaged") {
						// Damaged item - create movement record but don't return to stock
						await tx.inventoryMovement.create({
							data: {
								inventoryItemId: assignment.inventoryItem.id,
								fromUnitId: assignment.unitId,
								toUnitId: null,
								movedBy: data.inspector,
								direction: "damaged",
								quantity: 1,
								notes: `Damaged during checkout. Damage cost: KES ${item.damageCost.toLocaleString()}. ${item.notes || ""
									}`,
							},
						});
					} else if (item.condition === "missing") {
						// Missing item - create movement record
						await tx.inventoryMovement.create({
							data: {
								inventoryItemId: assignment.inventoryItem.id,
								fromUnitId: assignment.unitId,
								toUnitId: null,
								movedBy: data.inspector,
								direction: "missing",
								quantity: 1,
								notes: `Missing during checkout. Cost: KES ${item.damageCost.toLocaleString()}. ${item.notes || ""
									}`,
							},
						});
					}
				}

				// 3. Update booking status
				const booking = await tx.booking.update({
					where: { id: data.bookingId },
					data: {
						status: "checked_out",
						checkOutDate: data.checkoutDate, // Use the checkout date from form
					},
				});

				// 4. Update unit status to available
				await tx.unit.update({
					where: { id: report.booking.unit.id },
					data: {
						status: "available",
					},
				});

				// 5. Update guest statistics
				await tx.guest.update({
					where: { id: data.guestId },
					data: {
						totalStays: { increment: 1 },
						lastStay: data.checkoutDate,
					},
				});

				// 6. Decrement property occupancy
				await tx.property.update({
					where: {
						id: booking.propertyId
					},
					data: {
						occupied: {
							increment: -1
						}
					}

				})

				return report;
			},
			{
				timeout: 60000 * 2, // 2  minutes for complex checkout
				maxWait: 5000,
				isolationLevel: "ReadCommitted",
			}
		);

		// Revalidate relevant paths
		revalidatePath("/checkout");
		revalidatePath("/inventory");
		revalidatePath("/dashboard");
		revalidatePath("/properties");
		revalidatePath("/bookings");
		revalidatePath("/guests");

		return result;
	} catch (error) {
		console.error("Error creating checkout report:", error);

		// Provide more specific error messages
		if (error instanceof Error) {
			throw new Error(`Checkout failed: ${error.message}`);
		}

		throw new Error("Failed to create checkout report. Please try again.");
	}
} */

export async function createCheckoutReport(data: {
	bookingId: number;
	guestId: number;
	checkoutDate: Date;
	inspector: string;
	overallDamageCost: number;
	notes?: string;
	checkoutItems: {
		assignmentId: number;
		condition: "good" | "damaged" | "missing";
	}[];
}) {
	// Check if current user can checkout a guest
	await requirePermission("guest", "check-out");


	try {
		const { checkoutItems, ...reportData } = data;
		const actualCheckoutDate = new Date();

		// Use transaction to ensure atomicity
		const result = await prisma.$transaction(
			async (tx) => {
				// 1. Create the checkout report
				const report = await tx.checkoutReport.create({
					data: {
						bookingId: reportData.bookingId,
						guestId: reportData.guestId,
						checkoutDate: actualCheckoutDate,
						inspector: reportData.inspector,
						totalDamageCost: reportData.overallDamageCost,
						notes: reportData.notes,
						status: "completed",
					},
					include: {
						booking: {
							include: {
								guest: true,
								property: true,
								unit: true,
							},
						},
						guest: true,
					},
				});

				// 2. Process each checkout item (only damaged/missing)
				for (const item of checkoutItems) {
					// Skip good items entirely — they stay in the unit as-is
					if (item.condition === "good") continue;

					const assignment = await tx.inventoryAssignment.findUnique({
						where: { id: item.assignmentId },
						include: { inventoryItem: true },
					});

					if (!assignment) {
						throw new Error(
							`Assignment with ID ${item.assignmentId} not found`
						);
					}

					// Create checkout item record for damaged/missing only
					await tx.checkoutItem.create({
						data: {
							checkoutReportId: report.id,
							inventoryAssignmentId: item.assignmentId,
							condition: item.condition,
							damageCost: 0,
							notes: null,
						},
					});

					// Deactivate the assignment — item is leaving the unit
					await tx.inventoryAssignment.update({
						where: { id: assignment.id },
						data: {
							isActive: false,
							returnedAt: new Date(),
						},
					});

					// Create movement record
					await tx.inventoryMovement.create({
						data: {
							inventoryItemId: assignment.inventoryItem.id,
							fromUnitId: assignment.unitId,
							toUnitId: null,
							movedBy: data.inspector,
							direction: item.condition, // "damaged" or "missing"
							quantity: 1,
							notes:
								item.condition === "damaged"
									? "Damaged during guest stay"
									: "Missing after guest stay",
						},
					});
				}

				// 3. Update booking status
				const booking = await tx.booking.update({
					where: { id: data.bookingId },
					data: {
						status: "checked_out",
						checkOutDate: actualCheckoutDate,
					},
				});

				// 4. Update unit status to available
				await tx.unit.update({
					where: { id: report.booking.unit.id },
					data: {
						status: "available",
					},
				});

				// 5. Update guest statistics
				await tx.guest.update({
					where: { id: data.guestId },
					data: {
						totalStays: { increment: 1 },
						lastStay: data.checkoutDate,
					},
				});

				// 6. Decrement property occupancy
				await tx.property.update({
					where: { id: booking.propertyId },
					data: {
						occupied: {
							increment: -1,
						},
					},
				});

				return report;
			},
			{
				timeout: 60000 * 2,
				maxWait: 5000,
				isolationLevel: "ReadCommitted",
			}
		);

		revalidatePath("/checkout");
		revalidatePath("/inventory");
		revalidatePath("/dashboard");
		revalidatePath("/properties");
		revalidatePath("/bookings");
		revalidatePath("/guests");

		return result;
	} catch (error) {
		console.error("Error creating checkout report:", error);

		if (error instanceof Error) {
			throw new Error(`Checkout failed: ${error.message}`);
		}

		throw new Error("Failed to create checkout report. Please try again.");
	}
}

/* export async function getInventoryAssignmentsForUnit(unitId: number) {
	try {
		const assignments = await prisma.inventoryAssignment.findMany({
			where: {
				unitId,
				isActive: true,
				inventoryItem: {
					assignableOnBooking: true,
				},
			},
			select: {
				id: true,
				serialNumber: true,
				notes: true,
				inventoryItem: {
					select: {
						id: true,
						itemName: true,
						category: true,
						status: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return assignments;
	} catch (error) {
		console.error("Error fetching inventory for unit:", error);
		return [];
	}
} */

export type AggregatedAssignment = {
	itemId: number;
	itemName: string;
	category: string;
	totalQuantity: number;
	assignmentIds: number[];
};

export async function getInventoryAssignmentsForUnit(
	unitId: number
): Promise<AggregatedAssignment[]> {
	try {
		const assignments = await prisma.inventoryAssignment.findMany({
			where: {
				unitId,
				isActive: true,
				inventoryItem: {
					assignableOnBooking: true,
				},
			},
			select: {
				id: true,
				inventoryItem: {
					select: {
						id: true,
						itemName: true,
						category: true,
					},
				},
			},
			orderBy: {
				inventoryItem: {
					category: "asc",
				},
			},
		});

		// Group by inventoryItem.id
		const grouped = new Map<number, AggregatedAssignment>();

		for (const assignment of assignments) {
			const { id: itemId, itemName, category } = assignment.inventoryItem;

			if (grouped.has(itemId)) {
				const existing = grouped.get(itemId)!;
				existing.totalQuantity += 1;
				existing.assignmentIds.push(assignment.id);
			} else {
				grouped.set(itemId, {
					itemId,
					itemName,
					category,
					totalQuantity: 1,
					assignmentIds: [assignment.id],
				});
			}
		}

		return Array.from(grouped.values());
	} catch (error) {
		console.error("Error fetching inventory for unit:", error);
		return [];
	}
}

