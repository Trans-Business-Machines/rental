import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { returnInventoryAssignment } from "@/lib/actions/inventory";
import { ArrowLeft, Calendar, MapPin, Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SearchNotFound } from "./SearchNotFound";
import type { Assignment } from "@/lib/types/types";

interface InventoryAssignmentsListProps {
  assignments: Assignment[];
  onUpdate?: () => void;
  showReturnButton?: boolean;
  totalAssignments: number;
}

export function InventoryAssignmentsList({
  assignments,
  onUpdate,
  showReturnButton = true,
  totalAssignments,
}: InventoryAssignmentsListProps) {
  const [returningIds, setReturningIds] = useState<Set<number>>(new Set());

  const handleReturn = async (assignmentId: number) => {
    setReturningIds((prev) => new Set(prev).add(assignmentId));

    try {
      await returnInventoryAssignment(
        assignmentId,
        "Returned via web interface"
      );
      toast.success("Item returned successfully");
      onUpdate?.();
    } catch (error) {
      console.error("Error returning assignment:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to return item"
      );
    } finally {
      setReturningIds((prev) => {
        const next = new Set(prev);
        next.delete(assignmentId);
        return next;
      });
    }
  };

  return (
    <div className="space-y-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Assignments
          </CardTitle>
          <CardDescription>
            {totalAssignments === 1
              ? `${totalAssignments} assignment`
              : `${totalAssignments} assignments`}
            &nbsp;found
          </CardDescription>
        </CardHeader>
        {assignments.length === 0 ? (
          <SearchNotFound
            title="No assignment matches the search criteria."
            icon={Package}
          />
        ) : (
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned</TableHead>
                  {showReturnButton && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium capitalize">
                          {assignment.inventoryItem.itemName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {assignment.inventoryItem.category}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          {assignment.property?.name && (
                            <div className="font-medium">
                              {assignment.property.name}
                            </div>
                          )}
                          {assignment.unit?.name && (
                            <div className="text-sm text-muted-foreground">
                              {assignment.unit.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {assignment.serialNumber ? (
                        <Badge variant="outline">
                          {assignment.serialNumber}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={assignment.isActive ? "default" : "secondary"}
                      >
                        {assignment.isActive ? "Active" : "Returned"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(assignment.assignedAt).toLocaleDateString()}
                      </div>
                      {assignment.returnedAt && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <ArrowLeft className="h-4 w-4" />
                          {new Date(assignment.returnedAt).toLocaleDateString()}
                        </div>
                      )}
                    </TableCell>
                    {showReturnButton && (
                      <TableCell>
                        {assignment.isActive ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReturn(assignment.id)}
                            disabled={returningIds.has(assignment.id)}
                          >
                            {returningIds.has(assignment.id)
                              ? "Returning..."
                              : "Return"}
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            —
                          </span>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
