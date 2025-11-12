import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "./ui/table";
import { InventoryActions } from "./InventoryActions";
import type { InventoryItem } from "@/lib/types/types";

interface InventoryItemsTableProps {
  items: InventoryItem[];
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
                <InventoryActions item={item} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export { InventoryItemsTable };
