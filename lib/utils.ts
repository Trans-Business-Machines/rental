import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { countries, } from '@nexisltd/country';
import type { BookingStatus, UnitStatus, } from "@/lib/types/types"



export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getNationalities() {
  const worldCountries = countries()

  const nationalities = worldCountries.map((country) => country.nationality).sort((a, b) => a.localeCompare(b))

  return nationalities

}

export function evaluateUnitStatus(bookingStatus: BookingStatus): UnitStatus {
  let computedUnitStatus: UnitStatus = "available"

  if (bookingStatus === "pending") {
    computedUnitStatus = "booked"
  } else if (bookingStatus === "reserved") {
    computedUnitStatus = "reserved"
  } else if (bookingStatus === "checked_in") {
    computedUnitStatus = "occupied"
  } else if (bookingStatus === "checked_out") {
    computedUnitStatus = "available"
  } else if (bookingStatus === "cancelled") {
    computedUnitStatus = "available"
  }

  return computedUnitStatus

}

