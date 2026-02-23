import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { countries } from "@nexisltd/country";
import type { BookingStatus, UnitStatus, Guest, InventoryItem } from "@/lib/types/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const LIMIT = 9

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