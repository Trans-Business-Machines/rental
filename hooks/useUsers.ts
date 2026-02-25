import { authClient } from "@/lib/auth-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserStats, getUsers } from "@/lib/actions/user-stats"
import { toast } from "sonner";
import { usePermissions } from "@/hooks/usePermissions"
import type { BanUserData, CreateUserData, Role, } from "@/lib/types/types"

interface UseUsersParams {
	page?: number;
	search?: string;
	role?: string;
	status?: string;
}

// Query keys
export const userKeys = {
	all: ["users"] as const,
	lists: (params: UseUsersParams) => [...userKeys.all, "list", params] as const,
	list: () => [...userKeys.all, "list"] as const,
	details: () => [...userKeys.all, "detail"] as const,
	detail: (id: string) => [...userKeys.details(), id] as const,
	stats: () => [...userKeys.all, "stats"] as const
};

// Fetch users
export const useUsers = ({
	page = 1,
	search = "",
	role = "all",
	status = "all",
}: UseUsersParams = {}) => {
	return useQuery({
		queryKey: userKeys.lists({ page, search, role, status }),
		queryFn: async () => {
			const result = await getUsers({ page, search, role, status });
			return result;
		},
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
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: userKeys.list() });
			toast.success("User created successfully");
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
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: userKeys.list() });
			toast.success("User banned successfully");
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
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: userKeys.list() });
			toast.success("User unbanned successfully");
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
	const { role } = usePermissions();

	return useMutation({
		mutationFn: async ({ userId, role: deleteUserRole }: { userId: string, role: Role }) => {

			if (role === "admin" && deleteUserRole !== "user") {
				throw new Error("An admin can only delete regular users.")
			}

			if (role === "superAdmin" && deleteUserRole === "superAdmin") {
				throw new Error("A super admin can't delete another super Admin")
			}

			const result = await authClient.admin.removeUser({ userId });
			return result;
		},
		onSuccess: async () => {

			await Promise.all([
				queryClient.invalidateQueries({ queryKey: userKeys.list() }),
				queryClient.invalidateQueries({ queryKey: userKeys.stats() })
			])

			toast.success("User deleted successfully");
		},
		onError: (error) => {
			console.error("Error deleting user:", error);

			let errMsg = "Failed to delete user";

			if (error instanceof Error && (error.message === "An admin can only delete regular users." || error.message === "A super admin can't delete another super Admin")) {
				errMsg = error.message
			}

			toast.error(errMsg, {
				duration: 5000
			});
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
			role: Role;
		}) => {
			console.log(userId, role)
			const result = await authClient.admin.setRole({ userId, role });
			return result;
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: userKeys.list() });
			toast.success("User role updated successfully");
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
