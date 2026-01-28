"use client";

import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { format } from "date-fns";
import { MoreHorizontal, Eye, Pencil, Mail, Phone, Archive } from "lucide-react";
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
import { cn, shouldDisableDelete } from "@/lib/utils";
import type { GuestsTableAndCardsProps } from "@/lib/types/types";

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
  handleClick,
  isArchivePending,
  setIsDialogOpen,
}: GuestsTableAndCardsProps) {
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
              <TableHead className="font-semibold text-center  text-foreground">
                total stays
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
                <TableCell className="grid place-items-center">{guest.totalStays}</TableCell>
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
                          shouldDisableDelete(guest) || isArchivePending
                        }
                        className={cn(
                          "hover:bg-orange-500/30 focus:bg-orange-5/30 cursor-pointer",
                          isArchivePending && "cursor-not-allowed opacity-40"
                        )}
                        onClick={() => handleClick(guest.id)}
                      >
                        <div className="flex gap-2 items-center">
                          <Archive className="size-4 text-orange-500" />
                          <span className="text-orange-500">Archive guest</span>
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
    </>
  );
}

export { GuestsTable };
