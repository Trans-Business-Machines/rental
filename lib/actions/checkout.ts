"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCheckoutReports(page: number = 1) {
	try {
		const LIMIT = 6;
		const reports = await prisma.checkoutReport.findMany({
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
				createdAt: "desc",
			},
			take: LIMIT,
			skip: (page - 1) * LIMIT
		});

		// count reports and calculate the total number of pages
		const totalReports = await prisma.checkoutReport.count();
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

export async function createCheckoutReport(data: {
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
				await tx.booking.update({
					where: { id: data.bookingId },
					data: {
						status: "checked_out",
						checkOutDate: data.checkoutDate, // Use the checkout date from form
					},
				});

				// 4. Update unit status to maintenance
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

				return report;
			},
			{
				timeout: 40000, // 40 seconds for complex checkout
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

export async function getInventoryAssignmentsForUnit(unitId: number) {
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
}

export async function updateInventoryItemStatus(id: number, status: string) {
	try {
		// Note: notes are now tracked at assignment level, not template level
		const item = await prisma.inventoryItem.update({
			where: { id },
			data: {
				status,
				// Note: lastInspected field no longer exists in template model
			},
		});
		revalidatePath("/inventory");
		return item;
	} catch (error) {
		console.error("Error updating inventory item status:", error);
		throw new Error("Failed to update inventory item status");
	}
}
