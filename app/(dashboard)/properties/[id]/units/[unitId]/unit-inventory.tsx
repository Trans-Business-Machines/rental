"use client";

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
import Link from "next/link";
import type { GroupedAssigments } from "@/lib/types/types";
import { usePermissions } from "@/hooks/usePermissions";

interface Assignments {
  assignments: GroupedAssigments;
  context: {
    unitId: number;
    propertyId: number;
  };
}

/** Trim trailing zeros: 2.50 -> 2.5, 12.00 -> 12 */
function formatQty(value: number) {
  return Number(value.toFixed(2)).toLocaleString();
}

export default function UnitInventory({ assignments, context }: Assignments) {
  const { isAgent } = usePermissions();

  return (
    <Card className="rounded-xl border-border bg-card shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">
              Inventory & Assignments
            </CardTitle>
            {assignments.length > 0 && (
              <p className="mt-1 text-sm text-muted-foreground">
                What&apos;s currently out in this unit and not yet returned.
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
            <div className="mb-4 rounded-full bg-muted p-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-1 font-semibold text-foreground">
              No inventory items assigned yet.
            </h3>
            <p className="text-sm text-muted-foreground">
              Add items or assign items to track what&apos;s in this unit
            </p>
          </div>
        ) : (
          <div className="max-h-60 space-y-2 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.inventoryItemId}>
                    <TableCell className="text-sm capitalize">
                      <Link
                        href={`/inventory/${assignment.inventoryItemId}`}
                        className="hover:underline"
                      >
                        {assignment.itemName}
                      </Link>
                    </TableCell>

                    <TableCell className="text-sm capitalize">
                      {assignment.category.replace(/_/g, " ")}
                    </TableCell>

                    {/* Summed across assignments, net of returns —
                        not a count of assignment rows. */}
                    <TableCell className="text-right text-sm tabular-nums">
                      {formatQty(assignment.quantity)}
                      <span className="ml-1 text-xs text-muted-foreground">
                        {assignment.unitOfMeasure}
                      </span>
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
