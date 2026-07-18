import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getBookingRequests,
    getBookingRequestById,
    createBookingRequest,
    updateBookingRequest,
    approveBookingRequest,
    rejectBookingRequest,
    cancelBookingRequest,
    getPendingBookingRequestCount
} from "@/lib/actions/booking-requests";
import { toast } from "sonner";

// Query keys
export const bookingRequestKeys = {
    all: ["booking-requests"] as const,
    lists: () => [...bookingRequestKeys.all, "list"] as const,
    list: (params: { page?: number; status?: string; search?: string }) =>
        [...bookingRequestKeys.lists(), params] as const,
    details: () => [...bookingRequestKeys.all, "detail"] as const,
    detail: (id: number) => [...bookingRequestKeys.details(), id] as const,
    pendingCount: ["pending-booking-request-count"] as const,
};

// Fetch booking requests list
export function useBookingRequests(params: {
    page?: number;
    status?: "pending" | "approved" | "rejected" | "cancelled";
    search?: string;
}) {
    return useQuery({
        queryKey: bookingRequestKeys.list(params),
        queryFn: async () => {
            const requests = await getBookingRequests(params)
            return requests
        }
    });
}

// Fetch single booking request
export function useBookingRequest(id: number) {
    return useQuery({
        queryKey: bookingRequestKeys.detail(id),
        queryFn: () => getBookingRequestById(id),
        enabled: !!id,
    });
}

// Get pending count
export function usePendingBookingRequestCount(enabled: boolean = true) {
    return useQuery({
        queryKey: bookingRequestKeys.pendingCount,
        queryFn: () => getPendingBookingRequestCount(),
        enabled,
        refetchInterval: 30000, // Poll every 30 seconds
    });
}

// Create booking request
export function useCreateBookingRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createBookingRequest,
        onSuccess: async (data) => {

            if (!data.success) {
                throw new Error(data.message)
            }

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: bookingRequestKeys.lists() }),
                queryClient.invalidateQueries({
                    queryKey: ["booking-form-data"]
                }),
                queryClient.invalidateQueries({
                    queryKey: ["booking-request-form-data"]
                }),
                queryClient.invalidateQueries({
                    queryKey: ["guests", "search"]
                }),
                queryClient.invalidateQueries({
                    queryKey: bookingRequestKeys.pendingCount
                }),

            ])

            toast.success("Booking request submitted successfully and notification sent to super admin.", {
                duration: 5000
            });
        },
        onError: (error) => {
            const errorMessage = error.message;
            toast.error(errorMessage || "Failed to submit booking request", {
                duration: 6000
            });
        },
    });
}

// Update booking request
export function useUpdateBookingRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateBookingRequest,
        onSuccess: (data) => {
            /* TODO: invalidate: bookings */
            queryClient.invalidateQueries({ queryKey: bookingRequestKeys.lists() });
            queryClient.invalidateQueries({
                queryKey: bookingRequestKeys.detail(data.bookingRequest.id),
            });
            toast.success("Booking request updated successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update booking request");
        },
    });
}

// Approve a request
export function useApproveBookingRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id }: { id: number }) => {
            return await approveBookingRequest(id);
        },
        onSuccess: async (data) => {
            if (!data.success) {
                throw new Error(data.message || "Failed to approve booking request");
            }

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: bookingRequestKeys.lists() }),
                queryClient.invalidateQueries({ queryKey: ["bookings"] }),
                queryClient.invalidateQueries({ queryKey: ["guests"] }),
                queryClient.invalidateQueries({ queryKey: bookingRequestKeys.pendingCount }),
            ]);

            toast.success(
                "Booking approved, and the agent has been notifed.",
            );
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to approve booking request");
        },
    });
}

// Reject a request
export function useRejectBookingRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            rejectionReason,
        }: {
            id: number;
            rejectionReason: string;
        }) => {
            return await rejectBookingRequest(id, rejectionReason);
        },
        onSuccess: async (data) => {
            if (!data.success) {
                throw new Error(data.message || "Failed to reject booking request");
            }

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: bookingRequestKeys.lists() }),
                queryClient.invalidateQueries({ queryKey: ["guests"] }),
                queryClient.invalidateQueries({ queryKey: bookingRequestKeys.pendingCount }),
            ]);

            toast.success("Booking request rejected.");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to reject booking request");
        },
    });
}

// Cancel booking request
export function useCancelBookingRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            reason,
        }: {
            id: number;
            idDocumentFilename?: string;
            reason: string;
        }) => {

            const result = await cancelBookingRequest(id, reason);
            return result;
        },
        onSuccess: (result,) => {

            if (!result.success) {
                throw new Error(result.message)
            }

            queryClient.invalidateQueries({
                queryKey: bookingRequestKeys.lists(),
            });
            queryClient.invalidateQueries({
                queryKey: bookingRequestKeys.pendingCount,
            });

            toast.success(result.message);
        },
        onError: async (error: Error) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["booking-form-data"] }),
                queryClient.invalidateQueries({
                    queryKey: ["booking-request-form-data"],
                }),
                queryClient.invalidateQueries({ queryKey: ["guests", "search"] }),
            ]);
            
            toast.error(error.message || "Failed to cancel booking request");
        },
    });
}