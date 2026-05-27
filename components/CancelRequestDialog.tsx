"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Ban, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { UseMutationResult } from "@tanstack/react-query";

interface CancelRequestDialogProps {
  requestId: number;
  idDocumentFilename?: string;
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
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);

  const isReasonEmpty = reason.trim() === "";

  const handleCancel = async () => {
    setTouched(true);

    if (isReasonEmpty) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    await mutation.mutateAsync({
      id: requestId,
      idDocumentFilename,
      reason: reason.trim(),
    });

    setReason("");
    setTouched(false);
    onOpenChange(false);
  };

  const handleClose = () => {
    setReason("");
    setTouched(false);
    onOpenChange(false);
  };

  const hasDocument = !!idDocumentFilename;

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
            {hasDocument ? (
              <>
                Are you sure you want to cancel this booking request? This
                action cannot be undone and the uploaded ID document will be
                deleted.
              </>
            ) : (
              <>
                Are you sure you want to cancel this booking request? This
                action cannot be undone.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 mt-2">
          <Label htmlFor="cancel-reason">
            Reason for cancellation <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="cancel-reason"
            placeholder="Please explain why you're cancelling this request..."
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onBlur={() => setTouched(true)}
            className={cn(
              "resize-none",
              touched && isReasonEmpty && "border-destructive",
            )}
          />
          {touched && isReasonEmpty && (
            <p className="text-sm text-destructive">
              A cancellation reason is required
            </p>
          )}
        </div>

        <div className="mt-3 flex justify-end gap-2">
          <Button
            variant="outline"
            disabled={mutation.isPending}
            onClick={handleClose}
          >
            Keep Request
          </Button>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleCancel();
            }}
            disabled={mutation.isPending || isReasonEmpty}
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
