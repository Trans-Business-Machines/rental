"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession, requirePermission } from "@/lib/check-permissions";
import { LIMIT } from "@/lib/utils";
import {
	INVENTORY_CATEGORIES,
	CONSUMABLE_CATEGORIES,
	USAGE_TRACKED_CATEGORIES,
	categoryRules,
} from "@/lib/inventory-categories";
import type {
	InventoryCategory,
	UnitOfMeasure,
	IssueType,
	IssueResolution,
} from "@/prisma/generated/client";
import { Prisma } from "@/prisma/generated/client";
import { redirect } from "next/navigation";


export type ActionErrorCode =
	| "unauthenticated"
	| "forbidden"
	| "not_found"
	| "validation"
	| "conflict"
	| "insufficient_stock"
	| "not_permitted_for_category"
	| "has_history"
	| "unexpected";

export type ActionResult<T = undefined> =
	| { success: true; message: string; data: T }
	| {
		success: false;
		message: string;
		nextStep?: string;
		code: ActionErrorCode;
	};

/**
 * Thrown internally so that `prisma.$transaction` rolls back, then
 * converted to a failure result at the action boundary.
 *
 * IMPORTANT: never `return` a failure object from inside a transaction
 * callback. Prisma only rolls back on a thrown error, so returning
 * would COMMIT the partial work.
 */
class ActionError extends Error {
	constructor(
		message: string,
		readonly code: ActionErrorCode = "validation",
		readonly nextStep?: string,
	) {
		super(message);
		this.name = "ActionError";
	}
}

function fail(
	message: string,
	code: ActionErrorCode = "validation",
	nextStep?: string,
) {
	return new ActionError(message, code, nextStep);
}

function ok<T>(message: string, data: T): ActionResult<T> {
	return { success: true, message, data };
}

/**
 * next/navigation's redirect() and notFound() signal by throwing. If we
 * swallowed them here the user would silently stay on the page instead
 * of being sent to /login, so they are re-thrown untouched.
 */
function isNextControlFlowError(error: unknown) {
	const digest = (error as { digest?: unknown })?.digest;
	return (
		typeof digest === "string" &&
		(digest.startsWith("NEXT_REDIRECT") || digest === "NEXT_NOT_FOUND")
	);
}

function handleError(error: unknown, context: string): ActionResult<never> {
	if (isNextControlFlowError(error)) throw error;

	console.error(`[inventory] ${context}:`, error);

	if (error instanceof ActionError) {
		return {
			success: false,
			message: error.message,
			nextStep: error.nextStep,
			code: error.code,
		};
	}

	// Permission helpers throw plain Errors; surface them as forbidden.
	if (
		error instanceof Error &&
		/permission|forbidden|unauthor/i.test(error.message)
	) {
		return {
			success: false,
			message: "You don't have permission to do that.",
			nextStep: "Ask an administrator to grant you access.",
			code: "forbidden",
		};
	}

	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		switch (error.code) {
			case "P2002":
				return {
					success: false,
					message: "An item with that name already exists at this property.",
					nextStep: "Choose a different name, or edit the existing item.",
					code: "conflict",
				};
			case "P2003":
				return {
					success: false,
					message: "That record is still linked to inventory history.",
					nextStep: "Archive it instead of deleting it.",
					code: "conflict",
				};
			case "P2025":
				return {
					success: false,
					message: "That record no longer exists.",
					nextStep: "Refresh the page and try again.",
					code: "not_found",
				};
		}
	}

	// Raised by the CHECK constraints (availableQuantity >= 0, returned bounds).
	if (
		error instanceof Error &&
		/chk_available_qty|chk_returned_not_exceeding|23514/i.test(error.message)
	) {
		return {
			success: false,
			message: "That change would put the stock balance into an invalid state.",
			nextStep: "Refresh to see current figures, then try a smaller quantity.",
			code: "insufficient_stock",
		};
	}

	return {
		success: false,
		message: "Something went wrong and the change was not saved.",
		nextStep: "Try again. If it keeps happening, contact your administrator.",
		code: "unexpected",
	};
}

/* ------------------------------------------------------------------ *
 * CATEGORY BEHAVIOUR — rules live in lib/inventory-categories.ts.
 * ------------------------------------------------------------------ */

export async function getCategoryRules(category: InventoryCategory) {
	return categoryRules(category);
}

/* ------------------------------------------------------------------ *
 * HELPERS
 * ------------------------------------------------------------------ */

/** Collapse whitespace and trim so " Bath  towels " can't bypass @@unique. */
function normalizeName(name: string) {
	return name.trim().replace(/\s+/g, " ");
}

function toDecimal(value: number | string, label = "Quantity") {
	const d = new Prisma.Decimal(value);
	if (d.isNaN() || !d.isFinite()) {
		throw fail(
			`${label} is not a valid number.`,
			"validation",
			"Enter a numeric value.",
		);
	}
	return d;
}

/** Positive-quantity guard shared by every write path. */
function requirePositive(d: Prisma.Decimal, label: string, nextStep?: string) {
	if (d.lessThanOrEqualTo(0)) {
		throw fail(`${label} must be greater than zero.`, "validation", nextStep);
	}
	return d;
}

async function requireUserId() {
	const session = await getServerSession();
	const userId = session?.user?.id;
	if (!userId) {
		// Throws NEXT_REDIRECT; handleError re-throws it rather than
		// converting it into a failure result.
		redirect("/login");
	}
	return userId;
}

/**
 * serializeItem converts top-level Decimals to numbers at runtime, so
 * the return type has to say so — otherwise every caller still sees
 * Decimal and has to cast.
 */
type Decimalized<T> = {
	[K in keyof T]: T[K] extends Prisma.Decimal
	? number
	: T[K] extends Prisma.Decimal | null
	? number | null
	: T[K];
};

function serializeItem<T extends Record<string, unknown>>(
	item: T,
): Decimalized<T> {
	const out: Record<string, unknown> = { ...item };
	for (const [key, value] of Object.entries(out)) {
		// isDecimal, not instanceof: in dev the PrismaClient cached on
		// globalThis outlives HMR, so its Decimals come from a stale copy of
		// the class and instanceof silently misses them.
		if (Prisma.Decimal.isDecimal(value)) out[key] = value.toNumber();
	}
	return out as Decimalized<T>;
}

/* ------------------------------------------------------------------ *
 * STOCK MUTATION PRIMITIVES
 *
 * Every balance change goes through one of these two. They are the
 * only place availableQuantity is written. They throw rather than
 * returning a result, because they run inside prisma.$transaction.
 * ------------------------------------------------------------------ */

/**
 * Atomic guarded decrement. The `gte` in the where clause means the
 * check and the write are a single statement — two concurrent callers
 * cannot both pass.
 */
async function decrementStock(
	tx: Prisma.TransactionClient,
	itemId: string,
	quantity: Prisma.Decimal,
) {
	const result = await tx.inventoryItem.updateMany({
		where: { id: itemId, availableQuantity: { gte: quantity } },
		data: { availableQuantity: { decrement: quantity } },
	});

	if (result.count === 0) {
		const item = await tx.inventoryItem.findUnique({
			where: { id: itemId },
			select: { itemName: true, availableQuantity: true, unitOfMeasure: true },
		});

		if (!item) {
			throw fail(
				"That inventory item no longer exists.",
				"not_found",
				"Refresh the page and try again.",
			);
		}

		throw fail(
			`Not enough ${item.itemName} in the store. ` +
			`${item.availableQuantity} ${item.unitOfMeasure} available, ` +
			`${quantity} ${item.unitOfMeasure} requested.`,
			"insufficient_stock",
			`Restock ${item.itemName}, or reduce the quantity to ${item.availableQuantity} ${item.unitOfMeasure} or less.`,
		);
	}
}

async function incrementStock(
	tx: Prisma.TransactionClient,
	itemId: string,
	quantity: Prisma.Decimal,
) {
	await tx.inventoryItem.update({
		where: { id: itemId },
		data: { availableQuantity: { increment: quantity } },
	});
}

/** Still physically in the unit: neither returned nor written off. */
function outstandingOf(a: {
	quantity: Prisma.Decimal;
	returnedQuantity: Prisma.Decimal;
	writtenOffQuantity: Prisma.Decimal;
}) {
	return a.quantity.sub(a.returnedQuantity).sub(a.writtenOffQuantity);
}

/**
 * Stock in a unit that open issues have a claim on. It can't be returned
 * or reported again until those issues are resolved, or the same towel
 * could be both back in the store and written off.
 */
function openIssueQuantity(issues: { quantityAffected: Prisma.Decimal }[]) {
	return issues.reduce(
		(sum, i) => sum.add(i.quantityAffected),
		new Prisma.Decimal(0),
	);
}

/** Select for the open issues on an assignment, used with openIssueQuantity. */
const OPEN_ISSUES_SELECT = {
	where: { status: "open" },
	select: { quantityAffected: true },
} satisfies Prisma.InventoryAssignment$issuesArgs;

/**
 * Write off part of an assignment. The items are gone from the unit for
 * good; no stock moves because they already left the store when they
 * were assigned. Closes the assignment once nothing is left out.
 *
 * Only called while resolving an issue — every write-off starts as one.
 */
async function writeOffFromAssignment(
	tx: Prisma.TransactionClient,
	assignmentId: string,
	quantity: Prisma.Decimal,
	note: string,
) {
	const assignment = await tx.inventoryAssignment.findUniqueOrThrow({
		where: { id: assignmentId },
	});

	// Settled before writtenOffQuantity existed — nothing left to write off.
	if (assignment.status === "closed" || assignment.status === "issued") {
		return { writtenOff: new Prisma.Decimal(0), stillOut: new Prisma.Decimal(0) };
	}

	const outstanding = outstandingOf(assignment);
	// Older issues weren't capped against other open issues, so never
	// write off more than is actually still out.
	const writingOff = Prisma.Decimal.min(quantity, outstanding);
	const stillOut = outstanding.sub(writingOff);
	const closing = stillOut.isZero();

	await tx.inventoryAssignment.update({
		where: { id: assignment.id },
		data: {
			writtenOffQuantity: assignment.writtenOffQuantity.add(writingOff),
			status: closing ? "closed" : "partial",
			returnedAt: closing ? new Date() : assignment.returnedAt,
			notes: `${assignment.notes ?? ""}\nWritten off ${writingOff}: ${note}`.trim(),
		},
	});

	return { writtenOff: writingOff, stillOut };
}

const TX_OPTS = {
	timeout: 30000,
	maxWait: 5000,
	isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
} as const;

/* ------------------------------------------------------------------ *
 * READS
 *
 * Reads keep their existing shapes so page components don't have to
 * unwrap a result object just to render a list.
 * ------------------------------------------------------------------ */

interface GetInventoryItemsProps {
	page?: number;
	search?: string;
	status?: string;
	category?: string;
	propertyId?: number;
	lowStockOnly?: boolean;
}

export async function getInventoryItems({
	page = 1,
	category = "all",
	search = "",
	status = "all",
	propertyId,
	lowStockOnly = false,
}: GetInventoryItemsProps) {
	try {


		await requirePermission("inventory", "read");

		const where: Prisma.InventoryItemWhereInput = {
			deletedAt: null,
			...(propertyId && { propertyId }),
			...(search && {
				itemName: { contains: search, mode: "insensitive" as const },
			}),
			...(status !== "all" && {
				status: status as Prisma.EnumInventoryItemStatusFilter["equals"],
			}),
			...(category !== "all" && { category: category as InventoryCategory }),
			// Compares two columns on the same row — Prisma field reference.
			...(lowStockOnly && {
				availableQuantity: { lte: prisma.inventoryItem.fields.restockAt },
			}),
		};

		const [rows, totalItems] = await Promise.all([
			prisma.inventoryItem.findMany({
				where,
				include: {
					property: { select: { id: true, name: true } },
					assignments: {
						where: { status: { in: ["active", "partial"] } },
						select: {
							id: true,
							quantity: true,
							returnedQuantity: true,
							writtenOffQuantity: true,
							unit: { select: { id: true, name: true } },
							issues: OPEN_ISSUES_SELECT,
						},
					},
					_count: {
						select: {
							issues: { where: { status: "open" } },
							restocks: true,
							assignments: true,
							usageLogs: true,
						},
					},
				},
				// Newest first; id breaks ties so pagination stays stable.
				orderBy: [{ createdAt: "desc" }, { id: "desc" }],
				take: LIMIT,
				skip: (page - 1) * LIMIT,
			}),
			prisma.inventoryItem.count({ where }),
		]);

		const items = rows
			.map((item) => {
				// Outstanding = still physically in units.
				const outstanding = item.assignments.reduce(
					(sum, a) => sum.add(outstandingOf(a)),
					new Prisma.Decimal(0),
				);

				return {
					...serializeItem(item),
					availableQuantity: item.availableQuantity.toNumber(),
					restockAt: item.restockAt.toNumber(),
					assignedQuantity: outstanding.toNumber(),
					totalOwned: item.availableQuantity.add(outstanding).toNumber(),
					openIssueCount: item._count.issues,
					hasHistory:
						item._count.restocks > 0 ||
						item._count.assignments > 0 ||
						item._count.usageLogs > 0,
					needsRestock: item.availableQuantity.lte(item.restockAt),
					rules: categoryRules(item.category),
					assignments: item.assignments.map(({ issues, ...a }) => ({
						...a,
						quantity: a.quantity.toNumber(),
						returnedQuantity: a.returnedQuantity.toNumber(),
						writtenOffQuantity: a.writtenOffQuantity.toNumber(),
						// What a new issue can still be raised against.
						reportableQuantity: outstandingOf(a)
							.sub(openIssueQuantity(issues))
							.toNumber(),
					})),
				};
			})


		const totalPages = Math.ceil(totalItems / LIMIT);

		return {
			items,
			totalPages,
			currentPage: page,
			hasNext: page < totalPages,
			hasPrev: page > 1 && page <= totalPages,
		};
	} catch (error) {
		if (isNextControlFlowError(error)) throw error;
		console.error("[inventory] fetching items:", error);
		return {
			items: [],
			totalPages: 0,
			currentPage: 0,
			hasNext: false,
			hasPrev: false,
		};
	}
}

export async function getInventoryItemById(id: string) {
	try {
		await requirePermission("inventory", "read");

		const item = await prisma.inventoryItem.findUnique({
			where: { id },
			include: {
				property: { select: { id: true, name: true } },
				assignments: {
					include: {
						unit: { select: { id: true, name: true } },
						assignedBy: { select: { id: true, name: true } },
						issues: OPEN_ISSUES_SELECT,
					},
					orderBy: { assignedAt: "desc" },
				},
				restocks: {
					include: { receivedBy: { select: { id: true, name: true } } },
					orderBy: { receivedAt: "desc" },
					take: 20,
				},
				issues: {
					include: {
						assignment: {
							select: {
								id: true,
								unit: { select: { id: true, name: true } },
							},
						},
						reportedBy: { select: { id: true, name: true } },
						resolvedBy: { select: { id: true, name: true } },
					},
					orderBy: { reportedAt: "desc" },
				},
				usageLogs: {
					include: { usedBy: { select: { id: true, name: true } } },
					orderBy: { usedAt: "desc" },
					take: 20,
				},
			},
		});

		if (!item || item.deletedAt) return null;

		const outstanding = item.assignments
			.filter((a) => a.status === "active" || a.status === "partial")
			.reduce((sum, a) => sum.add(outstandingOf(a)), new Prisma.Decimal(0));

		return {
			...serializeItem(item),
			availableQuantity: item.availableQuantity.toNumber(),
			restockAt: item.restockAt.toNumber(),
			assignedQuantity: outstanding.toNumber(),
			totalOwned: item.availableQuantity.add(outstanding).toNumber(),
			needsRestock: item.availableQuantity.lte(item.restockAt),
			rules: await getCategoryRules(item.category),
			assignments: item.assignments.map(({ issues, ...a }) => ({
				...serializeItem(a),
				outstandingQuantity: outstandingOf(a).toNumber(),
				// What a new issue can still be raised against.
				reportableQuantity: outstandingOf(a)
					.sub(openIssueQuantity(issues))
					.toNumber(),
			})),
			restocks: item.restocks.map(serializeItem),
			issues: item.issues.map(serializeItem),
			usageLogs: item.usageLogs.map(serializeItem),
		};
	} catch (error) {
		if (isNextControlFlowError(error)) throw error;
		console.error("[inventory] fetching item:", error);
		return null;
	}
}

/**
 * Unified movement history for one item, replacing
 * getInventoryMovementsForItem. Merges the four log sources into a
 * single chronological feed.
 */
export async function getItemHistory(itemId: string) {
	try {
		await requirePermission("inventory", "read");

		const [restocks, assignments, issues, usage] = await Promise.all([
			prisma.restockLog.findMany({
				where: { inventoryItemId: itemId },
				include: { receivedBy: { select: { name: true } } },
				orderBy: { receivedAt: "desc" },
			}),
			prisma.inventoryAssignment.findMany({
				where: { inventoryItemId: itemId },
				include: {
					unit: { select: { name: true } },
					assignedBy: { select: { name: true } },
				},
				orderBy: { assignedAt: "desc" },
			}),
			prisma.itemIssue.findMany({
				where: { inventoryItemId: itemId },
				include: {
					reportedBy: { select: { name: true } },
					resolvedBy: { select: { name: true } },
				},
				orderBy: { reportedAt: "desc" },
			}),
			prisma.usageLog.findMany({
				where: { inventoryItemId: itemId },
				include: { usedBy: { select: { name: true } } },
				orderBy: { usedAt: "desc" },
			}),
		]);

		return [
			...restocks.map((r) => ({
				type: "restock" as const,
				at: r.receivedAt,
				quantity: r.quantity.toNumber(),
				actor: r.receivedBy.name,
				detail: r.notes ?? "Stock received",
			})),
			...assignments.map((a) => ({
				type: "assignment" as const,
				at: a.assignedAt,
				quantity: -a.quantity.toNumber(),
				actor: a.assignedBy.name,
				detail: `Issued to ${a.unit.name}`,
			})),
			...issues.map((i) => ({
				type: "issue" as const,
				at: i.reportedAt,
				// Assigned issues move no stock; store issues deduct at report.
				quantity: i.assignmentId ? 0 : -i.quantityAffected.toNumber(),
				actor: i.reportedBy.name,
				detail: `${i.issueType}: ${i.description}`,
			})),
			...usage.map((u) => ({
				type: "usage" as const,
				at: u.usedAt,
				quantity: -u.quantityUsed.toNumber(),
				actor: u.usedBy.name,
				detail: u.notes ?? "Laundry usage",
			})),
		].sort((a, b) => b.at.getTime() - a.at.getTime());
	} catch (error) {
		if (isNextControlFlowError(error)) throw error;
		console.error("[inventory] fetching item history:", error);
		return [];
	}
}

export async function getInventoryStatsByCategory(propertyId?: number) {
	try {
		await requirePermission("inventory", "read");

		const items = await prisma.inventoryItem.findMany({
			where: { deletedAt: null, ...(propertyId && { propertyId }) },
			select: {
				category: true,
				availableQuantity: true,
				restockAt: true,
				assignments: {
					where: { status: { in: ["active", "partial"] } },
					select: {
						quantity: true,
						returnedQuantity: true,
						writtenOffQuantity: true,
					},
				},
			},
		});

		// Seed every category so the carousel shows a card for each one,
		// even before anything has been stocked under it.
		const map = new Map<
			string,
			{
				category: string;
				totalItems: number;
				assigned: number;
				available: number;
				lowStock: number;
			}
		>(
			INVENTORY_CATEGORIES.map((category) => [
				category,
				{ category, totalItems: 0, assigned: 0, available: 0, lowStock: 0 },
			]),
		);

		for (const item of items) {
			const outstanding = item.assignments.reduce(
				(sum, a) => sum.add(outstandingOf(a)),
				new Prisma.Decimal(0),
			);

			const existing = map.get(item.category) ?? {
				category: item.category,
				totalItems: 0,
				assigned: 0,
				available: 0,
				lowStock: 0,
			};

			existing.available += item.availableQuantity.toNumber();
			existing.assigned += outstanding.toNumber();
			existing.totalItems += item.availableQuantity.add(outstanding).toNumber();
			if (item.availableQuantity.lte(item.restockAt)) existing.lowStock += 1;

			map.set(item.category, existing);
		}

		return Array.from(map.values()).sort((a, b) =>
			a.category.localeCompare(b.category),
		);
	} catch (error) {
		if (isNextControlFlowError(error)) throw error;
		console.error("[inventory] fetching category stats:", error);
		return [];
	}
}

export async function getOpenIssues(propertyId?: number) {
	try {
		await requirePermission("inventory", "read");

		const issues = await prisma.itemIssue.findMany({
			where: {
				status: "open",
				inventoryItem: { deletedAt: null, ...(propertyId && { propertyId }) },
			},
			include: {
				inventoryItem: {
					select: {
						id: true,
						itemName: true,
						unitOfMeasure: true,
						property: { select: { name: true } },
					},
				},
				assignment: { include: { unit: { select: { name: true } } } },
				reportedBy: { select: { id: true, name: true } },
			},
			orderBy: { reportedAt: "asc" },
		});

		return issues.map(serializeItem);
	} catch (error) {
		if (isNextControlFlowError(error)) throw error;
		console.error("[inventory] fetching open issues:", error);
		return [];
	}
}

/** Feeds the sidebar badge, so it stays a single cheap count. */
export async function getOpenIssueCount() {
	try {
		await requirePermission("inventory", "read");

		return await prisma.itemIssue.count({
			where: { status: "open", inventoryItem: { deletedAt: null } },
		});
	} catch (error) {
		if (isNextControlFlowError(error)) throw error;
		// Roles without inventory access just see no badge.
		return 0;
	}
}

/* ------------------------------------------------------------------ *
 * WRITE PATH 1 — CREATE / REVIVE ITEM
 * ------------------------------------------------------------------ */

interface CreateItemInput {
	propertyId: number;
	category: InventoryCategory;
	itemName: string;
	description?: string;
	unitOfMeasure: UnitOfMeasure;
	restockAt?: number;
	unitCost?: number;
	/** Opening stock. Written as a RestockLog so the ledger reconciles. */
	openingQuantity?: number;
}

export async function createInventoryItem(
	data: CreateItemInput,
): Promise<ActionResult<{ id: string; itemName: string; revived: boolean }>> {
	try {
		await requirePermission("inventory", "create");
		const userId = await requireUserId();

		const itemName = normalizeName(data.itemName);
		if (!itemName) {
			throw fail(
				"An item name is required.",
				"validation",
				"Enter a name such as \u201CBath towels\u201D.",
			);
		}

		const opening = toDecimal(data.openingQuantity ?? 0, "Opening quantity");
		if (opening.isNegative()) {
			throw fail(
				"Opening quantity cannot be negative.",
				"validation",
				"Enter zero or a positive amount.",
			);
		}

		const result = await prisma.$transaction(async (tx) => {
			const existing = await tx.inventoryItem.findUnique({
				where: {
					propertyId_itemName: { propertyId: data.propertyId, itemName },
				},
			});

			if (existing && !existing.deletedAt) {
				throw fail(
					`\u201C${itemName}\u201D is already in this property's inventory.`,
					"conflict",
					"Open the existing item to restock or edit it.",
				);
			}

			let item;

			if (existing?.deletedAt) {
				/**
				 * REVIVE. category and unitOfMeasure are deliberately NOT
				 * updated — changing them would silently reinterpret every
				 * historical restock, assignment and issue row.
				 *
				 * Balance resets to zero: whatever was on the books when the
				 * item was discontinued is not trustworthy. A negative
				 * RestockLog records the reset so the ledger still sums to
				 * the balance.
				 */
				if (!existing.availableQuantity.isZero()) {
					await tx.restockLog.create({
						data: {
							inventoryItemId: existing.id,
							quantity: existing.availableQuantity.negated(),
							receivedById: userId,
							notes: "Balance reset on item revival",
						},
					});
				}

				item = await tx.inventoryItem.update({
					where: { id: existing.id },
					data: {
						deletedAt: null,
						status: "active",
						availableQuantity: 0,
						description: data.description ?? existing.description,
						restockAt: toDecimal(data.restockAt ?? 0, "Restock threshold"),
						unitCost: data.unitCost ?? existing.unitCost,
					},
				});
			} else {
				item = await tx.inventoryItem.create({
					data: {
						propertyId: data.propertyId,
						category: data.category,
						itemName,
						description: data.description,
						unitOfMeasure: data.unitOfMeasure,
						availableQuantity: 0,
						restockAt: toDecimal(data.restockAt ?? 0, "Restock threshold"),
						unitCost: data.unitCost,
						status: "active",
					},
				});
			}

			if (opening.greaterThan(0)) {
				await tx.restockLog.create({
					data: {
						inventoryItemId: item.id,
						quantity: opening,
						unitCost: data.unitCost,
						receivedById: userId,
						notes: existing?.deletedAt
							? "Opening stock on revival"
							: "Opening stock",
					},
				});
				await incrementStock(tx, item.id, opening);
			}

			return { item, revived: Boolean(existing?.deletedAt) };
		}, TX_OPTS);

		revalidatePath("/inventory");
		revalidatePath("/dashboard");

		return ok(
			result.revived
				? `${result.item.itemName} restored from the archive with its history intact`
				: `${result.item.itemName} added to inventory`,
			{
				id: result.item.id,
				itemName: result.item.itemName,
				revived: result.revived,
			},
		);
	} catch (error) {
		return handleError(error, "creating item");
	}
}

/* ------------------------------------------------------------------ *
 * WRITE PATH 2 — UPDATE ITEM
 * ------------------------------------------------------------------ */

interface UpdateItemInput {
	itemName?: string;
	description?: string;
	restockAt?: number;
	unitCost?: number;
	category?: InventoryCategory;
	unitOfMeasure?: UnitOfMeasure;
}

export async function updateInventoryItem(
	id: string,
	data: UpdateItemInput,
): Promise<ActionResult<{ id: string; itemName: string }>> {
	try {
		await requirePermission("inventory", "update");

		const result = await prisma.$transaction(async (tx) => {
			const item = await tx.inventoryItem.findUnique({
				where: { id },
				include: {
					_count: {
						select: {
							restocks: true,
							assignments: true,
							issues: true,
							usageLogs: true,
						},
					},
				},
			});

			if (!item || item.deletedAt) {
				throw fail(
					"That inventory item could not be found.",
					"not_found",
					"Refresh the inventory list and try again.",
				);
			}

			const hasHistory =
				item._count.restocks > 0 ||
				item._count.assignments > 0 ||
				item._count.issues > 0 ||
				item._count.usageLogs > 0;

			/**
			 * Once movements exist, unitOfMeasure is frozen. Switching kg to
			 * grams would turn a historical "40" into a different physical
			 * amount with no way to tell which rows meant which.
			 * Same for category, which drives assignment and usage rules.
			 */
			if (hasHistory) {
				if (data.unitOfMeasure && data.unitOfMeasure !== item.unitOfMeasure) {
					throw fail(
						`${item.itemName} already has movement history, so its unit of measure is locked to ${item.unitOfMeasure}.`,
						"has_history",
						"Create a separate item if you need to track it in a different unit.",
					);
				}
				if (data.category && data.category !== item.category) {
					throw fail(
						`${item.itemName} already has movement history, so its category is locked to ${item.category}.`,
						"has_history",
						"Archive this item and create a new one under the correct category.",
					);
				}
			}

			return tx.inventoryItem.update({
				where: { id },
				data: {
					...(data.itemName && { itemName: normalizeName(data.itemName) }),
					...(data.description !== undefined && {
						description: data.description,
					}),
					...(data.restockAt !== undefined && {
						restockAt: toDecimal(data.restockAt, "Restock threshold"),
					}),
					...(data.unitCost !== undefined && { unitCost: data.unitCost }),
					...(!hasHistory && data.category && { category: data.category }),
					...(!hasHistory && data.unitOfMeasure && {
						unitOfMeasure: data.unitOfMeasure,
					}),
				},
			});
		}, TX_OPTS);

		revalidatePath("/inventory");
		revalidatePath(`/inventory/${id}`);

		return ok(`${result.itemName} updated`, {
			id: result.id,
			itemName: result.itemName,
		});
	} catch (error) {
		return handleError(error, "updating item");
	}
}

/* ------------------------------------------------------------------ *
 * WRITE PATH 3 — SOFT DELETE
 * ------------------------------------------------------------------ */

export async function deleteInventoryItem(
	id: string,
): Promise<ActionResult<{ id: string; itemName: string }>> {
	try {
		await requirePermission("inventory", "delete");

		const result = await prisma.$transaction(async (tx) => {
			const item = await tx.inventoryItem.findUnique({
				where: { id },
				include: {
					_count: {
						select: {
							assignments: { where: { status: { in: ["active", "partial"] } } },
							issues: { where: { status: "open" } },
						},
					},
				},
			});

			if (!item || item.deletedAt) {
				throw fail(
					"That inventory item could not be found.",
					"not_found",
					"Refresh the inventory list and try again.",
				);
			}

			if (item._count.assignments > 0) {
				throw fail(
					`${item.itemName} is still out in ${item._count.assignments} unit${item._count.assignments === 1 ? "" : "s"
					}.`,
					"conflict",
					"Return or close those assignments first, then archive the item.",
				);
			}

			if (item._count.issues > 0) {
				throw fail(
					`${item.itemName} has ${item._count.issues} unresolved issue${item._count.issues === 1 ? "" : "s"
					}.`,
					"conflict",
					"Resolve the open issues first, then archive the item.",
				);
			}

			return tx.inventoryItem.update({
				where: { id },
				data: { deletedAt: new Date(), status: "discontinued" },
			});
		}, TX_OPTS);

		revalidatePath("/inventory");
		revalidatePath("/dashboard");

		return ok(
			`${result.itemName} archived. Its history is kept, and adding it again will restore this record.`,
			{ id: result.id, itemName: result.itemName },
		);
	} catch (error) {
		return handleError(error, "archiving item");
	}
}

/* ------------------------------------------------------------------ *
 * WRITE PATH 4 — RESTOCK
 * ------------------------------------------------------------------ */

export async function restockItem(data: {
	inventoryItemId: string;
	quantity: number;
	unitCost?: number;
	notes?: string;
}): Promise<ActionResult<{ id: string; availableQuantity: number }>> {
	try {
		await requirePermission("inventory", "update");
		const userId = await requireUserId();

		const quantity = requirePositive(
			toDecimal(data.quantity, "Restock quantity"),
			"Restock quantity",
			"Enter the amount received, for example 10.",
		);

		const result = await prisma.$transaction(async (tx) => {
			const item = await tx.inventoryItem.findUnique({
				where: { id: data.inventoryItemId },
				select: {
					id: true,
					itemName: true,
					unitOfMeasure: true,
					deletedAt: true,
				},
			});

			if (!item || item.deletedAt) {
				throw fail(
					"That inventory item could not be found.",
					"not_found",
					"Refresh the inventory list and try again.",
				);
			}

			await tx.restockLog.create({
				data: {
					inventoryItemId: item.id,
					quantity,
					unitCost: data.unitCost,
					receivedById: userId,
					notes: data.notes,
				},
			});

			await incrementStock(tx, item.id, quantity);

			// unitCost on the item tracks current replacement cost.
			return tx.inventoryItem.update({
				where: { id: item.id },
				data: {
					...(data.unitCost !== undefined && { unitCost: data.unitCost }),
				},
				select: {
					id: true,
					itemName: true,
					unitOfMeasure: true,
					availableQuantity: true,
				},
			});
		}, TX_OPTS);

		revalidatePath("/inventory");
		revalidatePath(`/inventory/${data.inventoryItemId}`);

		return ok(
			`${data.quantity} ${result.unitOfMeasure} of ${result.itemName} received. Now ${result.availableQuantity} ${result.unitOfMeasure} in store.`,
			{ id: result.id, availableQuantity: result.availableQuantity.toNumber() },
		);
	} catch (error) {
		return handleError(error, "restocking item");
	}
}

/* ------------------------------------------------------------------ *
 * WRITE PATH 5 — ASSIGN TO UNIT
 * ------------------------------------------------------------------ */

export async function createInventoryAssignment(data: {
	inventoryItemId: string;
	unitId: number;
	quantity: number;
	serialNumber?: string;
	notes?: string;
}): Promise<ActionResult<{ id: string }>> {
	try {
		await requirePermission("assignments", "create");
		const userId = await requireUserId();

		const quantity = requirePositive(
			toDecimal(data.quantity, "Assignment quantity"),
			"Assignment quantity",
			"Enter how many to send to the unit.",
		);

		const result = await prisma.$transaction(async (tx) => {
			const item = await tx.inventoryItem.findUnique({
				where: { id: data.inventoryItemId },
				select: {
					id: true,
					itemName: true,
					category: true,
					propertyId: true,
					unitOfMeasure: true,
					deletedAt: true,
				},
			});

			if (!item || item.deletedAt) {
				throw fail(
					"That inventory item could not be found.",
					"not_found",
					"Refresh the inventory list and try again.",
				);
			}

			const rules = await getCategoryRules(item.category);
			if (!rules.canAssign) {
				throw fail(
					`${item.itemName} is a laundry commodity, which is used centrally rather than assigned to a unit.`,
					"not_permitted_for_category",
					`Use \u201CLog usage\u201D to record how much ${item.itemName} housekeeping consumed.`,
				);
			}

			// The unit must belong to the same property as the store.
			const unit = await tx.unit.findUnique({
				where: { id: data.unitId },
				select: {
					id: true,
					name: true,
					propertyId: true,
					property: { select: { name: true } },
				},
			});

			if (!unit) {
				throw fail(
					"That unit could not be found.",
					"not_found",
					"Pick a unit from the list and try again.",
				);
			}

			if (unit.propertyId !== item.propertyId) {
				throw fail(
					`${item.itemName} belongs to a different property's store than ${unit.name}.`,
					"validation",
					`Assign it to a unit at its own property, or add ${item.itemName} to ${unit.property.name}'s inventory.`,
				);
			}

			// Guarded decrement — throws if stock is insufficient.
			await decrementStock(tx, item.id, quantity);

			return tx.inventoryAssignment.create({
				data: {
					inventoryItemId: item.id,
					unitId: unit.id,
					quantity,
					returnedQuantity: 0,
					serialNumber: data.serialNumber,
					// Consumables are terminal at creation — nothing comes back.
					status: rules.expectsReturn ? "active" : "issued",
					assignedById: userId,
					notes: data.notes,
				},
				include: { inventoryItem: true, unit: true },
			});
		}, TX_OPTS);

		revalidatePath("/inventory");
		revalidatePath("/assignments");
		revalidatePath("/dashboard");

		const consumable = result.status === "issued";

		return ok(
			`${data.quantity} ${result.inventoryItem.unitOfMeasure} of ${result.inventoryItem.itemName} assigned to ${result.unit.name}` +
			(consumable ? " and marked as consumed" : ""),
			{ id: result.id },
		);
	} catch (error) {
		return handleError(error, "assigning item");
	}
}

/* ------------------------------------------------------------------ *
 * WRITE PATH 6 — RETURN FROM UNIT
 * ------------------------------------------------------------------ */

export async function returnInventoryAssignment(data: {
	assignmentId: string;
	/** Omit to return the full outstanding amount. */
	quantity?: number;
	notes?: string;
}): Promise<ActionResult<{ id: string; status: string; outstanding: number }>> {
	try {
		await requirePermission("assignments", "return");

		const result = await prisma.$transaction(async (tx) => {
			const assignment = await tx.inventoryAssignment.findUnique({
				where: { id: data.assignmentId },
				include: {
					inventoryItem: true,
					unit: true,
					issues: OPEN_ISSUES_SELECT,
				},
			});

			if (!assignment) {
				throw fail(
					"That assignment could not be found.",
					"not_found",
					"Refresh the assignments list and try again.",
				);
			}

			if (assignment.status === "closed") {
				throw fail(
					`This assignment of ${assignment.inventoryItem.itemName} is already closed.`,
					"conflict",
					"Nothing further is outstanding on it.",
				);
			}

			if (assignment.status === "issued") {
				throw fail(
					`${assignment.inventoryItem.itemName} was issued as a consumable, so it is not expected back.`,
					"not_permitted_for_category",
					"If something is wrong with it, report an issue instead.",
				);
			}

			const { itemName, unitOfMeasure: uom } = assignment.inventoryItem;
			const outstanding = outstandingOf(assignment);
			// Items under an open issue stay put until the issue decides
			// whether they're repaired in place or written off.
			const underIssue = openIssueQuantity(assignment.issues);
			const returnable = outstanding.sub(underIssue);

			const returning =
				data.quantity === undefined
					? returnable
					: requirePositive(
						toDecimal(data.quantity, "Return quantity"),
						"Return quantity",
						"Enter how many are coming back.",
					);

			if (returning.greaterThan(returnable)) {
				throw fail(
					underIssue.isZero()
						? `Only ${outstanding} ${uom} of ${itemName} are still out from ${assignment.unit.name}.`
						: `${underIssue} of the ${outstanding} ${uom} of ${itemName} in ${assignment.unit.name} are under an open issue, so only ${returnable} can be returned.`,
					"validation",
					underIssue.isZero()
						? `Return ${outstanding} ${uom} or fewer.`
						: "Resolve the open issue first, or return fewer.",
				);
			}

			if (returning.isZero()) {
				throw fail(
					`All ${outstanding} ${uom} of ${itemName} in ${assignment.unit.name} are under an open issue.`,
					"validation",
					"Resolve the issue first — discarding it writes them off automatically.",
				);
			}

			const newReturned = assignment.returnedQuantity.add(returning);
			const stillOut = outstanding.sub(returning);
			const settled = stillOut.isZero();

			const updated = await tx.inventoryAssignment.update({
				where: { id: assignment.id },
				data: {
					returnedQuantity: newReturned,
					status: settled ? "closed" : "partial",
					returnedAt: settled ? new Date() : assignment.returnedAt,
					notes: data.notes
						? `${assignment.notes ?? ""}\nReturn: ${data.notes}`.trim()
						: assignment.notes,
				},
				include: { inventoryItem: true, unit: true },
			});

			await incrementStock(tx, assignment.inventoryItemId, returning);

			return { updated, returning, stillOut };
		}, TX_OPTS);

		revalidatePath("/inventory");
		revalidatePath("/assignments");
		revalidatePath("/dashboard");

		const uom = result.updated.inventoryItem.unitOfMeasure;
		const stillOut = result.stillOut.toNumber();

		return ok(
			`${result.returning} ${uom} of ${result.updated.inventoryItem.itemName} returned from ${result.updated.unit.name}` +
			(stillOut > 0 ? `. ${stillOut} ${uom} still in the unit.` : "."),
			{
				id: result.updated.id,
				status: result.updated.status,
				outstanding: stillOut,
			},
		);
	} catch (error) {
		return handleError(error, "returning assignment");
	}
}

/* ------------------------------------------------------------------ *
 * WRITE PATH 7 — REPORT ISSUE
 * ------------------------------------------------------------------ */

export async function reportItemIssue(data: {
	inventoryItemId: string;
	/** Set when the problem was found in a unit. Null means found in store. */
	assignmentId?: string;
	issueType: IssueType;
	quantityAffected: number;
	description: string;
}): Promise<ActionResult<{ id: string }>> {
	try {
		await requirePermission("inventory", "update");
		const userId = await requireUserId();

		const quantity = requirePositive(
			toDecimal(data.quantityAffected, "Affected quantity"),
			"Affected quantity",
			"Enter how many items are affected.",
		);

		if (!data.description?.trim()) {
			throw fail(
				"A description is required.",
				"validation",
				"Describe what happened, for example \u201Ccracked screen after guest impact\u201D.",
			);
		}

		const result = await prisma.$transaction(async (tx) => {
			const item = await tx.inventoryItem.findUnique({
				where: { id: data.inventoryItemId },
				select: {
					id: true,
					itemName: true,
					category: true,
					unitOfMeasure: true,
					deletedAt: true,
				},
			});

			if (!item || item.deletedAt) {
				throw fail(
					"That inventory item could not be found.",
					"not_found",
					"Refresh the inventory list and try again.",
				);
			}

			const rules = await getCategoryRules(item.category);
			if (!rules.canReportIssue) {
				throw fail(
					`Issues aren't tracked for ${item.category.replace(/_/g, " ")} items like ${item.itemName}.`,
					"not_permitted_for_category",
					"Adjust the stock level directly instead.",
				);
			}

			if (data.assignmentId) {
				const assignment = await tx.inventoryAssignment.findUnique({
					where: { id: data.assignmentId },
					select: {
						id: true,
						inventoryItemId: true,
						status: true,
						quantity: true,
						returnedQuantity: true,
						writtenOffQuantity: true,
						unit: { select: { name: true } },
						issues: OPEN_ISSUES_SELECT,
					},
				});

				if (!assignment || assignment.inventoryItemId !== item.id) {
					throw fail(
						"That assignment doesn't belong to this item.",
						"validation",
						"Pick the assignment from the item's own list.",
					);
				}

				if (assignment.status !== "active" && assignment.status !== "partial") {
					throw fail(
						`Nothing is still out at ${assignment.unit.name} on that assignment.`,
						"conflict",
						"Refresh the page and pick a unit that still has the item.",
					);
				}

				// Items already under an open issue can't be reported twice,
				// or discarding both would write off more than is there.
				const outstanding = outstandingOf(assignment);
				const underIssue = openIssueQuantity(assignment.issues);
				const reportable = outstanding.sub(underIssue);

				if (quantity.greaterThan(reportable)) {
					throw fail(
						underIssue.isZero()
							? `Only ${outstanding} ${item.unitOfMeasure} of ${item.itemName} are out at ${assignment.unit.name}.`
							: `${underIssue} of the ${outstanding} ${item.unitOfMeasure} of ${item.itemName} at ${assignment.unit.name} are already under an open issue.`,
						"validation",
						reportable.isZero()
							? "Resolve the existing issue instead of reporting a new one."
							: `Report ${reportable} ${item.unitOfMeasure} or fewer.`,
					);
				}
			}

			const issue = await tx.itemIssue.create({
				data: {
					inventoryItemId: item.id,
					assignmentId: data.assignmentId,
					issueType: data.issueType,
					quantityAffected: quantity,
					description: data.description.trim(),
					reportedById: userId,
					status: "open",
					resolution: "pending",
				},
			});

			/**
			 * THE DEDUCTION RULE.
			 *
			 * Store issue (assignmentId null): the stock was counted as
			 * available and isn't. Deduct now.
			 *
			 * Assigned issue (assignmentId set): those units already left
			 * availableQuantity when they were assigned. Deducting again
			 * would double-count. If the issue is resolved as discard or
			 * replace, resolveItemIssue writes them off the assignment.
			 */
			if (!data.assignmentId) {
				await decrementStock(tx, item.id, quantity);
			}

			return { issue, item };
		}, TX_OPTS);

		revalidatePath("/inventory");
		revalidatePath(`/inventory/${data.inventoryItemId}`);
		revalidatePath("/issues");

		return ok(
			`Issue logged against ${result.item.itemName}. It stays open until someone records a resolution.`,
			{ id: result.issue.id },
		);
	} catch (error) {
		return handleError(error, "reporting issue");
	}
}

/* ------------------------------------------------------------------ *
 * WRITE PATH 8 — RESOLVE ISSUE
 * ------------------------------------------------------------------ */

type ResolveIssueInput = {
	issueId: string;
	resolution: Exclude<IssueResolution, "pending">;
	resolutionNotes?: string;
	cost?: number;
	/** For `replace`: the replacement has arrived — receive it into stock. */
	logReplacementAsRestock?: boolean;
};

/**
 * Resolve one issue and apply its stock effects. Shared by
 * resolveItemIssue and writeOffAssignmentIssues so both settle an issue
 * the same way. Runs inside the caller's transaction.
 *
 * Store issue — deducted at report time, so:
 *   repair  -> back in service, credit it
 *   discard -> permanent, no change
 *   replace -> credit only if the replacement actually arrived
 *
 * Unit issue — never moved stock, the items are still on the assignment:
 *   repair  -> stays in the unit, nothing moves
 *   discard -> written off the assignment (closes it if nothing is left)
 *   replace -> broken ones written off; if the replacement arrived it is
 *              received into stock and assigned straight to the same
 *              unit, so the store count nets to zero
 */
async function resolveIssueInTx(
	tx: Prisma.TransactionClient,
	data: ResolveIssueInput,
	userId: string,
) {
	const issue = await tx.itemIssue.findUnique({
		where: { id: data.issueId },
		include: {
			inventoryItem: true,
			assignment: { select: { unitId: true, unit: { select: { name: true } } } },
		},
	});

	if (!issue) {
		throw fail(
			"That issue could not be found.",
			"not_found",
			"Refresh the issues list and try again.",
		);
	}

	if (issue.status === "resolved") {
		throw fail(
			`This issue for ${issue.inventoryItem.itemName} was already resolved.`,
			"conflict",
			"Report a new issue if the problem has recurred.",
		);
	}

	const updated = await tx.itemIssue.update({
		where: { id: issue.id },
		data: {
			status: "resolved",
			resolution: data.resolution,
			resolutionNotes: data.resolutionNotes,
			cost: data.cost ?? 0,
			resolvedById: userId,
			resolvedAt: new Date(),
		},
		include: { inventoryItem: true },
	});

	const replacementArrived =
		data.resolution === "replace" && Boolean(data.logReplacementAsRestock);

	if (replacementArrived) {
		await tx.restockLog.create({
			data: {
				inventoryItemId: issue.inventoryItemId,
				quantity: issue.quantityAffected,
				unitCost: data.cost,
				receivedById: userId,
				notes: `Replacement for issue: ${issue.description}`,
			},
		});
		await incrementStock(tx, issue.inventoryItemId, issue.quantityAffected);
	}

	if (!issue.assignmentId || !issue.assignment) {
		if (data.resolution === "repair") {
			await incrementStock(tx, issue.inventoryItemId, issue.quantityAffected);
		}

		return {
			updated,
			isStoreIssue: true as const,
			stockReturned: data.resolution === "repair" || replacementArrived,
		};
	}

	const unitName = issue.assignment.unit.name;

	if (data.resolution === "repair") {
		return { updated, isStoreIssue: false as const, unitName, writeOff: null };
	}

	const writeOff = await writeOffFromAssignment(
		tx,
		issue.assignmentId,
		issue.quantityAffected,
		`${data.resolution === "replace" ? "replaced" : "discarded"} (${issue.issueType}) — ${issue.description}`,
	);

	if (replacementArrived) {
		// Straight from the delivery to the unit: out of the store again.
		await decrementStock(tx, issue.inventoryItemId, issue.quantityAffected);
		await tx.inventoryAssignment.create({
			data: {
				inventoryItemId: issue.inventoryItemId,
				unitId: issue.assignment.unitId,
				quantity: issue.quantityAffected,
				status: "active",
				assignedById: userId,
				notes: `Replacement for issue: ${issue.description}`,
			},
		});
	}

	return {
		updated,
		isStoreIssue: false as const,
		unitName,
		writeOff,
		replacementAssigned: replacementArrived,
	};
}

/** The toast text for a resolved issue, so both callers say the same thing. */
function describeResolution(
	outcome: Awaited<ReturnType<typeof resolveIssueInTx>>,
) {
	const uom = outcome.updated.inventoryItem.unitOfMeasure;

	if (outcome.isStoreIssue) {
		return outcome.stockReturned
			? "Stock has been credited back to the store."
			: "The affected stock stays written off.";
	}

	const { unitName, writeOff } = outcome;
	if (!writeOff) return `The items stay in ${unitName}.`;

	const parts = [`${writeOff.writtenOff} ${uom} written off from ${unitName}.`];

	if ("replacementAssigned" in outcome && outcome.replacementAssigned) {
		parts.push(`The replacement was received and assigned to ${unitName}.`);
	} else if (outcome.updated.resolution === "replace") {
		parts.push(`Restock and assign the replacement to ${unitName} when it arrives.`);
	}

	parts.push(
		writeOff.stillOut.isZero()
			? "Nothing else is out on that assignment, so it's closed."
			: `${writeOff.stillOut} ${uom} still in the unit.`,
	);

	return parts.join(" ");
}

function revalidateIssuePaths(inventoryItemId: string) {
	revalidatePath("/inventory");
	revalidatePath(`/inventory/${inventoryItemId}`);
	revalidatePath("/dashboard");
}

export async function resolveItemIssue(
	data: ResolveIssueInput,
): Promise<ActionResult<{ id: string }>> {
	try {
		await requirePermission("inventory", "update");
		const userId = await requireUserId();

		const outcome = await prisma.$transaction(
			(tx) => resolveIssueInTx(tx, data, userId),
			TX_OPTS,
		);

		revalidateIssuePaths(outcome.updated.inventoryItemId);

		return ok(
			`Issue for ${outcome.updated.inventoryItem.itemName} resolved. ${describeResolution(outcome)}`,
			{ id: outcome.updated.id },
		);
	} catch (error) {
		return handleError(error, "resolving issue");
	}
}

/**
 * Write off items from an assignment. Every write-off starts as a
 * reported issue, so this discards the chosen open issues on the
 * assignment in one go — the good items stay in the unit.
 */
export async function writeOffAssignmentIssues(data: {
	assignmentId: string;
	issueIds: string[];
	notes?: string;
}): Promise<ActionResult<{ id: string; stillOut: number }>> {
	try {
		await requirePermission("inventory", "update");
		const userId = await requireUserId();

		if (data.issueIds.length === 0) {
			throw fail(
				"Pick at least one issue to write off.",
				"validation",
				"Tick the issues for the items that are gone.",
			);
		}

		const result = await prisma.$transaction(async (tx) => {
			const issues = await tx.itemIssue.findMany({
				where: { id: { in: data.issueIds } },
				select: { id: true, assignmentId: true },
			});

			if (
				issues.length !== data.issueIds.length ||
				issues.some((i) => i.assignmentId !== data.assignmentId)
			) {
				throw fail(
					"Some of those issues don't belong to this assignment.",
					"validation",
					"Refresh the page and try again.",
				);
			}

			const outcomes = [];
			for (const issueId of data.issueIds) {
				outcomes.push(
					await resolveIssueInTx(
						tx,
						{ issueId, resolution: "discard", resolutionNotes: data.notes },
						userId,
					),
				);
			}

			const assignment = await tx.inventoryAssignment.findUniqueOrThrow({
				where: { id: data.assignmentId },
				include: { inventoryItem: true, unit: true },
			});

			const writtenOff = outcomes.reduce(
				(sum, o) =>
					!o.isStoreIssue && o.writeOff ? sum.add(o.writeOff.writtenOff) : sum,
				new Prisma.Decimal(0),
			);

			return { assignment, writtenOff, stillOut: outstandingOf(assignment) };
		}, TX_OPTS);

		revalidateIssuePaths(result.assignment.inventoryItemId);

		const { assignment, writtenOff, stillOut } = result;
		const uom = assignment.inventoryItem.unitOfMeasure;

		return ok(
			`${writtenOff} ${uom} of ${assignment.inventoryItem.itemName} written off from ${assignment.unit.name}. ` +
				(stillOut.isZero()
					? "The assignment is now closed."
					: `${stillOut} ${uom} still in the unit.`),
			{ id: assignment.id, stillOut: stillOut.toNumber() },
		);
	} catch (error) {
		return handleError(error, "writing off items");
	}
}

/* ------------------------------------------------------------------ *
 * WRITE PATH 9 — LOG LAUNDRY USAGE
 * ------------------------------------------------------------------ */

export async function logItemUsage(data: {
	inventoryItemId: string;
	quantityUsed: number;
	notes?: string;
}): Promise<ActionResult<{ id: string; remaining: number }>> {
	try {
		await requirePermission("inventory", "update");
		const userId = await requireUserId();

		const quantity = requirePositive(
			toDecimal(data.quantityUsed, "Usage quantity"),
			"Usage quantity",
			"Enter how much was used, for example 1.5.",
		);

		const result = await prisma.$transaction(async (tx) => {
			const item = await tx.inventoryItem.findUnique({
				where: { id: data.inventoryItemId },
				select: {
					id: true,
					itemName: true,
					category: true,
					unitOfMeasure: true,
					restockAt: true,
					deletedAt: true,
				},
			});

			if (!item || item.deletedAt) {
				throw fail(
					"That inventory item could not be found.",
					"not_found",
					"Refresh the inventory list and try again.",
				);
			}

			const rules = await getCategoryRules(item.category);
			if (!rules.canLogUsage) {
				throw fail(
					`Usage logging is only for laundry commodities. ${item.itemName} is a ${item.category.replace(/_/g, " ")} item.`,
					"not_permitted_for_category",
					`Assign ${item.itemName} to a unit instead.`,
				);
			}

			const log = await tx.usageLog.create({
				data: {
					inventoryItemId: item.id,
					quantityUsed: quantity,
					usedById: userId,
					notes: data.notes,
				},
			});

			await decrementStock(tx, item.id, quantity);

			const after = await tx.inventoryItem.findUniqueOrThrow({
				where: { id: item.id },
				select: { availableQuantity: true },
			});

			return { log, item, remaining: after.availableQuantity };
		}, TX_OPTS);

		revalidatePath("/inventory");
		revalidatePath(`/inventory/${data.inventoryItemId}`);

		const low = result.remaining.lte(result.item.restockAt);

		return ok(
			`${data.quantityUsed} ${result.item.unitOfMeasure} of ${result.item.itemName} logged. ${result.remaining} ${result.item.unitOfMeasure} left` +
			(low ? " \u2014 at or below the restock threshold." : "."),
			{ id: result.log.id, remaining: result.remaining.toNumber() },
		);
	} catch (error) {
		return handleError(error, "logging usage");
	}
}

/*
 * ASSIGNMENT READS
 *
 * Two schema changes drive everything below:
 *   1. propertyId is gone from InventoryAssignment. Filter through
 *      the unit relation instead: { unit: { propertyId } }.
 *   2. isActive is gone. Status is a four-value enum:
 *        active  — out in a unit, return expected
 *        partial — some returned, remainder still out
 *        issued  — consumable, gone for good (terminal at creation)
 *        closed  — settled, whether returned or written off
 *      "Outstanding" means active or partial. Nothing else.
 **/

/** Statuses where stock is still expected back in the store. */
const OUTSTANDING_STATUSES = ["active", "partial"] as const;

export type AssignmentFilter =
	| "all"
	| "outstanding"
	| "needs_attention"
	| "returned"
	| "issued"
	| "written_off";

interface GetInventoryAssignmentsProps {
	page?: number;
	propertyId?: string;
	unitId?: string;
	search?: string;
	status?: AssignmentFilter;
}

function assignmentStatusWhere(
	status: AssignmentFilter,
): Prisma.InventoryAssignmentWhereInput {
	switch (status) {
		case "outstanding":
			return { status: { in: [...OUTSTANDING_STATUSES] } };
		// Still out with an unresolved issue — the rows someone has to act on.
		case "needs_attention":
			return {
				status: { in: [...OUTSTANDING_STATUSES] },
				issues: { some: { status: "open" } },
			};
		case "returned":
			return { status: "closed", writtenOffQuantity: 0 };
		case "issued":
			return { status: "issued" };
		// Anything written off, including assignments with good items still out.
		case "written_off":
			return { writtenOffQuantity: { gt: 0 } };
		default:
			return {};
	}
}

export async function getInventoryAssignments({
	page = 1,
	propertyId = "all",
	unitId = "",
	search = "",
	status = "all",
}: GetInventoryAssignmentsProps) {
	try {
		await requirePermission("assignments", "read");

		const where: Prisma.InventoryAssignmentWhereInput = {
			// Archived items shouldn't surface their old assignments.
			inventoryItem: {
				deletedAt: null,
				...(search && {
					itemName: { contains: search, mode: "insensitive" as const },
				}),
			},
			...(propertyId !== "all" &&
				propertyId !== "" && {
				unit: { propertyId: Number(propertyId) },
			}),
			...(unitId !== "" && unitId !== "all" && { unitId: Number(unitId) }),
			...assignmentStatusWhere(status),
		};

		const [rows, totalAssignments] = await Promise.all([
			prisma.inventoryAssignment.findMany({
				where,
				include: {
					inventoryItem: {
						select: {
							id: true,
							itemName: true,
							category: true,
							unitOfMeasure: true,
						},
					},
					unit: {
						select: {
							id: true,
							name: true,
							property: { select: { id: true, name: true } },
						},
					},
					assignedBy: { select: { id: true, name: true } },
					issues: {
						where: { status: "open" },
						select: {
							id: true,
							issueType: true,
							quantityAffected: true,
							description: true,
							reportedAt: true,
						},
						orderBy: { reportedAt: "asc" },
					},
				},
				orderBy: { assignedAt: "desc" },
				take: LIMIT,
				skip: (page - 1) * LIMIT,
			}),
			prisma.inventoryAssignment.count({ where }),
		]);

		const assignments = rows.map(({ issues, ...a }) => {
			const outstanding = outstandingOf(a);
			const underIssue = openIssueQuantity(issues);
			const isOutstanding =
				a.status === "active" || a.status === "partial";

			return {
				...serializeItem(a),
				outstandingQuantity: outstanding.toNumber(),
				// Open issues hold their items until resolved.
				returnableQuantity: outstanding.sub(underIssue).toNumber(),
				openIssues: issues.map(serializeItem),
				openIssueCount: issues.length,
				canReturn: isOutstanding,
				needsAttention: isOutstanding && issues.length > 0,
			};
		});

		const totalPages = Math.ceil(totalAssignments / LIMIT);

		return {
			assignments,
			totalAssignments,
			totalPages,
			currentPage: page,
			hasNext: page < totalPages,
			hasPrev: page > 1 && page <= totalPages,
		};
	} catch (error) {
		if (isNextControlFlowError(error)) throw error;
		console.error("[inventory] fetching assignments:", error);
		return {
			assignments: [],
			totalAssignments: 0,
			totalPages: 0,
			currentPage: 0,
			hasNext: false,
			hasPrev: false,
		};
	}
}

export async function getAssignmentsByUnit(unitId: number) {
	try {
		await requirePermission("assignments", "read");

		const rows = await prisma.inventoryAssignment.findMany({
			where: {
				unitId,
				status: { in: [...OUTSTANDING_STATUSES] },
				inventoryItem: { deletedAt: null },
			},
			include: {
				inventoryItem: {
					select: {
						id: true,
						itemName: true,
						category: true,
						unitOfMeasure: true,
					},
				},
				unit: {
					select: {
						id: true,
						name: true,
						property: { select: { id: true, name: true } },
					},
				},
				assignedBy: { select: { id: true, name: true } },
			},
			orderBy: { assignedAt: "desc" },
		});

		return rows.map((a) => ({
			...serializeItem(a),
			outstandingQuantity: outstandingOf(a).toNumber(),
		}));
	} catch (error) {
		if (isNextControlFlowError(error)) throw error;
		console.error("[inventory] fetching assignments by unit:", error);
		return [];
	}
}

export async function getAssignmentStats(propertyId?: number) {
	try {
		await requirePermission("assignments", "read");

		const scope: Prisma.InventoryAssignmentWhereInput = {
			inventoryItem: { deletedAt: null },
			...(propertyId && { unit: { propertyId } }),
		};

		const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

		const [total, outstanding, closed, issued, longOutstanding] =
			await Promise.all([
				prisma.inventoryAssignment.count({ where: scope }),
				prisma.inventoryAssignment.count({
					where: { ...scope, status: { in: [...OUTSTANDING_STATUSES] } },
				}),
				prisma.inventoryAssignment.count({
					where: { ...scope, status: "closed" },
				}),
				prisma.inventoryAssignment.count({
					where: { ...scope, status: "issued" },
				}),
				prisma.inventoryAssignment.count({
					where: {
						...scope,
						status: { in: [...OUTSTANDING_STATUSES] },
						assignedAt: { lt: thirtyDaysAgo },
					},
				}),
			]);

		return { total, outstanding, closed, issued, longOutstanding };
	} catch (error) {
		if (isNextControlFlowError(error)) throw error;
		console.error("[inventory] fetching assignment stats:", error);
		return { total: 0, outstanding: 0, closed: 0, issued: 0, longOutstanding: 0 };
	}
}

/**
 * Items the assign form can offer. Laundry is excluded because it is
 * used centrally rather than sent to a unit, and zero-stock items are
 * excluded because assigning them would fail the guarded decrement.
 *
 * Pass propertyId to scope to one store — an item can only be assigned
 * to a unit at its own property.
 */
export async function getAssignableItems(propertyId?: number) {
	try {
		await requirePermission("assignments", "read");

		const items = await prisma.inventoryItem.findMany({
			where: {
				deletedAt: null,
				status: "active",
				category: { notIn: USAGE_TRACKED_CATEGORIES },
				availableQuantity: { gt: 0 },
				...(propertyId && { propertyId }),
			},
			select: {
				id: true,
				propertyId: true,
				itemName: true,
				category: true,
				unitOfMeasure: true,
				availableQuantity: true,
				property: { select: { id: true, name: true } },
			},
			orderBy: [{ category: "asc" }, { itemName: "asc" }],
		});

		return items.map((item) => ({
			...item,
			availableQuantity: item.availableQuantity.toNumber(),
			// Consumables are one-way: assigning them marks them consumed.
			expectsReturn: !CONSUMABLE_CATEGORIES.includes(item.category),
		}));
	} catch (error) {
		if (isNextControlFlowError(error)) throw error;
		console.error("[inventory] fetching assignable items:", error);
		return [];
	}
}

export async function getAllUnitsForAssignment() {
	try {
		await requirePermission("assignments", "read");

		const units = await prisma.unit.findMany({
			where: { deletedAt: null },
			select: {
				id: true,
				name: true,
				propertyId: true,
				property: { select: { id: true, name: true } },
			},
			orderBy: [{ property: { name: "asc" } }, { name: "asc" }],
		});

		return units.map((unit) => ({
			id: unit.id,
			propertyId: unit.propertyId,
			name: unit.name,
			propertyName: unit.property.name,
			displayName: `${unit.property.name} — ${unit.name}`,
		}));
	} catch (error) {
		if (isNextControlFlowError(error)) throw error;
		console.error("[inventory] fetching units for assignment:", error);
		return [];
	}
}

/**
 * What's currently out in a unit, one row per item with the outstanding
 * quantity summed across its assignments. Feeds the unit details page.
 */
export async function getAggregatedAssignmentsForUnit(
	unitId: string,
	propertyId: string,
) {
	try {
		const parsedUnitId = Number(unitId);
		const parsedPropertyId = Number(propertyId);

		if (Number.isNaN(parsedUnitId) || Number.isNaN(parsedPropertyId)) {
			return [];
		}

		const assignments = await prisma.inventoryAssignment.findMany({
			where: {
				unitId: parsedUnitId,
				// Property now lives on the unit, not the assignment.
				unit: { propertyId: parsedPropertyId },
				status: { in: [...OUTSTANDING_STATUSES] },
				inventoryItem: { deletedAt: null },
			},
			select: {
				inventoryItemId: true,
				quantity: true,
				returnedQuantity: true,
				writtenOffQuantity: true,
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

		const aggregated = new Map<
			string,
			{
				inventoryItemId: string;
				itemName: string;
				category: InventoryCategory;
				unitOfMeasure: UnitOfMeasure;
				quantity: Prisma.Decimal;
			}
		>();

		for (const a of assignments) {
			// What's actually still in the unit, not how many rows exist.
			const outstanding = outstandingOf(a);
			const existing = aggregated.get(a.inventoryItemId);

			if (existing) {
				existing.quantity = existing.quantity.add(outstanding);
			} else {
				aggregated.set(a.inventoryItemId, {
					inventoryItemId: a.inventoryItemId,
					itemName: a.inventoryItem.itemName,
					category: a.inventoryItem.category,
					unitOfMeasure: a.inventoryItem.unitOfMeasure,
					quantity: outstanding,
				});
			}
		}

		return Array.from(aggregated.values())
			.map((row) => ({ ...row, quantity: row.quantity.toNumber() }))
			.sort((a, b) => a.itemName.localeCompare(b.itemName));
	} catch (error) {
		console.error("[inventory] aggregating assignments for unit:", error);
		return [];
	}
}

/* 
 * ISSUES QUEUE
 *
 *Replaces getOpenIssues, which
 * had no pagination or filters and only ever returned open rows.
 **/

export type IssueFilter = "all" | "open" | "resolved";

interface GetIssuesProps {
	page?: number;
	search?: string;
	status?: IssueFilter;
	issueType?: string;
	propertyId?: string;
}

export async function getItemIssues({
	page = 1,
	search = "",
	status = "open",
	issueType = "all",
	propertyId = "all",
}: GetIssuesProps) {
	try {
		await requirePermission("inventory", "read");

		const where: Prisma.ItemIssueWhereInput = {
			inventoryItem: {
				deletedAt: null,
				...(search && {
					itemName: { contains: search, mode: "insensitive" as const },
				}),
				...(propertyId !== "all" &&
					propertyId !== "" && { propertyId: Number(propertyId) }),
			},
			...(status !== "all" && { status }),
			...(issueType !== "all" && { issueType: issueType as IssueType }),
		};

		const [rows, totalIssues] = await Promise.all([
			prisma.itemIssue.findMany({
				where,
				include: {
					inventoryItem: {
						select: {
							id: true,
							itemName: true,
							category: true,
							unitOfMeasure: true,
							property: { select: { id: true, name: true } },
						},
					},
					assignment: {
						select: {
							id: true,
							status: true,
							unit: { select: { id: true, name: true } },
						},
					},
					reportedBy: { select: { id: true, name: true } },
					resolvedBy: { select: { id: true, name: true } },
				},
				// Open first, then oldest first — the backlog surfaces itself.
				orderBy: [{ status: "asc" }, { reportedAt: "asc" }],
				take: LIMIT,
				skip: (page - 1) * LIMIT,
			}),
			prisma.itemIssue.count({ where }),
		]);

		const now = Date.now();

		const issues = rows.map((issue) => {
			const ageDays = Math.floor(
				(now - issue.reportedAt.getTime()) / (24 * 60 * 60 * 1000),
			);

			return {
				...serializeItem(issue),
				quantityAffected: issue.quantityAffected.toNumber(),
				// Null assignment means it was found in the store, which is
				// what decides whether stock moved at report time.
				isStoreIssue: issue.assignmentId === null,
				ageDays,
				isStale: issue.status === "open" && ageDays >= 14,
			};
		});

		const totalPages = Math.ceil(totalIssues / LIMIT);

		return {
			issues,
			totalIssues,
			totalPages,
			currentPage: page,
			hasNext: page < totalPages,
			hasPrev: page > 1 && page <= totalPages,
		};
	} catch (error) {
		if (isNextControlFlowError(error)) throw error;
		console.error("[inventory] fetching issues:", error);
		return {
			issues: [],
			totalIssues: 0,
			totalPages: 0,
			currentPage: 0,
			hasNext: false,
			hasPrev: false,
		};
	}
}

/**
 * Header counts for the queue. Open issues that nobody closes leave
 * stock understated — an unresolved repair never credits back — so the
 * stale count is the number worth watching.
 */
export async function getIssueStats(propertyId?: number) {
	try {
		await requirePermission("inventory", "read");

		const scope: Prisma.ItemIssueWhereInput = {
			inventoryItem: { deletedAt: null, ...(propertyId && { propertyId }) },
		};

		const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

		const [open, stale, resolved, costAggregate] = await Promise.all([
			prisma.itemIssue.count({ where: { ...scope, status: "open" } }),
			prisma.itemIssue.count({
				where: {
					...scope,
					status: "open",
					reportedAt: { lt: fourteenDaysAgo },
				},
			}),
			prisma.itemIssue.count({ where: { ...scope, status: "resolved" } }),
			prisma.itemIssue.aggregate({
				where: { ...scope, status: "resolved" },
				_sum: { cost: true },
			}),
		]);

		return {
			open,
			stale,
			resolved,
			totalCost: costAggregate._sum.cost ?? 0,
		};
	} catch (error) {
		if (isNextControlFlowError(error)) throw error;
		console.error("[inventory] fetching issue stats:", error);
		return { open: 0, stale: 0, resolved: 0, totalCost: 0 };
	}
}

