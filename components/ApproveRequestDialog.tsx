"use client";

import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
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
            This will create a reserved booking for {guestName}.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-3 gap-3">
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleApprove();
            }}
            disabled={mutation.isPending}
            className="bg-green-600 cursor-pointer w-full sm:w-auto hover:bg-green-700"
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

          <Button
            disabled={mutation.isPending}
            className="cursor-pointer bg-lipstick-red hover:bg-crimson-red w-full sm:w-auto sm:px-10"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
