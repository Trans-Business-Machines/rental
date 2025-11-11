import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { InvitationResponse } from "@/lib/types/types";



export function useInvitations({ currentPage }: { currentPage: number }) {
    const {
        data,
        error: invitationsError,
        isPending: invitationsPending,
    } = useQuery({
        queryKey: ["invitations", "list", currentPage],
        queryFn: async () => {
            const res = await fetch(`/api/invitations/list?page=${currentPage}`);
            if (!res.ok) throw new Error("Failed to fetch invitations");
            const data = await res.json() as InvitationResponse;
            return data;
        },
    });

    return { invitationsData: data, invitationsError, invitationsPending };
}

export function useResendInvite() {
    const { mutate, isPending, isSuccess, error } = useMutation({
        mutationFn: async (email: string) => {
            const res = await fetch("/api/invitation", {
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

    return { resendInvite: mutate, isPending, isSuccess, error }
}
