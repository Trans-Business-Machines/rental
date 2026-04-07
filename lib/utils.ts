import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { countries } from "@nexisltd/country";
import { addDays, differenceInDays } from "date-fns"
import type { BookingStatus, UnitStatus, Guest, InventoryItem, PriceDuration } from "@/lib/types/types";

export const LIMIT = 9;
const TIMEZONE = "Africa/Nairobi";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getNationalities() {
  const worldCountries = countries();

  const nationalities = worldCountries
    .map((country) => country.nationality)
    .sort((a, b) => a.localeCompare(b));

  return nationalities;
}

export function evaluateUnitStatus(bookingStatus: BookingStatus): UnitStatus {
  let computedUnitStatus: UnitStatus = "available";

  if (bookingStatus === "pending") {
    computedUnitStatus = "booked";
  } else if (bookingStatus === "reserved") {
    computedUnitStatus = "reserved";
  } else if (bookingStatus === "checked_in") {
    computedUnitStatus = "occupied";
  } else if (bookingStatus === "checked_out") {
    computedUnitStatus = "available";
  } else if (bookingStatus === "cancelled") {
    computedUnitStatus = "available";
  }

  return computedUnitStatus;
}

export function shouldDisableDelete(guest: Guest) {
  if (!guest.bookings || guest.bookings.length === 0) {
    return false
  }

  const latestBooking = guest.bookings[0]
  const activeStatuses = ["pending", "reserved", "checked_in"]

  return activeStatuses.includes(latestBooking.status)

}

export const getOccupancyRate = (occupied: number, total: number | null) => {
  if (!total || total === 0) return 0;
  return Math.round((occupied / total) * 100);
};

export function getInventoryStatus(item: InventoryItem) {
  const assignedQuantity = item.assignments.length;
  const totalStock = assignedQuantity + item.quantity;
  const availableQuantity = item.quantity;

  if (availableQuantity <= 0) {
    return { status: "critical", label: "Critical" };
  } else if (availableQuantity <= Math.round(totalStock * 0.25)) {
    return { status: "low", label: "Low Stock" };
  } else {
    return { status: "good", label: "Good" };
  }
}

// ================= UNIT PRICING UTILITIES =================
// Get human-readable label for duration
export function getDurationLabel(duration: PriceDuration | string): string {
  const labels: Record<string, string> = {
    one_night: "One Night",
    weekly: "Weekly",
    monthly: "Monthly",
    custom: "Custom",
  };
  return labels[duration] || duration;
}

//Get number of nights for a duration
export function getDurationNights(
  duration: PriceDuration | string,
  fromDate?: Date | string | null,
  toDate?: Date | string | null
): number {
  switch (duration) {
    case "one_night":
      return 1;
    case "weekly":
      return 7;
    case "monthly":
      return 30;
    case "custom":
      if (fromDate && toDate) {
        const from = typeof fromDate === "string" ? new Date(fromDate) : fromDate;
        const to = typeof toDate === "string" ? new Date(toDate) : toDate;
        return differenceInDays(to, from);
      }
      return 0;
    default:
      return 1;
  }
}

//Get plural period label (nights, weeks, months)
export function getPeriodLabel(duration: PriceDuration | string): string {
  const labels: Record<string, string> = {
    one_night: "nights",
    weekly: "weeks",
    monthly: "months",
    custom: "stays",
  };
  return labels[duration] || "nights";
}

// Get singular period label (night, week, month)
export function getPeriodLabelSingular(duration: PriceDuration | string): string {
  const labels: Record<string, string> = {
    one_night: "night",
    weekly: "week",
    monthly: "month",
    custom: "stay",
  };
  return labels[duration] || "night";
}

// Calculate checkout date based on check-in, duration, and period
export function calculateCheckoutDate(
  checkInDate: Date | string,
  duration: PriceDuration | string,
  period: number,
  fromDate?: Date | string | null,
  toDate?: Date | string | null
): Date {
  const checkIn = typeof checkInDate === "string" ? new Date(checkInDate) : checkInDate;
  const nights = getDurationNights(duration, fromDate, toDate);
  return addDays(checkIn, nights * period);
}

// Calculate total nights for a booking
export function calculateTotalNights(
  duration: PriceDuration | string,
  period: number,
  fromDate?: Date | string | null,
  toDate?: Date | string | null
): number {
  const nights = getDurationNights(duration, fromDate, toDate);
  return nights * period;
}

// Apply discount to a price
export function calculateDiscountedPrice(
  price: number,
  discountRate: number | null | undefined
): number {
  if (!discountRate || discountRate <= 0) {
    return price;
  }

  return Math.round(price * (1 - discountRate));
}

// Calculate total amount with discount applied
export function calculateTotalAmount(
  unitPrice: number,
  period: number,
  discountRate?: number | null
): number {
  const subtotal = unitPrice * period;
  return calculateDiscountedPrice(subtotal, discountRate);
}

//  Format discount rate as percentage string
export function formatDiscount(discountRate: number | null | undefined): string {
  if (!discountRate || discountRate <= 0) {
    return "";
  }
  return `${Math.round(discountRate * 100)}% off`;
}

// Check if a discount exists
export function hasDiscount(discountRate: number | null | undefined): boolean {
  return !!discountRate && discountRate > 0;
}

// ================= FORMAT UTILITIES =================
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-KE", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export const formatDateInTimezone = (
  date: Date | string,
  options?: Intl.DateTimeFormatOptions) => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }

  return new Intl.DateTimeFormat("en-KE", options || defaultOptions).format(new Date(date))

}

export function normalizeCheckOutTo10amEAT(date: Date | string): Date {
  const d = new Date(date);
  d.setUTCHours(7, 0, 0, 0); 
  return d;
}

export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
