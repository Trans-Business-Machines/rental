"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  CURRENCY_STORAGE_KEY,
  DEFAULT_CURRENCY,
  isCurrency,
  type Currency,
} from "@/lib/currency";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  // False until the stored preference has been read on the client. Guard
  // controls with this so they don't render a value the server didn't produce.
  mounted: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined,
);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  // Always start on the default so server and first client render agree —
  // reading localStorage during render would break hydration.
  const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(CURRENCY_STORAGE_KEY);

    if (isCurrency(stored)) {
      setCurrencyState(stored);
    }

    setMounted(true);
  }, []);

  const setCurrency = (next: Currency) => {
    setCurrencyState(next);
    window.localStorage.setItem(CURRENCY_STORAGE_KEY, next);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, mounted }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);

  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }

  return context;
}
