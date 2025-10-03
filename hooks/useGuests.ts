import { createGuest, getGuests, searchGuests } from "@/lib/actions/guests";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface Guest {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	nationality?: string | null;
	idType?: string | null;
	idNumber?: string | null;
	passportNumber?: string | null;
	dateOfBirth?: string | null;
	address?: string | null;
	city?: string | null;
	country?: string | null;
	occupation?: string | null;
	employer?: string | null;
	emergencyContactName?: string | null;
	emergencyContactPhone?: string | null;
	emergencyContactRelation?: string | null;
	notes?: string | null;
	verificationStatus?: string | null;
	blacklisted?: boolean | null;
	totalStays?: number | null;
	totalNights?: number | null;
	totalSpent?: number | null;
	lastStay?: Date | null;
	rating?: number | null;
	createdAt: Date | null;
	updatedAt: Date | null;
}

interface CreateGuestData {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	idNumber?: string;
	passportNumber?: string;
	notes?: string;
}

// Query keys
export const guestKeys = {
	all: ["guests"] as const,
	lists: () => [...guestKeys.all, "list"] as const,
	list: (filters: {
		search?: string;
		nationality?: string;
		verification?: string;
	}) => [...guestKeys.lists(), filters] as const,
	details: () => [...guestKeys.all, "detail"] as const,
	detail: (id: number) => [...guestKeys.details(), id] as const,
};

// Fetch guests with search
export const useGuests = (
	searchQuery?: string,
	nationality?: string,
	verification?: string
) => {
	return useQuery({
		queryKey: guestKeys.list({
			search: searchQuery,
			nationality,
			verification,
		}),
		queryFn: async (): Promise<Guest[]> => {
			if (searchQuery) {
				return await searchGuests(searchQuery);
			}
			const guests = await getGuests();
			return guests;
		},
		staleTime: 30 * 1000, // 30 seconds
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
			queryClient.invalidateQueries({ queryKey: guestKeys.lists() });
			// Optionally update the cache with the new guest
			queryClient.setQueryData(
				guestKeys.list({}),
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
