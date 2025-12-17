import { useQuery } from "@tanstack/react-query"
import { getBookingsForCheckout } from "@/lib/actions/checkout"
import type { BookingsForCheckout } from "@/lib/types/types"


export const checkoutKeys = {
    bookingsList: ["checked_in", "guest", "list"]
}

export const useGuestCheckout = () => {
    return useQuery<BookingsForCheckout>({
        queryKey: checkoutKeys.bookingsList,
        queryFn: getBookingsForCheckout,
        staleTime: 5 * 60 * 1000,
        gcTime: 8 * 60 * 1000
    })
}