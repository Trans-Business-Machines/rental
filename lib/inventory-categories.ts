import type { InventoryCategory } from "@/prisma/generated/client";

/**
 * Display config per inventory category. Keyed by the Prisma enum so a new
 * category fails type-check here until it's given a label and colour.
 */
export const CATEGORY_DISPLAY: Record<
  InventoryCategory,
  { label: string; badgeClassName: string }
> = {
  electronics: {
    label: "Electronics",
    badgeClassName:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
  },
  furniture: {
    label: "Furniture",
    badgeClassName:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  bedroom: {
    label: "Bedroom",
    badgeClassName:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300",
  },
  cutlery: {
    label: "Cutlery",
    badgeClassName:
      "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
  },
  linens: {
    label: "Linens",
    badgeClassName:
      "border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-800 dark:bg-pink-950 dark:text-pink-300",
  },
  kitchen_consumables: {
    label: "Kitchen",
    badgeClassName:
      "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300",
  },
  laundry: {
    label: "Laundry",
    badgeClassName:
      "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950 dark:text-cyan-300",
  },
  office: {
    label: "Office",
    badgeClassName:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  },
};

export const INVENTORY_CATEGORIES = Object.keys(
  CATEGORY_DISPLAY,
) as InventoryCategory[];

export function getCategoryDisplay(category: string) {
  return (
    CATEGORY_DISPLAY[category as InventoryCategory] ?? {
      label: category,
      badgeClassName: "",
    }
  );
}

/* ------------------------------------------------------------------ *
 * CATEGORY BEHAVIOUR
 *
 * Category is the single switch that drives assignment, return, usage
 * and issue rules. Lives here rather than in lib/actions/inventory.ts
 * so checkout and client components can share it — "use server" files
 * can only export async functions.
 * ------------------------------------------------------------------ */

/** Consumed on issue, assigned to a unit but never returned. */
export const CONSUMABLE_CATEGORIES: InventoryCategory[] = ["kitchen_consumables"];

/** Used centrally by housekeeping — never assigned to a unit. */
export const USAGE_TRACKED_CATEGORIES: InventoryCategory[] = ["laundry"];

/** Issues can be reported against these. You don't repair a sachet. */
export const ISSUE_TRACKED_CATEGORIES: InventoryCategory[] = [
  "electronics",
  "furniture",
  "bedroom",
  "cutlery",
  "linens",
  "office",
];

export function categoryRules(category: InventoryCategory) {
  return {
    canAssign: !USAGE_TRACKED_CATEGORIES.includes(category),
    expectsReturn:
      !USAGE_TRACKED_CATEGORIES.includes(category) &&
      !CONSUMABLE_CATEGORIES.includes(category),
    canLogUsage: USAGE_TRACKED_CATEGORIES.includes(category),
    canReportIssue: ISSUE_TRACKED_CATEGORIES.includes(category),
  };
}
