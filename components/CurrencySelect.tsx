"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrency } from "@/components/CurrencyProvider";
import { cn } from "@/lib/utils";
import type { Currency } from "@/lib/currency";

interface CurrencySelectProps {
  className?: string;
}

export function CurrencySelect({ className }: CurrencySelectProps) {
  const { currency, setCurrency, mounted } = useCurrency();

  return (
    <Select
      value={currency}
      onValueChange={(value) => setCurrency(value as Currency)}
      disabled={!mounted}
    >
      <SelectTrigger
        className={cn("w-fit cursor-pointer", className)}
        aria-label="Display currency"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="USD">USD ($)</SelectItem>
        <SelectItem value="KSH">KSH (Ksh)</SelectItem>
      </SelectContent>
    </Select>
  );
}
