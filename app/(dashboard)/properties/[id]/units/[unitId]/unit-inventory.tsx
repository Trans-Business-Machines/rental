import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { InventoryAssignmentDialog } from "@/components/InventoryAssignmentDialog";
import { Button } from "@/components/ui/button";
import type { GroupedAssigments } from "@/lib/types/types";
import { usePermissions } from "@/hooks/usePermissions";

interface Assignments {
  assignments: GroupedAssigments;
  context: {
    unitId: number;
    propertyId: number;
  };
}

export default function UnitInventory({ assignments, context }: Assignments) {
  const { isAgent } = usePermissions();

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
                This table shows the assignments made to this unit.
              </p>
            )}
          </div>

          {!isAgent && (
            <InventoryAssignmentDialog
              preselectedUnitId={context.unitId}
              preselectedPropertyId={context.propertyId}
            >
              <Button size="sm">Assign item</Button>
            </InventoryAssignmentDialog>
          )}
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
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {/* Inventory items list will go here */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.inventoryItemId}>
                    <TableCell className="capitalize text-sm">
                      {assignment.itemName}
                    </TableCell>

                    <TableCell className="text-sm capitalize">
                      {assignment.category}
                    </TableCell>
                    <TableCell className="text-sm">
                      {assignment.quantity}
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
