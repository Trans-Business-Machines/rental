"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCheckoutReports() {
	try {
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
						inventoryItem: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});
		return reports;
	} catch (error) {
		console.error("Error fetching checkout reports:", error);
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
						inventoryItem: true,
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
		inventoryItemId: number;
		condition: string;
		damageCost: number;
		notes?: string;
	}[];
}) {
	try {
		const { checkoutItems, ...reportData } = data;

		// Create the checkout report
		const report = await prisma.checkoutReport.create({
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

		// Create checkout items and handle inventory assignments
		await Promise.all(
			checkoutItems.map(async (item) => {
				// Create checkout item - note: item.inventoryItemId is actually assignmentId
				await prisma.checkoutItem.create({
					data: {
						checkoutReportId: report.id,
						inventoryItemId: item.inventoryItemId, // This is assignment ID in the new system
						condition: item.condition,
						damageCost: item.damageCost,
						notes: item.notes,
					},
				});

				// Get the assignment to access the actual inventory item
				const assignment = await prisma.inventoryAssignment.findUnique({
					where: { id: item.inventoryItemId },
					include: { inventoryItem: true },
				});

				if (assignment) {
					// Return the assignment to stock (mark as inactive)
					await prisma.inventoryAssignment.update({
						where: { id: assignment.id },
						data: {
							isActive: false,
							returnedAt: new Date(),
							notes: item.notes || assignment.notes,
						},
					});

					// Increment the inventory item quantity (return to stock)
					// Only if item is in good condition
					if (item.condition === "good") {
						await prisma.inventoryItem.update({
							where: { id: assignment.inventoryItem.id },
							data: {
								quantity: {
									increment: 1,
								},
							},
						});

						// Create movement record for return to stock
						await prisma.inventoryMovement.create({
							data: {
								inventoryItemId: assignment.inventoryItem.id,
								fromUnitId: assignment.unitId,
								toUnitId: null, // Returning to store
								movedBy: "checkout_system",
								direction: "to_store",
								quantity: 1,
								notes: `Returned from checkout - ${item.condition} condition`,
							},
						});
					} else {
						// For damaged/missing items, don't return to stock
						// Create movement record for damaged/missing
						await prisma.inventoryMovement.create({
							data: {
								inventoryItemId: assignment.inventoryItem.id,
								fromUnitId: assignment.unitId,
								toUnitId: null, // Not returning to any unit
								movedBy: "checkout_system",
								direction:
									item.condition === "damaged"
										? "damaged"
										: "missing",
								quantity: 1,
								notes: `Checkout - ${item.condition} condition. Damage cost: KES ${item.damageCost}`,
							},
						});
					}
				}
			})
		);

		// Update booking status and set checkout date to today
		await prisma.booking.update({
			where: { id: data.bookingId },
			data: {
				status: "checked-out",
				checkOutDate: new Date(), // Set to today's date when checkout is completed
			},
		});

		revalidatePath("/inventory");
		revalidatePath("/bookings");
		revalidatePath("/booking-requests");
		revalidatePath("/guests");

		return report;
	} catch (error) {
		console.error("Error creating checkout report:", error);
		throw new Error("Failed to create checkout report");
	}
}

export async function getBookingsForCheckout() {
	try {
		const bookings = await prisma.booking.findMany({
			where: {
				status: {
					notIn: ["checked-out", "cancelled"],
				},
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

export async function getInventoryForUnit(unitId: number) {
	try {
		// Get only assignable items that are currently assigned to this unit
		const assignments = await prisma.inventoryAssignment.findMany({
			where: {
				unitId: unitId,
				isActive: true,
				inventoryItem: {
					assignableOnBooking: true, // Only show items that can be assigned to guests
				},
			},
			include: {
				inventoryItem: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		// Map assignments to include assignment details for individual tracking
		const items = assignments.map((assignment) => ({
			id: assignment.id, // Use assignment ID for individual tracking
			inventoryItemId: assignment.inventoryItem.id,
			itemName: assignment.inventoryItem.itemName,
			category: assignment.inventoryItem.category,
			status: assignment.inventoryItem.status,
			serialNumber: assignment.serialNumber,
			notes: assignment.notes,
		}));

		return items;
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
