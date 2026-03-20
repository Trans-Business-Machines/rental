import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { countries } from "@nexisltd/country";
import { addDays } from "date-fns"
import type { BookingStatus, UnitStatus, Guest, InventoryItem, PriceDuration } from "@/lib/types/types";

export const LIMIT = 12
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

export function getDurationLabel(duration: PriceDuration) {
  switch (duration) {
    case "one_night":
      return "One Night";
    case "weekly":
      return "Weekly (7 nights)";
    default:
      return duration;
  }
}

export function getDurationNights(duration: PriceDuration) {
  switch (duration) {
    case "one_night":
      return 1;
    case "weekly":
      return 7;
    default:
      return 1;
  }
}

export function getPeriodLabel(duration: PriceDuration) {
  switch (duration) {
    case "one_night":
      return "nights";
    case "weekly":
      return "weeks";
    default:
      return "nights";
  }
}

export function getPeriodLabelSingular(duration: PriceDuration) {
  switch (duration) {
    case "one_night":
      return "night";
    case "weekly":
      return "week";
    default:
      return "night";
  }
}

export function calculateCheckoutDate(
  checkInDate: Date,
  duration: PriceDuration,
  period: number = 1
) {
  const nights = getDurationNights(duration) * period;
  return addDays(checkInDate, nights);
}

export function calculateTotalNights(
  duration: PriceDuration,
  period: number
) {
  return getDurationNights(duration) * period;
}

export function calculateTotalAmount(
  unitPrice: number,
  period: number
) {
  return unitPrice * period;
}

export function formatPrice(price: number) {
  return `KSH ${price.toLocaleString()}`;
}

export const formatDateInTimezone = (
  date: Date | string,
  options?: Intl.DateTimeFormatOptions) => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }

  return new Intl.DateTimeFormat("en-KE", options || defaultOptions).format(new Date(date))

}
