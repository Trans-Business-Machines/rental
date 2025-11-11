import { createBooking, getBookings } from "@/lib/actions/bookings";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Booking {
	id: number;
	guestId: number;
	propertyId: number;
	unitId: number;
	checkInDate: Date;
	checkOutDate: Date;
	numberOfGuests: number;
	totalAmount: number;
	source: string;
	purpose: string;
	paymentMethod?: string | null;
	specialRequests?: string | null;
	status: string;
	createdAt: Date;
	updatedAt: Date;
	guest: {
		id: number;
		firstName: string;
		lastName: string;
		email: string;
		phone: string;
	};
	property: {
		id: number;
		name: string;
	};
	unit: {
		id: number;
		name: string;
	};
}

interface CreateBookingData {
	guestId: number;
	propertyId: number;
	unitId: number;
	checkInDate: Date;
	checkOutDate: Date;
	numberOfGuests: number;
	totalAmount: number;
	source: string;
	purpose: string;
	paymentMethod?: string;
}

// Query keys
export const bookingKeys = {
	all: ["bookings"] as const,
	lists: () => [...bookingKeys.all, "list"] as const,
	list: () => [...bookingKeys.lists()] as const,
	details: () => [...bookingKeys.all, "detail"] as const,
	detail: (id: number) => [...bookingKeys.details(), id] as const,
};

// Fetch bookings
export const useBookings = () => {
	return useQuery({
		queryKey: bookingKeys.list(),
		queryFn: async (): Promise<Booking[]> => {
			const bookingsData = await getBookings();
			return bookingsData.bookings;
		},
		staleTime: 30 * 1000, // 30 seconds
	});
};

// Create booking
export const useCreateBooking = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (bookingData: CreateBookingData) => {
			const booking = await createBooking(bookingData);
			return booking;
		},
		onSuccess: (newBooking) => {
			toast.success("Booking created successfully");
			// Invalidate and refetch bookings list
			queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
			// Optionally update the cache with the new booking
			queryClient.setQueryData(
				bookingKeys.list(),
				(oldData: Booking[] | undefined) => {
					if (oldData) {
						return [newBooking, ...oldData];
					}
					return [newBooking];
				}
			);
		},
		onError: (error: any) => {
			// Show specific error if double booking
			if (
				error instanceof Error &&
				error.message.includes(
					"A guest is already checked in for this property"
				)
			) {
				toast.error(error.message);
			} else {
				toast.error("Failed to create booking");
			}
			console.error("Error creating booking:", error);
		},
	});
};
