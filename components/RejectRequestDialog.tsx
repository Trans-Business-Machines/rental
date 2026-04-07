// components/RejectRequestDialog.tsx
"use client";

import { useState } from "react";
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
import { XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UseMutationResult } from "@tanstack/react-query";

interface RejectRequestDialogProps {
  requestId: number;
  idDocumentFilename?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mutation: UseMutationResult<any, Error, any, unknown>;
}

export function RejectRequestDialog({
  requestId,
  idDocumentFilename,
  open,
  onOpenChange,
  mutation,
}: RejectRequestDialogProps) {
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
          <DialogDescription>
            Please provide a reason for rejecting this booking request. The
            agent will be notified of your decision.
          </DialogDescription>
        </DialogHeader>

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
      </DialogContent>
    </Dialog>
  );
}
