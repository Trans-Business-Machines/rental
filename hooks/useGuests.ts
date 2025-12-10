import { createGuest, getGuests, getGuestStats } from "@/lib/actions/guests";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateGuest, deleteGuest } from "@/lib/actions/guests";
import type { Guest, CreateNewGuest, GuestsResponse, GuestUpdateFormData } from "@/lib/types/types"

// Query keys
export const guestKeys = {
	all: ["guests"] as const,
	lists: (page: number) => [...guestKeys.all, "list", page] as const,
	list: () => [...guestKeys.all, "list"] as const,
	details: () => [...guestKeys.all, "detail"] as const,
	detail: (id: number) => [...guestKeys.details(), id] as const,
	stats: () => [...guestKeys.all, "stats"] as const
};


// GET guests from the datababse
export const useGuests = (page: number = 1) => {
	return useQuery({
		queryKey: guestKeys.lists(page),
		queryFn: async (): Promise<GuestsResponse> => {

			const guests = await getGuests(page);
			return guests;
		},
	});
};

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
			toast.error("Failed to create guest");
			console.error("Error creating guest:", error);
		},
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
		onError: () => {
			// show toast message
			toast.error("Guest Update failed, try again!")
		}
	})

	return guestUpdateMutation

}


// DELETE guest mutation hook
export const useDeleteGuest = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (guestId: number) => {
			await deleteGuest(guestId)
		},
		onSuccess: async () => {
			// invalidate the guest list and booking form data
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: guestKeys.list()
				}),
				queryClient.invalidateQueries({
					queryKey: ["booking-form-data"]
				})
			])

			toast.success("Guest deleted successfully.")

		},
		onError: (error) => {
			console.error(`An error occurred deleting guest: ${error}`)
			toast.error("Failed to delete guest")
		}

	})

}