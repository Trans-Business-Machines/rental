import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "./ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Eye, SquarePen, Move, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InvetoryItem } from "@/lib/types/types";

interface InventoryItemsTableProps {
  items: InvetoryItem[];
}

function InventoryItemsTable({ items }: InventoryItemsTableProps) {
  return (
    <div className="rounded-lg overflow-hidden border border-border shadow-sm">
      <Table className="px-2 max-w-7xl">
        <TableHeader className="py-2">
          <TableRow className="bg-muted capitalize text-left font-bold hover:bg-muted">
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Available</TableHead>
            <TableHead>Assigned</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="group">
              <TableCell className="capitalize">{item.itemName}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>
                <Badge
                  className={cn(
                    "capitalize text-sm font-medium border-0",
                    item.status === "active" && "bg-green-100 text-green-700 ",
                    item.status === "discontinued" && "bg-red-100 text-red-700"
                  )}
                >
                  {item.status}
                </Badge>
              </TableCell>
              <TableCell>{item.availableQuantity || 0}</TableCell>
              <TableCell>{item.assignedQuantity || 0}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "cursor-pointer",
                        "data-[state=open]:opacity-100"
                      )}
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem className="hover:bg-primary/30 focus:bg-primary/30">
                      <Eye className="size-4 text-muted-foreground" />
                      <span>View details</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-primary/30 focus:bg-primary/30">
                      <SquarePen className="size-4 text-muted-foreground" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    {item.assignableOnBooking && (
                      <DropdownMenuItem className="hover:bg-primary/30 focus:bg-primary/30">
                        <Move className="size-4 text-muted-foreground" />
                        <span>Assign/move</span>
                      </DropdownMenuItem>
                    )}
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

export { InventoryItemsTable };
