// components/CancelRequestDialog.tsx
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Ban, Loader2 } from "lucide-react";
import type { UseMutationResult } from "@tanstack/react-query";

interface CancelRequestDialogProps {
  requestId: number;
  idDocumentFilename: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mutation: UseMutationResult<any, Error, any, unknown>;
}

export function CancelRequestDialog({
  requestId,
  idDocumentFilename,
  open,
  onOpenChange,
  mutation,
}: CancelRequestDialogProps) {
  const handleCancel = async () => {
    await mutation.mutateAsync({
      id: requestId,
      idDocumentFilename,
    });

    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <Ban className="size-5 text-destructive" />
            </div>
            <AlertDialogTitle>Cancel Booking Request</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="p-4 border border-destructive bg-destructive/10 text-destructive rounded-lg">
            Are you sure you want to cancel this booking request? This action
            cannot be undone and the uploaded ID document will be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mt-3 flex justify-end gap-2">
          <Button
            variant="outline"
            disabled={mutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            Keep Request
          </Button>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleCancel();
            }}
            disabled={mutation.isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {mutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Cancelling...
              </span>
            ) : (
              "Cancel Request"
            )}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
