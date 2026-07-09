import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { addDays, differenceInDays } from "date-fns"
import nationalities from 'i18n-nationality';
import enLocale from 'i18n-nationality/langs/en.json';
import type { BookingStatus, UnitStatus, Guest, InventoryItem, PriceDuration, Role } from "@/lib/types/types";

// Constants
export const LIMIT = 9;
const TIMEZONE = "Africa/Nairobi";
export const BUCKET = "media_dev";
export const KENYA_VAT_RATE = 0.16;


nationalities.registerLocale(enLocale);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getNationalities() {

  const nationalitiesObj = nationalities.getNames("en");
  return Object.values(nationalitiesObj).sort();
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

// Calculate VAT amount
export function calculateVAT(amount: number): number {
  return Math.round(amount * KENYA_VAT_RATE);
}

// Calculate total including VAT
export function calculateTotalWithVAT(amount: number): number {
  return amount + calculateVAT(amount);
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

export function getStartOfDay(date: Date | string): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfDay(date: Date | string): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function formatDateKE(date: Date | string): string {
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Nairobi",
  }).format(new Date(date));
}

export function formatDateTimeLocal(date: Date | string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
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


// ================= MASKING UTILITIES =================

export function maskPhone(phone: string, role: Role) {
  if (role === "superAdmin") return phone;
  if (phone.length <= 4) return "****";
  const start = phone.slice(0, 4);
  const end = phone.slice(-2);
  const masked = "*".repeat(phone.length - 6);
  return `${start}${masked}${end}`;
}

export function maskEmail(email: string, role: Role) {
  if (role === "superAdmin") return email;
  const [local, domain] = email.split("@");
  if (!domain) return "****";
  const visible = local.slice(0, 2);
  const masked = "*".repeat(Math.max(local.length - 2, 3));
  return `${visible}${masked}@${domain}`;
}

export function maskIdNumber(id: string, role: Role) {
  if (role === "superAdmin") return id;
  if (id.length <= 4) return "****";
  const start = id.slice(0, 2);
  const end = id.slice(-2);
  const masked = "*".repeat(id.length - 4);
  return `${start}${masked}${end}`;
}