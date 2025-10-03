import { getBookings } from "@/lib/actions/bookings";
import { getInventoryItems } from "@/lib/actions/inventory"


export type Booking = Awaited<ReturnType<typeof getBookings>>[number]
export type InvetoryItem = Awaited<ReturnType<typeof getInventoryItems>>[number]
