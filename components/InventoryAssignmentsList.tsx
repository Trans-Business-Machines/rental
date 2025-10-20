"use client";

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
import Pagination from "./Pagination";

interface Assignment {
  id: number;
  serialNumber?: string;
  notes?: string;
  isActive: boolean;
  assignedAt: Date;
  returnedAt?: Date;
  inventoryItem: {
    id: number;
    itemName: string;
    category: string;
  };
  unit?: {
    id: number;
    name: string;
  };
  property?: {
    id: number;
    name: string;
  };
}

interface InventoryAssignmentsListProps {
  assignments: Assignment[];
  onUpdate?: () => void;
  showReturnButton?: boolean;
}

export function InventoryAssignmentsList({
  assignments,
  onUpdate,
  showReturnButton = true,
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

  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No assignments found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Assignments
          </CardTitle>
          <CardDescription>
            {assignments.length} assignment{assignments.length !== 1 ? "s" : ""}{" "}
            found
          </CardDescription>
        </CardHeader>
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
                      <div className="font-medium">
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
                      <Badge variant="outline">{assignment.serialNumber}</Badge>
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
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <Pagination />
    </div>
  );
}
