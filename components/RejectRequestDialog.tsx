"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { XCircle, Loader2, ShieldAlert, IdCard } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UseMutationResult } from "@tanstack/react-query";

interface RejectRequestDialogProps {
  requestId: number;
  guestId: number;
  guestName: string;
  idDocumentFilename?: string;
  // True once the guest's identity has been reviewed — verified OR rejected.
  // Only "pending" blocks rejecting the booking request.
  isGuestReviewed: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mutation: UseMutationResult<any, Error, any, unknown>;
}

export function RejectRequestDialog({
  requestId,
  guestId,
  guestName,
  idDocumentFilename,
  open,
  onOpenChange,
  isGuestReviewed,
  mutation,
}: RejectRequestDialogProps) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleReject = async () => {
    if (!reason.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    await mutation.mutateAsync({
      id: requestId,
      rejectionReason: reason.trim(),
      idDocumentFilename,
    });

    setReason("");
    setError("");
    onOpenChange(false);
  };

  const handleClose = () => {
    setReason("");
    setError("");
    onOpenChange(false);
  };

  const handleVerifyGuest = () => {
    const returnTo = encodeURIComponent(`/booking-requests/${requestId}`);
    router.push(`/guests/${guestId}?returnTo=${returnTo}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="size-5 text-destructive" />
            </div>
            <DialogTitle>Reject Booking Request</DialogTitle>
          </div>
          {isGuestReviewed ? (
            <DialogDescription>
              Please provide a reason for rejecting this booking request. The
              agent will be notified of your decision.
            </DialogDescription>
          ) : (
            <DialogDescription>
              This request can&apos;t be rejected until the guest&apos;s
              identity has been reviewed.
            </DialogDescription>
          )}
        </DialogHeader>

        {isGuestReviewed ? (
          <>
            <div className="space-y-2 py-4">
              <Label htmlFor="reason">Rejection Reason *</Label>
              <Textarea
                id="reason"
                placeholder="Enter the reason for rejection..."
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError("");
                }}
                rows={4}
                className={cn(error && "border-destructive")}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={mutation.isPending || !reason.trim()}
              >
                {mutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Rejecting...
                  </span>
                ) : (
                  "Reject Request"
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start gap-3 p-4 rounded-lg border border-princeton-orange bg-princeton-orange/10 text-princeton-orange">
              <ShieldAlert className="size-5 shrink-0 mt-0.5" />
              <p className="text-sm">
                <strong>{guestName}</strong>&apos;s identity is still pending
                review. Review their identity and set their status to{" "}
                <strong>Verified</strong> or <strong>Rejected</strong> before
                rejecting this request — deciding either way keeps the
                guest&apos;s record accurate for future booking requests,
                instead of leaving them stuck as unreviewed.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button onClick={handleVerifyGuest} className="cursor-pointer">
                <IdCard className="size-4 mr-2" />
                Review Guest Identity
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
