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
import {
    moveBookingRequestDocument,
    deleteBookingRequestDocument,
} from "@/lib/services/clientMediaService";
import { toast } from "sonner";

// Query keys
export const bookingRequestKeys = {
    all: ["booking-requests"] as const,
    lists: () => [...bookingRequestKeys.all, "list"] as const,
    list: (params: { page?: number; status?: string; search?: string }) =>
        [...bookingRequestKeys.lists(), params] as const,
    details: () => [...bookingRequestKeys.all, "detail"] as const,
    detail: (id: number) => [...bookingRequestKeys.details(), id] as const,
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
        queryKey: ["pending-booking-request-count"],
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

            ])

            toast.success("Booking request submitted successfully and notification sent to admin.", {
                duration: 6000
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

// Approve booking request
export function useApproveBookingRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            isExistingGuest,
            guestId,
            idDocumentFilename,
            idDocumentOriginalName,
            idDocumentMimeType,
            idDocumentFileSize,
        }: {
            id: number;
            isExistingGuest: boolean;
            guestId?: number;
            idDocumentFilename?: string;
            idDocumentOriginalName?: string;
            idDocumentMimeType?: string;
            idDocumentFileSize?: number;
        }) => {
            // For existing guests, no file move needed
            if (isExistingGuest) {
                const result = await approveBookingRequest(id);
                return result;
            }

            // For new guests, move the ID document first
            if (
                !guestId ||
                !idDocumentFilename ||
                !idDocumentOriginalName ||
                !idDocumentMimeType ||
                !idDocumentFileSize
            ) {
                throw new Error("Missing required document data for new guest");
            }

            // 1. Move the ID document FIRST
            const moveResult = await moveBookingRequestDocument(
                idDocumentFilename,
                guestId
            );

            if (!moveResult.success || !moveResult.newUrl || !moveResult.newFilename) {
                throw new Error(moveResult.error || "Failed to move ID document");
            }

            // 2. Now approve with all the media data
            const result = await approveBookingRequest(id, {
                mediaUrl: moveResult.newUrl,
                mediaFilename: moveResult.newFilename,
                mediaOriginalName: idDocumentOriginalName,
                mediaMimeType: idDocumentMimeType,
                mediaSize: idDocumentFileSize,
            });

            return result;
        },
        onSuccess: async (data) => {

            if (!data.success) {
                throw new Error(data.message || "Failed to approve booking request");
            }

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: bookingRequestKeys.lists() }),
                queryClient.invalidateQueries({ queryKey: ["bookings"] }),
                queryClient.invalidateQueries({ queryKey: ["guests"] }),
            ])

            if (data.isExistingGuest) {
                toast.success("Booking request approved. Booking created for existing guest and email sent to agent.");
            } else {
                toast.success("Booking request approved. Guest and booking created and email sent to agent.");
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to approve booking request");
        },
    });
}

// Reject booking request
export function useRejectBookingRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            rejectionReason,
            idDocumentFilename,
        }: {
            id: number;
            rejectionReason: string;
            idDocumentFilename?: string;
        }) => {
            // 1. Delete the ID document file (only if it exists - new guests only)
            if (idDocumentFilename) {
                const deleteResult = await deleteBookingRequestDocument(idDocumentFilename);

                if (!deleteResult.success) {
                    console.error("Failed to delete document:", deleteResult.error);
                    // Continue anyway - rejection is more important
                }
            }

            // 2. Reject the request
            const result = await rejectBookingRequest(id, rejectionReason);

            return result;
        },
        onSuccess: async () => {

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
                }),])

            toast.success("Booking request rejected and email sent to agent");
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
            idDocumentFilename,
            reason,
        }: {
            id: number;
            idDocumentFilename?: string;
            reason: string;
        }) => {
            if (idDocumentFilename) {
                const deleteResult =
                    await deleteBookingRequestDocument(idDocumentFilename);

                if (!deleteResult.success) {
                    console.error("Failed to delete document:", deleteResult.error);
                }
            }

            const result = await cancelBookingRequest(id, reason);
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: bookingRequestKeys.lists(),
            });
            toast.success("Booking request cancelled");
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