import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { unitKeys } from "./useUnitDetails"
import {
	createBooking,
	getBookings,
	restoreBooking,
	softDeleteBooking,
	deleteBooking,
	getSoftDeletedBookings
} from "@/lib/actions/bookings";
import type { CreateBookingData } from "@/lib/types/types"

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

// Get soft Deleted bookings
export const useSoftDeletedBookings = () => {
	return useQuery({
		queryKey: ["soft-deleted", "bookings"],
		queryFn: async () => {
			return await getSoftDeletedBookings();
		},
	});
}

// Soft Delete a booking
export const useSoftDeleteBooking = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (id: number) => {
			await softDeleteBooking(id)
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["soft-deleted", "bookings"]
			})

			toast.success("Booking archived successfully.")
		},

		onError: (error) => {
			let errMsg = "Failed to archive booking"

			if (error instanceof Error && error.message.includes("Unauthorized: Insufficent permissions."))
				errMsg = "Unauthorized Insufficent permissions."

			toast.error(errMsg)
		}
	})
}

// Create booking
export const useCreateBooking = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (bookingData: CreateBookingData) => {
			const booking = await createBooking(bookingData);
			return booking;
		},
		onSuccess: async (newBooking) => {
			toast.success("Booking created successfully");

			// Invalidate and refetch bookings list and unit details
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: bookingKeys.lists() }),
				queryClient.invalidateQueries({
					queryKey: unitKeys.details(newBooking.unitId.toString(), newBooking.propertyId.toString())
				})
			])

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
					"booking already exists"
				)
			) {
				toast.error(error.message, {
					duration: 5000
				});
			}

			else if (error instanceof Error &&
				error.message.includes(
					"Unauthorized: Insufficent permissions."
				)) {

				toast.error("Unauthorized, Insufficent permissions.", {
					duration: 5000
				})
			}

			else {
				toast.error("Failed to create booking");
			}
		},
	});
};

// Restore a booking
export const useRestoreBooking = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (bookingId: number) => {
			await restoreBooking(bookingId)
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["soft-deleted", "bookings"],
			})

			toast.success("Booking was restored successfully.")
		},
		onError: (error) => {
			let errMsg = "Failed to restore booking"

			if (error instanceof Error && error.message.includes("Unauthorized: Insufficent permissions."))
				errMsg = "Unauthorized Insufficent permissions."

			toast.error(errMsg, {
				duration: 5000
			})
		}
	})
}

// Permanently delete a booking
export const useDeleteBooking = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (bookingId: number) => {
			await deleteBooking(bookingId)
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["soft-deleted", "bookings"],
			})

			toast.success("Booking was deleted successfully.")
		},
		onError: (error) => {
			let errMsg = "Failed to delete booking"

			if (error instanceof Error && error.message.includes("Unauthorized: Insufficent permissions."))
				errMsg = "Unauthorized Insufficent permissions."

			toast.error(errMsg, {
				duration: 5000
			})
		}
	})
}
