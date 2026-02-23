import { Badge } from "./ui/badge";
import { getInventoryStatus } from "@/lib/utils";
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

function getInventoryBadge(status: string) {
  switch (status) {
    case "good":
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          Good
        </Badge>
      );
    case "low":
      return (
        <Badge
          variant="secondary"
          className="bg-amber-500 hover:bg-amber-600 text-white"
        >
          Low Stock
        </Badge>
      );
    case "critical":
      return <Badge variant="destructive">Critical</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function InventoryItemsTable({ items }: InventoryItemsTableProps) {
  return (
    <div className="rounded-lg overflow-hidden border border-border shadow-sm">
      <Table className="px-2 max-w-7xl">
        <TableHeader className="py-2">
          <TableRow className="bg-muted capitalize text-left font-bold hover:bg-muted">
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Total Stock</TableHead>
            <TableHead>Available</TableHead>
            <TableHead>Assigned</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const itemStatus = getInventoryStatus(item);

            return (
              <TableRow key={item.id} className="group">
                <TableCell className="capitalize">{item.itemName}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>
                  {item.assignedQuantity + item.availableQuantity || 0}
                </TableCell>
                <TableCell>{item.availableQuantity || 0}</TableCell>
                <TableCell>{item.assignedQuantity || 0}</TableCell>
                <TableCell>{getInventoryBadge(itemStatus.status)}</TableCell>
                <TableCell>
                  <InventoryActions item={item} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export { InventoryItemsTable };
