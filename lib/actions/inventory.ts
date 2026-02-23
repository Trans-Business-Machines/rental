"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/check-permissions"
import { LIMIT } from "@/lib/utils"
import type { CategoryItemStats } from "@/lib/types/types"


/* --------------------------- INTERFACES --------------------------- */
interface GetInventoryItemsProps {
	page: number;
	search?: string;
	status?: string;
	category?: string;
}

interface GetInventoryAssignmentsProps {
	page: number,
	search?: string,
	propertyId?: string,
	unitId?: string,
	status?: string
}

/* --------------------------- SERVER ACTIONS --------------------------- */
// ============= INVENTORY ITEMS FUNCTIONS =============
export async function getInventoryItems(
	{ page = 1, category = "all", search = "", status = "all" }: GetInventoryItemsProps
) {
	try {
		// Build the where clause conditionally
		const where = {
			// search filter
			...(search && {
				itemName: { contains: search, mode: "insensitive" as const },
			}),

			// status filter
			...(status !== "all" && {
				status
			}),

			// category filter
			...(category !== "all" && {
				category
			})
		}

		const items = await prisma.inventoryItem.findMany({
			where,
			include: {
				assignments: {
					where: { isActive: true },
					select: {
						id: true,
						unit: { select: { id: true, name: true } },
						property: { select: { id: true, name: true } },
						assignedAt: true,
						serialNumber: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
			take: LIMIT,
			skip: (page - 1) * LIMIT
		});

		// Add availability info to each item
		const itemsWithAvailability = items.map((item) => ({
			...item,
			availableQuantity: item.quantity, // Store quantity is available quantity
			assignedQuantity: item.assignments.length, // Count of active assignments
			isAvailable: item.quantity > 0, // Can be assigned if quantity > 0
		}));

		// count items and calculate the total number of pages
		const totalItems = await prisma.inventoryItem.count({
			where
		});
		const totalPages = Math.ceil(totalItems / LIMIT);

		// Find the hasNext and hasPrev attributes
		const hasNext = page < totalPages;
		const hasPrev = page > 1 && page <= totalPages;

		return {
			totalPages,
			items: itemsWithAvailability,
			currentPage: page,
			hasNext,
			hasPrev
		};
	} catch (error) {
		console.error("Error fetching inventory items:", error);
		return {
			totalPages: 0,
			items: [],
			currentPage: 0,
			hasNext: false,
			hasPrev: false,
		}
	}
}

export async function getInventoryItemById(id: number) {
	try {
		const item = await prisma.inventoryItem.findUnique({
			where: { id },
			include: {
				assignments: {
					include: {
						unit: { select: { id: true, name: true } },
						property: { select: { id: true, name: true } },
					},
					orderBy: { createdAt: "desc" },
				},
			},
		});

		if (!item) return null;

		// Add availability info
		const activeAssignments = item.assignments.filter((a) => a.isActive);
		return {
			...item,
			availableQuantity: item.quantity,
			assignedQuantity: activeAssignments.length,
			isAvailable: item.quantity > 0,
		};
	} catch (error) {
		console.error("Error fetching inventory item:", error);
		throw new Error("Failed to fetch inventory item");
	}
}

export async function createInventoryItem(data: {
	category: string;
	itemName: string;
	description: string;
	quantity: number;
	purchasePrice?: number;
	currentValue?: number;
	supplier?: string;
	warrantyExpiry?: Date;
	assignableOnBooking?: boolean;
}) {
	try {
		const item = await prisma.inventoryItem.create({
			data: {
				...data,
				status: "active",
			},
		});
		revalidatePath("/inventory");
		revalidatePath("/dashboard");
		return item;
	} catch (error) {
		console.error("Error creating inventory item:", error);
		throw new Error("Failed to create inventory item");
	}
}

export async function updateInventoryItem(
	id: number,
	data: {
		category: string;
		itemName: string;
		description: string;
		purchasePrice?: number;
		currentValue?: number;
		supplier?: string;
		warrantyExpiry?: Date;
		status: string;
		assignableOnBooking?: boolean;
	}
) {
	try {
		const item = await prisma.inventoryItem.update({
			where: { id },
			data: data,
		});
		revalidatePath("/inventory");
		revalidatePath("/dashboard");
		return item;
	} catch (error) {
		console.error("Error updating inventory item:", error);
		throw new Error("Failed to update inventory item");
	}
}

export async function deleteInventoryItem(id: number) {
	try {
		await prisma.inventoryItem.delete({
			where: { id },
		});
		revalidatePath("/inventory");
		revalidatePath("/dashboard");
	} catch (error) {
		console.error("Error deleting inventory item:", error);
		throw new Error("Failed to delete inventory item");
	}
}

export async function getInventoryStatsByCategory() {
	try {

		const items = await prisma.inventoryItem.findMany({
			select: {
				id: true,
				category: true,
				quantity: true,
				assignments: {
					where: {
						isActive: true,
					},
					select: {
						id: true
					}
				}

			}

		})

		const categoryMap = new Map<
			string,
			{
				category: string;
				totalItems: number;
				assigned: number;
				available: number;
			}
		>();

		for (const item of items) {
			const existing = categoryMap.get(item.category);
			const assignedCount = item.assignments.length;
			const available = item.quantity;
			const total = available + assignedCount;

			if (existing) {
				existing.totalItems += total;
				existing.assigned += assignedCount;
				existing.available += available;
			} else {
				categoryMap.set(item.category, {
					category: item.category,
					totalItems: total,
					assigned: assignedCount,
					available: available,
				});
			}
		}


		const categoryStats = Array.from(categoryMap.values()).sort((a, b) =>
			a.category.localeCompare(b.category)
		);

		return categoryStats as CategoryItemStats;

	} catch (error) {
		console.error("Error fetching inventory stats by category:", error);
		throw error;
	}
}

export async function getInventoryMovementsForItem(itemId: number, page: number = 1) {
	try {
		const LIMIT = 30;

		const totalItemMovements = await prisma.inventoryMovement.count({
			where: {
				inventoryItemId: itemId
			}
		})


		const movements = await prisma.inventoryMovement.findMany({
			where: { inventoryItemId: itemId },
			include: {
				fromUnit: true,
				toUnit: true,
			},
			orderBy: { movedAt: "desc" },
			take: LIMIT,
			skip: (page - 1) * LIMIT
		});

		const totalPages = Math.ceil(totalItemMovements / LIMIT)
		const hasNext = page < totalPages;
		const hasPrev = page > 1 && page <= totalPages;


		return { movements, totalPages, hasNext, hasPrev };

	} catch (error) {
		console.error("Error fetching inventory movements:", error);
		throw error
	}
}

// ============= INVENTORY ASSIGNMENT FUNCTIONS =============

export async function validateAvailableQuantity(
	inventoryItemId: number,
	requestedQuantity: number = 1
) {
	try {
		const item = await prisma.inventoryItem.findUnique({
			where: { id: inventoryItemId },
			select: { quantity: true, itemName: true },
		});

		if (!item) {
			throw new Error("Inventory item not found");
		}

		if (item.quantity < requestedQuantity) {
			throw new Error(
				`Insufficient quantity. Available: ${item.quantity}, Requested: ${requestedQuantity}`
			);
		}

		return true;
	} catch (error) {
		console.error("Error validating quantity:", error);
		throw error;
	}
}

export async function createInventoryAssignment(data: {
	inventoryItemId: number;
	unitId?: number;
	propertyId?: number;
	serialNumber?: string;
	notes?: string;
}) {

	const session = await getServerSession()
	const currentUser = (session?.user?.name) || "system"

	try {
		// Use transaction to ensure atomicity
		const result = await prisma.$transaction(async (tx) => {
			// 1. Validate available quantity
			await validateAvailableQuantity(data.inventoryItemId, 1);

			// 2. Create the assignment
			const assignment = await tx.inventoryAssignment.create({
				data: {
					...data,
					isActive: true,
					assignedAt: new Date(),
				},
				include: {
					inventoryItem: true,
					unit: true,
					property: true,
				},
			});

			// 3. Decrease store quantity
			await tx.inventoryItem.update({
				where: { id: data.inventoryItemId },
				data: {
					quantity: {
						decrement: 1,
					},
				},
			});

			// 4. Create movement record
			await tx.inventoryMovement.create({
				data: {
					inventoryItemId: data.inventoryItemId,
					fromUnitId: null, // From store
					toUnitId: data.unitId || null,
					movedBy: currentUser,
					direction: "to_unit",
					quantity: 1,
					notes: `Assigned to ${data.unitId ? `unit ${data.unitId}` : "property"}`,
				},
			});

			return assignment;
		}, { timeout: 30000, maxWait: 5000, isolationLevel: "ReadCommitted" });

		revalidatePath("/inventory");
		revalidatePath("/assignments");
		revalidatePath("/dashboard");
		return result;
	} catch (error) {
		console.error("Error creating inventory assignment:", error);
		throw new Error(
			`Failed to create inventory assignment: ${error instanceof Error ? error.message : "Unknown error"}`
		);
	}
}

export async function updateInventoryAssignment(
	id: number,
	data: {
		unitId?: number;
		propertyId?: number;
		serialNumber?: string;
		notes?: string;
		isActive?: boolean;
	}
) {
	try {
		const assignment = await prisma.inventoryAssignment.update({
			where: { id },
			data: {
				...data,
				returnedAt: data.isActive === false ? new Date() : undefined,
			},
			include: {
				inventoryItem: true,
				unit: true,
				property: true,
			},
		});

		revalidatePath("/inventory");
		revalidatePath("/assignments");
		revalidatePath("/dashboard");
		return assignment;
	} catch (error) {
		console.error("Error updating inventory assignment:", error);
		throw new Error("Failed to update inventory assignment");
	}
}

export async function returnInventoryAssignment(
	assignmentId: number,
	notes?: string
) {
	const session = await getServerSession()
	const currentUser = (session?.user?.name) || "system"

	try {
		// Use transaction to ensure atomicity
		const result = await prisma.$transaction(async (tx) => {
			// 1. Get assignment details
			const assignment = await tx.inventoryAssignment.findUnique({
				where: { id: assignmentId },
				include: { inventoryItem: true, unit: true },
			});

			if (!assignment) {
				throw new Error("Assignment not found");
			}

			if (!assignment.isActive) {
				throw new Error("Assignment is already returned");
			}

			// 2. Update assignment to returned
			const updatedAssignment = await tx.inventoryAssignment.update({
				where: { id: assignmentId },
				data: {
					isActive: false,
					returnedAt: new Date(),
					notes: notes
						? `${assignment.notes || ""}\n\nReturn: ${notes}`.trim()
						: assignment.notes,
				},
				include: {
					inventoryItem: true,
					unit: true,
					property: true,
				},
			});

			// 3. Increase store quantity
			await tx.inventoryItem.update({
				where: { id: assignment.inventoryItemId },
				data: {
					quantity: {
						increment: 1,
					},
				},
			});

			// 4. Create movement record
			await tx.inventoryMovement.create({
				data: {
					inventoryItemId: assignment.inventoryItemId,
					fromUnitId: assignment.unitId,
					toUnitId: null, // To store
					movedBy: currentUser,
					direction: "to_store",
					quantity: 1,
					notes: `Returned from ${assignment.unitId ? `unit ${assignment.unitId}` : "property"}`,
				},
			});

			return updatedAssignment;
		}, { timeout: 30000, maxWait: 5000, isolationLevel: "ReadCommitted" });

		revalidatePath("/inventory");
		revalidatePath("/assignments");
		revalidatePath("/dashboard");
		return result;
	} catch (error) {
		console.error("Error returning inventory assignment:", error);
		throw new Error(
			`Failed to return inventory assignment: ${error instanceof Error ? error.message : "Unknown error"}`
		);
	}
}

export async function getInventoryAssignments(
	{ page = 1, propertyId = "all", search = "", status = "all", unitId = "", }: GetInventoryAssignmentsProps
) {
	try {

		// Build where clause conditionally
		const where = {
			...(propertyId !== "all" && propertyId !== "" && {
				propertyId: parseInt(propertyId),
			}),

			// itemName filter
			...(search !== "" && {
				inventoryItem: {
					itemName: {
						contains: search,
						mode: "insensitive" as const
					}
				}
			}),

			// unit filter
			...(unitId !== "" && {
				unitId: parseInt(unitId)
			}),

			...(status !== "all" && {
				isActive: status === "true",
			}),

		}


		const assignments = await prisma.inventoryAssignment.findMany({
			where,
			include: {
				inventoryItem: true,
				unit: true,
				property: true,
			},
			orderBy: {
				createdAt: "desc",
			},
			take: LIMIT,
			skip: (page - 1) * LIMIT
		});

		// count the  assignments and calcualte the totalPages
		const totalAssignments = await prisma.inventoryAssignment.count({
			where
		});
		const totalPages = Math.ceil(totalAssignments / LIMIT);

		// Evaluate hasNext and hasPrev attributes
		const hasNext = page < totalPages;
		const hasPrev = page > 1 && page <= totalPages;


		return { totalPages, totalAssignments, assignments, currentPage: page, hasNext, hasPrev };
	} catch (error) {
		console.error("Error fetching inventory assignments:", error);
		return {
			totalPages: 0,
			totalAssignments: 0,
			assignments: [],
			currentPage: 0,
			hasNext: false,
			hasPrev: false
		}
	}
}

export async function getAssignmentsByUnit(unitId: number) {
	try {
		const assignments = await prisma.inventoryAssignment.findMany({
			where: {
				unitId,
				isActive: true, // Only active assignments
			},
			include: {
				inventoryItem: true,
				unit: true,
				property: true,
			},
			orderBy: {
				assignedAt: "desc",
			},
		});
		return assignments;
	} catch (error) {
		console.error("Error fetching assignments by unit:", error);
		throw new Error("Failed to fetch assignments by unit");
	}
}

export async function getAssignmentStats() {
	try {
		const totalAssignments = await prisma.inventoryAssignment.count();
		const activeAssignments = await prisma.inventoryAssignment.count({
			where: { isActive: true },
		});
		const returnedAssignments = await prisma.inventoryAssignment.count({
			where: { isActive: false },
		});
		const overdueAssignments = await prisma.inventoryAssignment.count({
			where: {
				isActive: true,
				assignedAt: {
					lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
				},
			},
		});

		return {
			total: totalAssignments,
			active: activeAssignments,
			returned: returnedAssignments,
			overdue: overdueAssignments,
		};
	} catch (error) {
		console.error("Error fetching assignment stats:", error);
		return {
			total: 0,
			active: 0,
			returned: 0,
			overdue: 0,
		};
	}
}

export async function getInventoryItemsWithAvailability() {
	try {
		const items = await prisma.inventoryItem.findMany({
			where: {
			},
			include: {
				assignments: {
					where: { isActive: true },
					select: { id: true },
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		// Add availability info to each item
		const itemsWithAvailability = items.map((item) => ({
			...item,
			availableQuantity: item.quantity,
			assignedQuantity: item.assignments.length,
			isAvailable: item.quantity > 0,
		}));

		return itemsWithAvailability;
	} catch (error) {
		console.error(
			"Error fetching inventory items with availability:",
			error
		);
		throw new Error("Failed to fetch inventory items with availability");
	}
}

export async function getAllUnitsForAssignment() {
	try {
		const units = await prisma.unit.findMany({
			include: {
				property: {
					select: { id: true, name: true },
				},
			},
			orderBy: [{ property: { name: "asc" } }, { name: "asc" }],
		});

		// Format units for dropdown: "PropertyX - Unit1"
		const formattedUnits = units.map((unit) => ({
			id: unit.id,
			propertyId: unit.propertyId,
			name: unit.name,
			propertyName: unit.property.name,
			displayName: `${unit.property.name} - ${unit.name}`,
			value: `${unit.propertyId}-${unit.id}`, // For form handling
		}));

		return formattedUnits;
	} catch (error) {
		console.error("Error fetching units for assignment:", error);
		throw new Error("Failed to fetch units for assignment");
	}
}
