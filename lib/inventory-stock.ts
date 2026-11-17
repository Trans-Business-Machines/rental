/**
 * Stock levels, shared by the Inventory Items filter and the stock report.
 *
 *   out_of_stock: nothing in store
 *   low_stock:    something in store, but at or below the restock threshold
 *   in_stock:     above the restock threshold
 *
 * An item with a threshold of 0 is never "low"; it goes straight from in
 * stock to out of stock.
 */
export const STOCK_LEVELS = [
  { value: "in_stock", label: "In stock" },
  { value: "low_stock", label: "Low stock" },
  { value: "out_of_stock", label: "Out of stock" },
] as const;

export type StockLevel = (typeof STOCK_LEVELS)[number]["value"];
export type StockLevelFilter = StockLevel | "all";

export const STOCK_LEVEL_VALUES = STOCK_LEVELS.map((level) => level.value) as [
  StockLevel,
  ...StockLevel[],
];

export function stockLevelOf(available: number, restockAt: number): StockLevel {
  if (available <= 0) return "out_of_stock";
  if (available <= restockAt) return "low_stock";
  return "in_stock";
}

export function getStockLevelLabel(level: string) {
  return STOCK_LEVELS.find((l) => l.value === level)?.label ?? "All stock levels";
}
