import { authClient } from "@/lib/auth-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserStats } from "@/lib/actions/user-stats"
import { toast } from "sonner";
import type { BanUserData, CreateUserData, User } from "@/lib/types/types"

// Query keys
export const userKeys = {
	all: ["users"] as const,
	lists: () => [...userKeys.all, "list"] as const,
	list: (filters: { search?: string }) =>
		[...userKeys.lists(), filters] as const,
	details: () => [...userKeys.all, "detail"] as const,
	detail: (id: string) => [...userKeys.details(), id] as const,
	stats: () => [...userKeys.all, "stats"] as const
};

// Fetch users
export const useUsers = (searchQuery?: string) => {
	return useQuery({
		queryKey: userKeys.list({ search: searchQuery }),
		queryFn: async (): Promise<User[]> => {
			const { data: response, error } = await authClient.admin.listUsers({
				query: {
					limit: 6,
					offset: 0,
					searchField: searchQuery ? "email" : undefined,
					searchOperator: searchQuery ? "contains" : undefined,
					searchValue: searchQuery || undefined,
					sortBy: "createdAt",
					sortDirection: "desc",
				},
			});

			if (error) {
				throw new Error("Failed to load users");
			}

			return (response?.users as User[]) || [];
		},
		staleTime: 30 * 1000, // 30 seconds
	});
};

// Get user stats
export const useUserStats = () => {
	const { data } = useQuery({
		queryKey: userKeys.stats(),
		queryFn: async () => {
			const stats = await getUserStats()
			return stats

		}
	})

	return { userStats: data }
}

// Create user
export const useCreateUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (userData: CreateUserData) => {
			const result = await authClient.admin.createUser(userData);
			return result;
		},
		onSuccess: () => {
			toast.success("User created successfully");
			queryClient.invalidateQueries({ queryKey: userKeys.lists() });
		},
		onError: (error) => {
			toast.error("Failed to create user");
			console.error("Error creating user:", error);
		},
	});
};

// Ban user
export const useBanUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (banData: BanUserData) => {
			const result = await authClient.admin.banUser({
				userId: banData.userId,
				banReason: banData.reason,
				banExpiresIn: banData.expiresIn,
			});
			return result;
		},
		onSuccess: () => {
			toast.success("User banned successfully");
			queryClient.invalidateQueries({ queryKey: userKeys.lists() });
		},
		onError: (error) => {
			toast.error("Failed to ban user");
			console.error("Error banning user:", error);
		},
	});
};

// Unban user
export const useUnbanUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (userId: string) => {
			const result = await authClient.admin.unbanUser({ userId });
			return result;
		},
		onSuccess: () => {
			toast.success("User unbanned successfully");
			queryClient.invalidateQueries({ queryKey: userKeys.lists() });
		},
		onError: (error) => {
			toast.error("Failed to unban user");
			console.error("Error unbanning user:", error);
		},
	});
};

// Delete user
export const useDeleteUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (userId: string) => {
			const result = await authClient.admin.removeUser({ userId });
			return result;
		},
		onSuccess: () => {
			toast.success("User deleted successfully");
			queryClient.invalidateQueries({ queryKey: userKeys.lists() });
		},
		onError: (error) => {
			toast.error("Failed to delete user");
			console.error("Error deleting user:", error);
		},
	});
};

// Set user role
export const useSetUserRole = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			userId,
			role,
		}: {
			userId: string;
			role: "user" | "admin";
		}) => {
			const result = await authClient.admin.setRole({ userId, role });
			return result;
		},
		onSuccess: () => {
			toast.success("User role updated successfully");
			queryClient.invalidateQueries({ queryKey: userKeys.lists() });
		},
		onError: (error) => {
			toast.error("Failed to update user role");
			console.error("Error updating user role:", error);
		},
	});
};

// Revoke user sessions
export const useRevokeUserSessions = () => {
	return useMutation({
		mutationFn: async (userId: string) => {
			const result = await authClient.admin.revokeUserSessions({
				userId,
			});
			return result;
		},
		onSuccess: () => {
			toast.success("All user sessions revoked successfully");
		},
		onError: (error) => {
			toast.error("Failed to revoke sessions");
			console.error("Error revoking sessions:", error);
		},
	});
};
