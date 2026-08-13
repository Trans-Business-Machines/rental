"use client";

import { useCurrency } from "@/components/CurrencyProvider";
import { formatMoney } from "@/lib/currency";

interface PriceProps {
  /** The stored, KES-denominated amount. Never pass a pre-converted USD value. */
  kes: number;
  className?: string;
}

/**
 * Renders a stored KES amount in the viewer's preferred currency.
 *
 * Exists so server components can show currency-aware prices without becoming
 * client components themselves — they just render this as a child.
 */
export function Price({ kes, className }: PriceProps) {
  const { currency } = useCurrency();

  return <span className={className}>{formatMoney(kes, currency)}</span>;
}
