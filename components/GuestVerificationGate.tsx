"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ShieldAlert, CheckCircle2, XCircle, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useUpdateGuest } from "@/hooks/useGuests";
import { bookingRequestKeys } from "@/hooks/useBookingRequests";
import type {
  BookingRequestGuest,
  GuestUpdateFormData,
} from "@/lib/types/types";

const MIN_REJECTION_REASON_LENGTH = 10;

interface GuestVerificationGateProps {
  requestId: number;
  guest: BookingRequestGuest;
}

export function GuestVerificationGate({
  requestId,
  guest,
}: GuestVerificationGateProps) {
  const queryClient = useQueryClient();
  const [isRejecting, setIsRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const { mutate: updateGuestDetails, isPending } = useUpdateGuest({
    setOpen: () => {},
  });

  const guestName = `${guest.firstName} ${guest.lastName}`;

  const buildPayload = (
    overrides: Partial<GuestUpdateFormData>,
  ): GuestUpdateFormData => ({
    firstName: guest.firstName,
    lastName: guest.lastName,
    email: guest.email,
    phone: guest.phone,
    dateOfBirth: guest.dateOfBirth,
    nationality: guest.nationality,
    idType: guest.idType,
    idNumber: guest.idNumber,
    passportNumber: guest.passportNumber,
    idFrontUrl: guest.idFrontUrl,
    idBackUrl: guest.idBackUrl,
    passportUrl: guest.passportUrl,
    notes: guest.notes ?? undefined,
    address: guest.address ?? undefined,
    city: guest.city ?? undefined,
    country: guest.country ?? undefined,
    occupation: guest.occupation ?? undefined,
    employer: guest.employer ?? undefined,
    emergencyContactName: guest.emergencyContactName ?? undefined,
    emergencyContactPhone: guest.emergencyContactPhone ?? undefined,
    emergencyContactRelation: guest.emergencyContactRelation ?? undefined,
    verificationStatus: guest.verificationStatus ?? "pending",
    ...overrides,
  });

  const submit = (overrides: Partial<GuestUpdateFormData>) => {
    updateGuestDetails(
      { guestId: guest.id, values: buildPayload(overrides) },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: bookingRequestKeys.detail(requestId),
          });
        },
      },
    );
  };

  const handleVerify = () => {
    submit({ verificationStatus: "verified" });
  };

  const handleConfirmReject = () => {
    if (reason.trim().length < MIN_REJECTION_REASON_LENGTH) {
      setError(
        `Please provide at least ${MIN_REJECTION_REASON_LENGTH} characters explaining the rejection.`,
      );
      return;
    }

    submit({ verificationStatus: "rejected", notes: reason.trim() });
  };

  const handleCancelReject = () => {
    setIsRejecting(false);
    setReason("");
    setError("");
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-start gap-3 p-4 rounded-lg border border-princeton-orange bg-princeton-orange/10 text-princeton-orange">
        <ShieldAlert className="size-5 shrink-0 mt-0.5" />
        <p className="text-sm">
          <strong>{guestName}</strong>&apos;s identity needs to be reviewed
          before you can approve or reject this booking request.
        </p>
      </div>

      {!isRejecting ? (
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleVerify}
            disabled={isPending}
            className="cursor-pointer w-full md:w-4/12 bg-medium-jungle hover:bg-green-600"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader className="size-4 animate-spin" />
                Verifying...
              </span>
            ) : (
              <>
                <CheckCircle2 className="size-5 mr-2" />
                Verify Guest
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsRejecting(true)}
            disabled={isPending}
            className="cursor-pointer w-full md:w-4/12 bg-lipstick-red"
          >
            <XCircle className="size-5 mr-2" />
            Reject Guest
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="guest-rejection-reason">
            Reason for rejecting this guest&apos;s identity *
          </Label>
          <Textarea
            id="guest-rejection-reason"
            placeholder="Explain why this guest's identity is being rejected (min. 10 characters)..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError("");
            }}
            rows={3}
            className={cn(error && "border-destructive")}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancelReject}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={
                isPending || reason.trim().length < MIN_REJECTION_REASON_LENGTH
              }
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader className="size-4 animate-spin" />
                  Rejecting...
                </span>
              ) : (
                "Confirm Rejection"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
