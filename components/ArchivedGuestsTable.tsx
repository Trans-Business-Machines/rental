"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Loader2,
  Inbox,
  RotateCcw,
  Mail,
  Phone,
  Trash2,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "./ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import {
  useSoftDeletedGuests,
  useDeleteGuest,
  useRestoreGuest,
} from "@/hooks/useGuests";
import { AlertDialog } from "@/components/AlertDialog";
import { cn } from "@/lib/utils";

interface DialogState {
  open: boolean;
  action: "restore" | "delete" | null;
  guestId: number | null;
}

function ArchivedGuestsTable() {
  const [dialogState, setDialogState] = useState<DialogState>({
    open: false,
    action: null,
    guestId: null,
  });

  const { data: guests, isPending } = useSoftDeletedGuests();

  const { mutateAsync: restoreGuest, isPending: isRestorePending } =
    useRestoreGuest();

  const { mutateAsync: hardDeleteGuest, isPending: isDeletePending } =
    useDeleteGuest();

  /* ------------ Dialog Handlers ------------ */
  const openRestoreDialog = (guestId: number) => {
    setDialogState({
      open: true,
      action: "restore",
      guestId,
    });
  };

  const openDeleteDialog = (guestId: number) => {
    setDialogState({
      open: true,
      action: "delete",
      guestId,
    });
  };

  const closeDialog = () => {
    setDialogState({
      open: false,
      action: null,
      guestId: null,
    });
  };

  const handleConfirm = async () => {
    if (!dialogState.guestId) return;

    try {
      if (dialogState.action === "restore") {
        await restoreGuest(dialogState.guestId);
      } else if (dialogState.action === "delete") {
        await hardDeleteGuest(dialogState.guestId);
      }
    } finally {
      closeDialog();
    }
  };

  /* ------------ Loading State ------------ */
  if (isPending) {
    return (
      <div className="grid place-items-center p-6">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin size-4" />
          <p>Loading archived guests...</p>
        </div>
      </div>
    );
  }

  /* ------------ Empty State ------------ */
  if (guests && guests.length === 0) {
    return (
      <div className="grid place-items-center p-6">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Inbox className="size-6" />
          <p>No archived guests found.</p>
        </div>
      </div>
    );
  }

  /* ------------ Dialog Statement ------------ */
  const getDialogStatement = () => {
    if (dialogState.action === "restore") {
      return "When a guest is restored it will be visible to other users.";
    }
    return "This action can't be undone and the guest will be permanently removed.";
  };

  return (
    <>
      <div className="rounded-lg border border-border overflow-hidden pb-6">
        <Table className="px-2">
          <TableHeader>
            <TableRow className="capitalize text-left">
              <TableHead className="font-semibold text-foreground">
                Name
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Verification status
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                email
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                phone
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                total stays
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                last stay
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(guests ?? []).map((guest) => (
              <TableRow
                key={guest.id}
                className="font-medium  bg-red-100 hover:bg-red-100"
              >
                <TableCell className="capitalize">
                  {guest.firstName} {guest.lastName}
                </TableCell>

                <TableCell>
                  <Badge
                    className={cn(
                      "py-1 px-3 rounded-lg capitalize border text-white",
                      guest.verificationStatus === "pending" &&
                        "border-princeton-orange bg-princeton-orange",
                      guest.verificationStatus === "verified" &&
                        "border-medium-jungle bg-medium-jungle",
                      guest.verificationStatus === "rejected" &&
                        "border-lipstick-red bg-lipstick-red",
                    )}
                  >
                    {guest.verificationStatus || "pending"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="size-4" />
                    <span>{guest.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="size-4" />
                    <span>{guest.phone}</span>
                  </div>
                </TableCell>
                <TableCell className="pl-4 md:pl-8">
                  {guest.totalStays}
                </TableCell>
                <TableCell>
                  {guest.lastStay
                    ? format(new Date(guest.lastStay), "dd/MM/yyyy")
                    : "Never"}
                </TableCell>

                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 cursor-pointer p-0"
                      >
                        <MoreHorizontal className="size-4 rotate-90" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="hover:bg-blue-500/20 focus:bg-blue-500/20 cursor-pointer gap-2"
                        disabled={isRestorePending || isDeletePending}
                        onClick={() => openRestoreDialog(guest.id)}
                      >
                        <RotateCcw className="size-4 text-blue-500" />
                        <span className="text-blue-500">Restore</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="hover:bg-red-500/20 focus:bg-red-500/20 cursor-pointer gap-2"
                        disabled={isRestorePending || isDeletePending}
                        onClick={() => openDeleteDialog(guest.id)}
                      >
                        <Trash2 className="size-4 text-red-500" />
                        <span className="text-red-500">Delete Permanently</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={dialogState.open}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        item="guest"
        action={dialogState.action ?? "delete"}
        actionFn={handleConfirm}
        isLoading={isRestorePending || isDeletePending}
        statement={getDialogStatement()}
      />
    </>
  );
}

export { ArchivedGuestsTable };
