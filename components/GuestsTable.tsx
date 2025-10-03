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
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import type { Guest } from "@/hooks/useGuests";
import { format } from "date-fns";
import { MoreHorizontal, Eye, Pencil, Mail, Phone } from "lucide-react";

interface GuestsTableProps {
  guests: Guest[];
}

const getVerificationColor = (status: string) => {
  switch (status) {
    case "verified":
      return "default";
    case "pending":
      return "secondary";
    case "rejected":
      return "destructive";
    default:
      return "secondary";
  }
};

function GuestsTable({ guests }: GuestsTableProps) {
  return (
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
                    <DropdownMenuItem>
                      <div className="flex gap-2 items-center">
                        <Eye className="size-4 text-muted-foreground" />
                        <span className="text-accent-foreground">
                          View details
                        </span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <div className="flex gap-2 items-center">
                        <Pencil className="size-4 text-muted-foreground" />
                        <span className="text-accent-foreground">
                          Edit guest
                        </span>
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
  );
}

export { GuestsTable };
