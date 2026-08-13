import { formatPrice } from "@/lib/utils";

export type Currency = "USD" | "KSH";

export const CURRENCY_STORAGE_KEY = "preferred-currency";
export const DEFAULT_CURRENCY: Currency = "USD";

/**
 * KES is the base unit everywhere — the DB, booking maths, and M-Pesa all deal
 * in shillings. USD exists only as a display/input layer, converted at this
 * fixed rate.
 */
export const USD_TO_KES_RATE = Number(
  process.env.NEXT_PUBLIC_USD_TO_KES_RATE ?? 130,
);

export function isCurrency(value: unknown): value is Currency {
  return value === "USD" || value === "KSH";
}

// Convert a stored KES amount to USD (unrounded — callers format it).
export function kesToUsd(kes: number): number {
  return kes / USD_TO_KES_RATE;
}

// Convert a USD figure to a whole-shilling amount for storage.
export function usdToKes(usd: number): number {
  return Math.round(usd * USD_TO_KES_RATE);
}

export function formatUSD(usd: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(usd);
}

/**
 * Format the KES equivalent of a USD figure. For input previews, where the
 * amount on hand is what the user typed rather than a stored KES value.
 */
export function formatKESFromUsd(usd: number): string {
  return formatPrice(usdToKes(usd));
}

/**
 * Format a KES-denominated amount in the caller's preferred currency.
 * Always takes the stored KES value — never a pre-converted USD figure.
 */
export function formatMoney(kes: number, currency: Currency): string {
  return currency === "USD" ? formatUSD(kesToUsd(kes)) : formatPrice(kes);
}

/**
 * Both currencies in one string, e.g. "$138.46 (Ksh 18,000)". Used server-side
 * (emails, cron) where there is no user preference to read.
 */
export function formatBoth(kes: number): string {
  return `${formatUSD(kesToUsd(kes))} (${formatPrice(kes)})`;
}
