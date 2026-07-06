"use client";

import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { UseMutationResult } from "@tanstack/react-query";

interface ApproveRequestDialogProps {
  requestId: number;
  guestName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mutation: UseMutationResult<any, Error, any, unknown>;
}

export function ApproveRequestDialog({
  requestId,
  guestName,
  open,
  onOpenChange,
  mutation,
}: ApproveRequestDialogProps) {
  const handleApprove = async () => {
    await mutation.mutateAsync(
      { id: requestId },
      {
        onSettled: () => {
          onOpenChange(false);
        },
      },
    );

    // onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="size-5 text-green-600" />
            </div>
            <AlertDialogTitle>Approve Booking Request</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="p-4 border border-green-600 bg-green-600/10 text-green-600 rounded-lg">
            This will verify <strong>{guestName}</strong> and create a reserved
            booking from this request.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mt-3 flex justify-end gap-2">
          <Button
            disabled={mutation.isPending}
            className="cursor-pointer bg-lipstick-red hover:bg-crimson-red w-1/5 px-10"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleApprove();
            }}
            disabled={mutation.isPending}
            className="bg-green-600 cursor-pointer w-3/5 hover:bg-green-700"
          >
            {mutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Approving...
              </span>
            ) : (
              "Approve & Create Booking"
            )}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
