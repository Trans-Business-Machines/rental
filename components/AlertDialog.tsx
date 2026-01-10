"use client";

import { cn } from "@/lib/utils";
import { Info, TriangleAlert, Loader } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogHeader,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Separator } from "./ui/separator";

interface AlertDialogProps {
  open: boolean;
  item: string;
  action: "delete" | "archive" | "restore";
  statement: string;
  isLoading?: boolean;
  onOpenChange: (open: boolean) => void;
  actionFn: () => void;
}

function AlertDialog({
  open,
  item,
  action,
  statement,
  isLoading = false,
  onOpenChange,
  actionFn,
}: AlertDialogProps) {
  const Icon = action === "delete" ? TriangleAlert : Info;

  const getActionColors = () => {
    switch (action) {
      case "delete":
        return {
          border: "border-red-400",
          bg: "bg-red-50",
          text: "text-red-500",
          button: "bg-red-500 hover:bg-red-600",
        };
      case "restore":
        return {
          border: "border-blue-400",
          bg: "bg-blue-50",
          text: "text-blue-500",
          button: "bg-blue-500 hover:bg-blue-600",
        };
      case "archive":
        return {
          border: "border-orange-400",
          bg: "bg-orange-50",
          text: "text-orange-500",
          button: "bg-orange-500 hover:bg-orange-600",
        };
    }
  };

  const getActionText = () => {
    if (isLoading) {
      switch (action) {
        case "delete":
          return "Deleting";
        case "restore":
          return "Restoring";
        case "archive":
          return "Archiving";
      }
    }
    return action;
  };

  const colors = getActionColors();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-2xl p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-4 py-4 sm:px-6 sm:py-5">
          <DialogTitle className="text-base sm:text-lg font-semibold">
            Do you want to {action} this {item}?
          </DialogTitle>
        </DialogHeader>

        <Separator className="w-full" />

        {/* Content */}
        <div className="px-4 py-4 sm:px-6 sm:py-5 md:py-6 space-y-4">
          {/* Alert Box */}
          <div
            className={cn(
              "border rounded-lg p-3 sm:p-4 flex items-start gap-3 sm:gap-4",
              colors.border,
              colors.bg
            )}
          >
            <Icon
              className={cn("size-5 sm:size-6 shrink-0 mt-0.5", colors.text)}
            />
            <p className={cn("text-sm sm:text-base", colors.text)}>
              {statement}
            </p>
          </div>

          {/* Confirmation Text */}
          <p className="text-sm sm:text-base text-muted-foreground">
            Confirm by clicking the{" "}
            <span className={cn("font-medium capitalize", colors.text)}>
              {action}
            </span>{" "}
            button below.
          </p>
        </div>

        <Separator className="w-full" />

        {/* Footer */}
        <DialogFooter className="px-4 py-3 sm:px-6 sm:py-4 flex-col-reverse sm:flex-row gap-2 sm:gap-3">
          <DialogClose asChild>
            <Button
              variant="outline"
              className="w-full sm:w-auto cursor-pointer"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={() => actionFn()}
            disabled={isLoading}
            className={cn(
              "w-full sm:w-auto capitalize cursor-pointer",
              colors.button
            )}
          >
            {isLoading && <Loader className="size-4 mr-2 animate-spin" />}
            {getActionText()} {item}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { AlertDialog };
