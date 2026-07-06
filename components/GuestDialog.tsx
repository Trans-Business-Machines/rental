"use client";

import { GuestForm } from "@/components/GuestForm";
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
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";

export function GuestDialog() {
  const { isAgent, userId } = usePermissions();
  const [open, setOpen] = useState(false);

  if (!userId) {
    redirect("/login");
  }

  const handleSuccess = () => {
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className={cn(isAgent && "hidden")}>
        <Button className="rounded-md cursor-pointer">
          <Plus className="size-4 mr-1 text-white" />
          <span>Add Guest</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-11/12 lg:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Guest</DialogTitle>
        </DialogHeader>
        <GuestForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          userId={userId}
        />
      </DialogContent>
    </Dialog>
  );
}
