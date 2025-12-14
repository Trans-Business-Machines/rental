"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { format } from "date-fns";
import { MoreHorizontal, Eye, Pencil, Mail, Phone, Trash2 } from "lucide-react";
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
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import Link from "next/link";
import { useDeleteGuest } from "@/hooks/useGuests";
import { cn, shouldDisableDelete } from "@/lib/utils";
import { DeleteDialog } from "@/components/GuestDeleteDialog";
import type { Guest } from "@/lib/types/types";

interface GuestsTableProps {
  guests: Guest[];
  setIsDialogOpen: (open: boolean) => void;
  setEditGuest: (guest: Guest) => void;
}

interface GuestToDelete {
  id: number;
  firstName: string;
  lastName: string;
}

const getVerificationColor = (status: string) => {
  switch (status) {
    case "verified":
      return "default";
    case "pending":
      return "outline";
    case "rejected":
      return "destructive";
    default:
      return "secondary";
  }
};

function GuestsTable({
  guests,
  setEditGuest,
  setIsDialogOpen,
}: GuestsTableProps) {
  const deleteMutation = useDeleteGuest();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState<GuestToDelete | null>(
    null
  );

  const handleDeleteClick = (guest: GuestToDelete) => {
    setGuestToDelete(guest);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (guestToDelete) {
      deleteMutation.mutate(guestToDelete.id);
    }
  };

  return (
    <>
      <div className="rounded-lg border border-border overflow-hidden pb-6">
        <Table className="px-2">
          <TableHeader>
            <TableRow className="bg-muted capitalize text-left">
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
                total nights
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                last stay
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guests.map((guest) => (
              <TableRow key={guest.id} className="font-medium">
                <TableCell>
                  {guest.firstName} {guest.lastName}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      getVerificationColor(
                        guest.verificationStatus || "pending"
                      ) as "default" | "secondary" | "destructive" | "outline"
                    }
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
                <TableCell>{guest.totalStays}</TableCell>
                <TableCell>{guest.totalNights}</TableCell>
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
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        className="hover:bg-primary/30 focus:bg-primary/30 cursor-pointer"
                        asChild
                      >
                        <Link
                          href={`/guests/${guest.id}`}
                          className="flex gap-2 items-center"
                        >
                          <Eye className="size-4 text-muted-foreground" />
                          <span className="text-accent-foreground">
                            View details
                          </span>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => {
                          setEditGuest(guest);
                          setIsDialogOpen(true);
                        }}
                        className="hover:bg-primary/30 focus:bg-primary/30 cursor-pointer"
                      >
                        <div className="flex gap-2 items-center">
                          <Pencil className="size-4 text-muted-foreground" />
                          <span className="text-accent-foreground">
                            Edit guest
                          </span>
                        </div>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        disabled={
                          shouldDisableDelete(guest) || deleteMutation.isPending
                        }
                        className={cn(
                          "hover:bg-chart-5/30 focus:bg-chart-5/30 cursor-pointer",
                          deleteMutation.isPending &&
                            "cursor-not-allowed opacity-40"
                        )}
                        onClick={() =>
                          handleDeleteClick({
                            id: guest.id,
                            firstName: guest.firstName,
                            lastName: guest.lastName,
                          })
                        }
                      >
                        <div className="flex gap-2 items-center">
                          <Trash2 className="size-4 text-red-500" />
                          <span className="text-red-500">Delete guest</span>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        guest={{
          firstName: guestToDelete?.firstName,
          lastName: guestToDelete?.lastName,
        }}
      />
    </>
  );
}

export { GuestsTable };
