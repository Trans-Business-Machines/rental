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
import { ArrowRight, Loader, MapPin, Package } from "lucide-react";
import { useState } from "react";
import { SearchNotFound } from "./SearchNotFound";
import { returnInventoryAssignment } from "@/lib/actions/inventory";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Assignment } from "@/lib/types/types";

interface InventoryAssignmentsListProps {
  assignments: Assignment[];
  showReturnButton?: boolean;
  totalAssignments: number;
}

export function InventoryAssignmentsList({
  assignments,
  showReturnButton = true,
  totalAssignments,
}: InventoryAssignmentsListProps) {
  // state to handle the dialog open state
  const [isReturning, setIsReturning] = useState(false);
  const [returnID, setReturnID] = useState<number | null>(null);

  const handleReturn = async (assignmentId: number) => {
    try {
      setIsReturning(true);
      setReturnID(assignmentId);
      await returnInventoryAssignment(assignmentId);

      toast.success("Item returned successfully");
    } catch (error) {
      console.error("Error returning assignment:", error);

      const errorMessage = "Failed to return item, try again.";

      toast.error(errorMessage);
    } finally {
      setIsReturning(false);
      setReturnID(null);
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
                  <TableHead>Status</TableHead>
                  <TableHead>Assign Period</TableHead>
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
                      <Badge
                        variant={assignment.isActive ? "default" : "secondary"}
                      >
                        {assignment.isActive ? "Active" : "Returned"}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex">
                      <div className="flex items-center text-sm text-muted-foreground">
                        {format(new Date(assignment.assignedAt), "dd/MM/yyyy")}
                      </div>
                      {assignment.returnedAt && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <ArrowRight className="size-4 mx-1" />
                          {format(
                            new Date(assignment.returnedAt),
                            "dd/MM/yyyy",
                          )}
                        </div>
                      )}
                    </TableCell>

                    {showReturnButton && (
                      <TableCell>
                        {assignment.isActive ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReturn(assignment.id)}
                            className="cursor-pointer"
                            disabled={isReturning && assignment.id === returnID}
                          >
                            {isReturning && assignment.id === returnID ? (
                              <span className="inline-flex gap-1 items-center">
                                <Loader className="animate-spin" />
                                <span>Returning</span>
                              </span>
                            ) : (
                              " Return"
                            )}
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
