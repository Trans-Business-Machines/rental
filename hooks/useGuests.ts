import { createGuest, getGuests, getGuestStats } from "@/lib/actions/guests";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Guest, CreateGuestData, GuestsResponse } from "@/lib/types/types"

// Query keys
export const guestKeys = {
	all: ["guests"] as const,
	lists: (page: number) => [...guestKeys.all, "list", page] as const,
	list: () => [...guestKeys.all, "list"] as const,
	details: () => [...guestKeys.all, "detail"] as const,
	detail: (id: number) => [...guestKeys.details(), id] as const,
	stats: () => [...guestKeys.all, "stats"] as const
};

// Fetch guests with search
export const useGuests = (page: number = 1) => {
	return useQuery({
		queryKey: guestKeys.lists(page),
		queryFn: async (): Promise<GuestsResponse> => {

			const guests = await getGuests(page);
			return guests;
		},
	});
};

// Create guest
export const useCreateGuest = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (guestData: CreateGuestData) => {
			const guest = await createGuest(guestData);
			return guest;
		},
		onSuccess: (newGuest) => {
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


// Get guests statistics
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