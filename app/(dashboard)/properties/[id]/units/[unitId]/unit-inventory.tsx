import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { InventoryDialog } from "@/components/InventoryDialog";
import { format } from "date-fns";
import type { UnitAssignment } from "@/lib/types/types";

interface Assignments {
  assignments: UnitAssignment[];
}

export default function UnitInventory({ assignments }: Assignments) {
  return (
    <Card className="border-border shadow-sm bg-card rounded-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">
              Inventory & Assignments
            </CardTitle>
            {assignments.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                This table shows the lastest {assignments.length}{" "}
                {assignments.length === 1 ? " assignment" : " assignments"}.
              </p>
            )}
          </div>
          <InventoryDialog>
            <Button
              size="sm"
              className="gap-2 cursor-pointer bg-chart-1 hover:bg-chart-1/90"
            >
              <Plus className="size-4" />
              Add Item
            </Button>
          </InventoryDialog>
        </div>
      </CardHeader>
      <CardContent>
        {assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              No inventory items assigned yet.
            </h3>
            <p className="text-sm text-muted-foreground">
              Add items or assign items to track what&apos;s in this unit
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Inventory items list will go here */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Assigned At</TableHead>
                  <TableHead>Returned At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="capitlize text-sm">
                      {assignment.inventoryItem.itemName}
                    </TableCell>
                    <TableCell className="capitlize text-sm">
                      {assignment.inventoryItem.category}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(assignment.assignedAt), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="text-sm">
                      {assignment.returnedAt === null
                        ? "-"
                        : format(new Date(assignment.returnedAt), "dd/MM/yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
