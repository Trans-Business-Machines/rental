import { createGuest, getGuests, getGuestStats } from "@/lib/actions/guests";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	updateGuest,
	deleteGuest,
	getSoftDeletedGuests,
	softDeleteGuest,
	restoreGuest
} from "@/lib/actions/guests";
import { toast } from "sonner";
import type { Guest, CreateNewGuest, GuestUpdateFormData } from "@/lib/types/types";
import { searchGuestsForBooking } from "@/lib/actions/guests";

interface UseGuestsParams {
	page?: number;
	search?: string;
	status?: string;
}

// Query keys
export const guestKeys = {
	all: ["guests"] as const,
	lists: (params: UseGuestsParams) => [...guestKeys.all, "list", params] as const,
	list: () => [...guestKeys.all, "list"] as const,
	details: () => [...guestKeys.all, "detail"] as const,
	detail: (id: number) => [...guestKeys.details(), id] as const,
	stats: () => [...guestKeys.all, "stats"] as const,
	search: () => [...guestKeys.all, "search"] as const,
	searchForBooking: (query: string) =>
		[...guestKeys.search(), "forBooking", query] as const,
};


// GET guests from the datababse
export const useGuests = ({ page = 1, search = "", status = "all" }: UseGuestsParams) => {
	return useQuery({
		queryKey: guestKeys.lists({ page, search, status }),
		queryFn: async () => {
			const guests = await getGuests({ page, search, status });
			return guests;
		},
	});
};

// GET soft deleted guests from the database
export const useSoftDeletedGuests = () => {
	return useQuery({
		queryKey: ["soft-deleted-guests"],
		queryFn: async () => {
			const guests = await getSoftDeletedGuests()
			return guests
		}
	})
}

// GET guests statistics
export const useGuestStats = () => {
	const { data } = useQuery({
		queryKey: guestKeys.stats(),
		queryFn: async () => {
			const stats = await getGuestStats()
			return stats
		}
	})

	return { guestStats: data }
}

// CREATE guest mutation hook
export const useCreateGuest = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (guestData: CreateNewGuest) => {
			const guest = await createGuest(guestData);
			return guest;
		},
		onSuccess: (newGuest) => {
			// Show toast message
			toast.success("Guest created successfully");

			// Invalidate and refetch guests list
			queryClient.invalidateQueries({ queryKey: guestKeys.stats() });
			queryClient.invalidateQueries({ queryKey: guestKeys.list() });

			// Optionally update the cache with the new guest
			queryClient.setQueryData(
				guestKeys.list(),
				(oldData: Guest[] | undefined) => {
					if (oldData) {
						return [newGuest, ...oldData];
					}
					return [newGuest];
				}
			);
		},
		onError: (error) => {
			const errorMessage = error.message
			console.error("Hook error:",errorMessage)
			toast.error(errorMessage, {
				duration: 6000
			})
		}
	});
};

// UPDATE a guest details mutation hook
export const useUpdateGuest = ({
	setOpen
}: { setOpen: (open: boolean) => void }) => {
	// Get the query client 
	const queryClient = useQueryClient();

	const guestUpdateMutation = useMutation({
		mutationFn: async (
			{ guestId, values, }:
				{ guestId: number, values: GuestUpdateFormData }) => {

			// call updateGuest mutation		
			return await updateGuest(guestId, values)
		},
		onSuccess: (data) => {
			// Invalidate the guests list in the react query cache
			queryClient.invalidateQueries({
				queryKey: guestKeys.list()
			})

			// Invalidate the Guest dashboard cards
			queryClient.invalidateQueries({ queryKey: guestKeys.stats() });

			// if a guest is verified, invalidate the booking-form-data
			if (data.verificationStatus === "verified") {
				queryClient.invalidateQueries({
					queryKey: ["booking-form-data"]
				})
			}

			// show success message on success
			toast.success("Guest updated successfuly")

			// close the dialog box
			setOpen(false)

		},
		onError: (error) => {
			let errMsg = "Failed to update guest!"

			if (error instanceof Error && error.message.includes("Unauthorized: Insufficent permissions."))
				errMsg = "Unauthorized Insufficent permissions."

			toast.error(errMsg, {
				duration: 5000
			})
		}
	})

	return guestUpdateMutation

}

// ARCHIVE soft delete a guest
export const useSoftDeleteGuest = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (id: number) => {
			await softDeleteGuest(id)
		},
		onSuccess: async () => {

			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: ["soft-deleted-guests"]
				}),
				queryClient.invalidateQueries({
					queryKey: guestKeys.list()
				}),
				queryClient.invalidateQueries({
					queryKey: ["booking-form-data"]
				}),
				queryClient.invalidateQueries({
					queryKey: guestKeys.stats()
				})
			])


			toast.success("Guest Archived successfully.")

		},
		onError: (error) => {
			let errMsg = "Failed to archive guest"

			if (error instanceof Error && error.message.includes("Unauthorized: Insufficent permissions."))
				errMsg = "Unauthorized Insufficent permissions."

			toast.error(errMsg, {
				duration: 5000
			})
		}
	})

}

// DELETE hard delete a guest
export const useDeleteGuest = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (guestId: number) => {
			await deleteGuest(guestId)
		},
		onSuccess: async () => {

			// invalidate the necessary cached queries
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: guestKeys.list()
				}),
				queryClient.invalidateQueries({
					queryKey: ["booking-form-data"]
				}),
				queryClient.invalidateQueries({
					queryKey: ["soft-deleted-guests"]
				}),
				queryClient.invalidateQueries({
					queryKey: guestKeys.stats()
				})
			])

			toast.success("Guest deleted successfully.")

		},
		onError: (error) => {
			let errMsg = "Failed to delete guest"

			if (error instanceof Error && error.message.includes("Unauthorized: Insufficent permissions."))
				errMsg = "Unauthorized Insufficent permissions."

			toast.error(errMsg, {
				duration: 5000
			})
		}

	})

}

// RESTORE an archived guest
export const useRestoreGuest = () => {

	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (id: number) => {
			await restoreGuest(id)
		},

		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: guestKeys.list()
				}),
				queryClient.invalidateQueries({
					queryKey: ["booking-form-data"]
				}),
				queryClient.invalidateQueries({
					queryKey: ["soft-deleted-guests"]
				}),
				queryClient.invalidateQueries({
					queryKey: guestKeys.stats()
				})
			])

			toast.success("Guest has been successfully restored.")
		}, onError: (error) => {
			let errMsg = "Failed to restore guest"

			if (error instanceof Error && error.message.includes("Unauthorized: Insufficent permissions."))
				errMsg = "Unauthorized Insufficent permissions."

			toast.error(errMsg, {
				duration: 5000
			})
		}
	})
}

export function useSearchGuestsForBooking(query: string, enabled = true) {
	return useQuery({
		queryKey: guestKeys.searchForBooking(query),
		queryFn: () => searchGuestsForBooking(query),
		enabled,
	});
}