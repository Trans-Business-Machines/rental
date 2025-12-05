"use client";

import { BookingForm } from "@/components/BookingForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";

interface BookingDialogProps {
  preselectedPropertyId?: number;
  preselectedUnitId?: number;
  children?: React.ReactNode;
}

export function BookingDialog({
  preselectedPropertyId,
  preselectedUnitId,
  children,
}: BookingDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="default" className="rounded-md">
            <Plus className="size-4 mr-1" />
            <span>New Booking</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="w-11/12 lg:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Booking</DialogTitle>
        </DialogHeader>
        <BookingForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          preselectedPropertyId={preselectedPropertyId}
          preselectedUnitId={preselectedUnitId}
        />
      </DialogContent>
    </Dialog>
  );
}
