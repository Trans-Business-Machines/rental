"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession, requirePermission } from "../check-permissions";
import { LIMIT } from "@/lib/utils"
import { categoryRules } from "@/lib/inventory-categories";
import { Prisma } from "@/prisma/generated/client";
import type {
	InventoryCategory,
	IssueType,
	UnitOfMeasure,
} from "@/prisma/generated/client";

interface GetCheckoutReportsProps {
	page: number
	search?: string,
	sortOrder?: "none" | "asc" | "desc";
}

/** One row per item still out in the unit, for the inspection checklist. */
export type AggregatedAssignment = {
	itemId: string;
	itemName: string;
	category: InventoryCategory;
	unitOfMeasure: UnitOfMeasure;
	/** Assigned minus returned, summed across the item's open assignments. */
	totalQuantity: number;
};

type CheckoutData = {
	bookingId: number;
	guestId: number;
	checkoutDate: Date;
	inspector: string;
	overallDamageCost: number;
	notes?: string;
	/** Per item; anything not flagged damaged or missing is assumed fine. */
	checkoutItems: {
		itemId: string;
		damagedCount: number;
		missingCount: number;
	}[];
}

/** Statuses where stock is still out in the unit and expected back. */
const OUTSTANDING_STATUSES = ["active", "partial"] as const;

/**
 * A problem the inspector can fix (stale page, over-count). Thrown inside
 * the transaction so it rolls back, then returned as a failure message.
 */
class CheckoutError extends Error { }

const REPORT_INCLUDE = {
	booking: {
		include: {
			guest: true,
			property: true,
			unit: true,
		},
	},
	guest: true,
	issues: {
		select: {
			id: true,
			issueType: true,
			quantityAffected: true,
			status: true,
			inventoryItem: {
				select: { id: true, itemName: true, unitOfMeasure: true },
			},
		},
		orderBy: { reportedAt: "asc" },
	},
} satisfies Prisma.CheckoutReportInclude;

type RawReport = Prisma.CheckoutReportGetPayload<{ include: typeof REPORT_INCLUDE }>;

/** Decimals can't cross to client components, so flatten them to numbers. */
function serializeReport(report: RawReport) {
	return {
		...report,
		issues: report.issues.map((issue) => ({
			...issue,
			quantityAffected: issue.quantityAffected.toNumber(),
		})),
	};
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
			include: REPORT_INCLUDE,
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
			reports: reports.map(serializeReport),
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
			include: REPORT_INCLUDE,
		});
		return report ? serializeReport(report) : null;
	} catch (error) {
		console.error("Error fetching checkout report:", error);
		return null;
	}
}

export async function createCheckoutReport(
	data: CheckoutData
): Promise<{ success: boolean; message: string }> {
	try {
		// Check if current user can checkout a guest
		await requirePermission("guest", "check-out");

		// Issues record who raised them.
		const session = await getServerSession();
		const userId = session?.user?.id;
		if (!userId) {
			throw new Error("Unauthorized: Insufficent permissions.");
		}

		const { checkoutItems, ...reportData } = data;
		const actualCheckoutDate = new Date();

		const flaggedItems = checkoutItems.filter(
			(item) => item.damagedCount > 0 || item.missingCount > 0
		);

		for (const item of flaggedItems) {
			if (
				!Number.isInteger(item.damagedCount) ||
				!Number.isInteger(item.missingCount) ||
				item.damagedCount < 0 ||
				item.missingCount < 0
			) {
				throw new CheckoutError("Damaged and missing counts must be whole numbers.");
			}
		}

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

				const guestName = `${report.guest.firstName} ${report.guest.lastName}`;
				const unitName = report.booking.unit.name;

				/**
				 * 2. Raise an issue for each damaged/missing item.
				 *
				 * The checklist shows one row per item, but the stock sits in
				 * one or more assignments. Spread the counts across them,
				 * oldest first, never exceeding what each still has out.
				 *
				 * No stock moves here — same rule as reportItemIssue: assigned
				 * stock already left the store, and closing the assignment
				 * settles the write-off.
				 */
				for (const item of flaggedItems) {
					const assignments = await tx.inventoryAssignment.findMany({
						where: {
							unitId: report.booking.unitId,
							inventoryItemId: item.itemId,
							status: { in: [...OUTSTANDING_STATUSES] },
						},
						include: {
							inventoryItem: {
								select: { itemName: true, category: true, unitOfMeasure: true },
							},
						},
						orderBy: { assignedAt: "asc" },
					});

					if (assignments.length === 0) {
						throw new CheckoutError(
							`One of the flagged items is no longer assigned to ${unitName}. Reload the page and inspect again.`
						);
					}

					const { itemName, category, unitOfMeasure } = assignments[0].inventoryItem;

					if (!categoryRules(category).canReportIssue) {
						throw new CheckoutError(
							`Issues aren't tracked for ${itemName}, so it can't be flagged at checkout.`
						);
					}

					const capacity = assignments.map((a) => ({
						id: a.id,
						remaining: a.quantity.sub(a.returnedQuantity),
					}));

					const totalOut = capacity.reduce(
						(sum, c) => sum.add(c.remaining),
						new Prisma.Decimal(0)
					);

					if (totalOut.lessThan(item.damagedCount + item.missingCount)) {
						throw new CheckoutError(
							`Only ${totalOut} ${unitOfMeasure} of ${itemName} are out in ${unitName}. Reload the page and inspect again.`
						);
					}

					const raise = async (issueType: IssueType, count: number) => {
						let left = new Prisma.Decimal(count);

						for (const slot of capacity) {
							if (left.lessThanOrEqualTo(0)) break;
							if (slot.remaining.lessThanOrEqualTo(0)) continue;

							const take = Prisma.Decimal.min(left, slot.remaining);

							await tx.itemIssue.create({
								data: {
									inventoryItemId: item.itemId,
									assignmentId: slot.id,
									checkoutReportId: report.id,
									issueType,
									quantityAffected: take,
									description: `${issueType === "damaged" ? "Found damaged" : "Found missing"} at checkout of ${guestName} from ${unitName}.`,
									reportedById: userId,
									status: "open",
									resolution: "pending",
								},
							});

							slot.remaining = slot.remaining.sub(take);
							left = left.sub(take);
						}
					};

					await raise("damaged", item.damagedCount);
					await raise("missing", item.missingCount);
				}

				// 3. Update booking status
				await tx.booking.update({
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
					where: { id: report.booking.propertyId },
					data: {
						occupied: {
							decrement: 1
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

		const issuesRaised = flaggedItems.length > 0
			? " Damaged and missing items have been logged as issues in Inventory."
			: "";

		return {
			success: true,
			message: `${result.guest.firstName} ${result.guest.lastName} checked out successfully.${issuesRaised}`
		};
	} catch (error) {
		console.error("Error creating checkout report:", error);

		// Returned rather than thrown: Next.js strips thrown error messages
		// from server actions in production.
		if (error instanceof CheckoutError) {
			return { success: false, message: error.message };
		}

		if (error instanceof Error && error.message.includes("Unauthorized: Insufficent permissions.")) {
			return { success: false, message: error.message };
		}

		return { success: false, message: "Failed to checkout guest, please try again." };
	}
}

/**
 * What the inspector needs to check: items still out in the unit that are
 * expected back. Consumables and laundry are excluded — nothing to return.
 */
export async function getInventoryAssignmentsForUnit(
	unitId: number
): Promise<AggregatedAssignment[]> {
	try {
		const assignments = await prisma.inventoryAssignment.findMany({
			where: {
				unitId,
				status: { in: [...OUTSTANDING_STATUSES] },
				inventoryItem: { deletedAt: null },
			},
			select: {
				quantity: true,
				returnedQuantity: true,
				inventoryItem: {
					select: {
						id: true,
						itemName: true,
						category: true,
						unitOfMeasure: true,
					},
				},
			},
		});

		// Group by item, summing what's still out rather than counting rows.
		const grouped = new Map<
			string,
			Omit<AggregatedAssignment, "totalQuantity"> & { totalQuantity: Prisma.Decimal }
		>();

		for (const assignment of assignments) {
			const { id: itemId, itemName, category, unitOfMeasure } = assignment.inventoryItem;

			if (!categoryRules(category).expectsReturn) continue;

			const outstanding = assignment.quantity.sub(assignment.returnedQuantity);
			const existing = grouped.get(itemId);

			if (existing) {
				existing.totalQuantity = existing.totalQuantity.add(outstanding);
			} else {
				grouped.set(itemId, {
					itemId,
					itemName,
					category,
					unitOfMeasure,
					totalQuantity: outstanding,
				});
			}
		}

		return Array.from(grouped.values())
			.filter((row) => row.totalQuantity.greaterThan(0))
			.map((row) => ({ ...row, totalQuantity: row.totalQuantity.toNumber() }))
			.sort(
				(a, b) =>
					a.category.localeCompare(b.category) ||
					a.itemName.localeCompare(b.itemName)
			);
	} catch (error) {
		console.error("Error fetching inventory for unit:", error);
		return [];
	}
}
