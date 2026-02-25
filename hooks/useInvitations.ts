import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner"
import type { Invitation } from "@/lib/types/types";

interface UseInvitationsParams {
    currentPage?: number;
    search?: string;
    status?: string;
    role?: string;
}

interface InvitationResponse {
    invitations: Invitation[];
    totalPages: number;
    currentPage: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export const invitationKeys = {
    all: ["invitations"] as const,
    lists: (params: UseInvitationsParams) =>
        [...invitationKeys.all, "list", params] as const,
};

export function useInvitations({
    currentPage = 1,
    search = "",
    status = "all",
    role = "all",
}: UseInvitationsParams = {}) {
    const {
        data,
        error: invitationsError,
        isPending: invitationsPending,
    } = useQuery({
        queryKey: invitationKeys.lists({ currentPage, search, status, role }),
        queryFn: async () => {
            const params = new URLSearchParams();
            params.set("page", currentPage.toString());

            if (search) params.set("search", search);
            if (status !== "all") params.set("status", status);
            if (role !== "all") params.set("role", role);

            const res = await fetch(`/api/invitations/list?${params.toString()}`);

            if (!res.ok) throw new Error("Failed to fetch invitations");

            const data = (await res.json()) as InvitationResponse;
            return data;
        },
    });

    return { invitationsData: data, invitationsError, invitationsPending };
}

export function useResendInvite() {
    const { mutateAsync, isPending, } = useMutation({
        mutationFn: async (email: string) => {
            const res = await fetch("/api/invitations", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })

            if (!res.ok) {
                throw new Error("An error occured while resending an invite")
            }

            return res.json()

        },
        onSuccess: () => {
            toast.success(`Invite resent successfully.`)
        },
        onError: () => {
            toast.error("Failed to resend invite, try again.")
        }

    })

    return { resendInvite: mutateAsync, isPending, }
}
