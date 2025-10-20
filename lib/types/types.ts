import { getBookings } from "@/lib/actions/bookings";
import { getInventoryItems } from "@/lib/actions/inventory"
import { getCheckoutReports } from "../actions/checkout";


export type Booking = Awaited<ReturnType<typeof getBookings>>[number]
export type InvetoryItem = Awaited<ReturnType<typeof getInventoryItems>>[number]
export type CheckoutReport = Awaited<ReturnType<typeof getCheckoutReports>>[number]

export interface BookingsTableAndCardsProps {
    bookings: Booking[];
    setEditBooking: (booking: Booking) => void;
    setIsDialogOpen: (open: boolean) => void;
}