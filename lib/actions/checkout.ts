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

		// Create checkout items and update inventory status
		await Promise.all(
			checkoutItems.map(async (item) => {
				// Create checkout item
				await prisma.checkoutItem.create({
					data: {
						checkoutReportId: report.id,
						inventoryItemId: item.inventoryItemId,
						condition: item.condition,
						damageCost: item.damageCost,
						notes: item.notes,
					},
				});

				// Update inventory item status based on condition
				let newStatus = "active";
				if (item.condition === "damaged") {
					newStatus = "damaged";
				} else if (item.condition === "missing") {
					newStatus = "missing";
				}

				await prisma.inventoryItem.update({
					where: { id: item.inventoryItemId },
					data: {
						status: newStatus,
						lastInspected: new Date(),
					},
				});
			})
		);

		// Update booking status
		await prisma.booking.update({
			where: { id: data.bookingId },
			data: { status: "checked-out" },
		});

		revalidatePath("/inventory");
		revalidatePath("/bookings");
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
		const inventory = await prisma.inventoryItem.findMany({
			where: { unitId },
			include: {
				property: true,
				unit: true,
			},
			orderBy: {
				category: "asc",
			},
		});
		return inventory;
	} catch (error) {
		console.error("Error fetching inventory for unit:", error);
		return [];
	}
}

export async function updateInventoryItemStatus(
	id: number,
	status: string,
	notes?: string
) {
	try {
		// First get the current item to access existing notes
		const currentItem = await prisma.inventoryItem.findUnique({
			where: { id },
		});

		const updatedNotes = notes
			? `${currentItem?.notes || ""}\n${notes}`.trim()
			: currentItem?.notes;

		const item = await prisma.inventoryItem.update({
			where: { id },
			data: {
				status,
				notes: updatedNotes,
				lastInspected: new Date(),
			},
		});
		revalidatePath("/inventory");
		return item;
	} catch (error) {
		console.error("Error updating inventory item status:", error);
		throw new Error("Failed to update inventory item status");
	}
}
