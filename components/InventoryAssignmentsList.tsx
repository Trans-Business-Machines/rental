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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowRight,
  MapPin,
  Package,
  AlertTriangle,
  Undo2,
  Ban,
} from "lucide-react";
import { SearchNotFound } from "./SearchNotFound";
import { ReturnAssignmentDialog } from "@/components/Returnassignmentdialog";
import { format } from "date-fns";
import type { Assignment } from "@/lib/types/types";

interface InventoryAssignmentsListProps {
  assignments: Assignment[];
  showReturnButton?: boolean;
  totalAssignments: number;
  emptyTitle?: string;
}

function formatQty(value: number) {
  return Number(value.toFixed(2)).toLocaleString();
}

/**
 * Four statuses replace the old active/returned boolean:
 *   active  — out in a unit, return expected
 *   partial — some returned or written off, remainder still out
 *   issued  — consumable, consumed on assignment, never returning
 *   closed  — settled, by returns, write-offs or both
 */
function StatusBadge({ assignment }: { assignment: Assignment }) {
  switch (assignment.status) {
    case "active":
      return <Badge variant="default">In unit</Badge>;

    case "partial":
      return (
        <Badge
          variant="secondary"
          className="bg-amber-500 text-white hover:bg-amber-600"
        >
          {assignment.returnedQuantity > 0
            ? "Partially returned"
            : "Partly written off"}
        </Badge>
      );

    case "issued":
      return (
        <Badge variant="outline" className="font-normal">
          Consumed
        </Badge>
      );

    case "closed":
      // A closed assignment with a shortfall means items were written off.
      return assignment.writtenOffQuantity > 0 ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="destructive" className="cursor-default">
              Written off
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            {formatQty(assignment.writtenOffQuantity)}{" "}
            {assignment.inventoryItem.unitOfMeasure} written off
            {assignment.returnedQuantity > 0 &&
              `, ${formatQty(assignment.returnedQuantity)} returned`}
          </TooltipContent>
        </Tooltip>
      ) : (
        <Badge variant="secondary">Returned</Badge>
      );

    default:
      return <Badge variant="outline">{assignment.status}</Badge>;
  }
}

export function InventoryAssignmentsList({
  assignments,
  showReturnButton = true,
  totalAssignments,
  emptyTitle = "No assignment matches the search criteria.",
}: InventoryAssignmentsListProps) {
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
          <SearchNotFound title={emptyTitle} icon={Package} />
        ) : (
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Still out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assign period</TableHead>
                  {showReturnButton && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>

              <TableBody>
                {assignments.map((assignment) => {
                  const uom = assignment.inventoryItem.unitOfMeasure;

                  return (
                    <TableRow
                      key={assignment.id}
                      className={
                        assignment.needsAttention
                          ? "bg-destructive/5"
                          : undefined
                      }
                    >
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium capitalize">
                            {assignment.inventoryItem.itemName}
                          </span>

                          {/* Stays visible until the issue is settled, so
                              nobody has to remember it after the toast */}
                          {assignment.needsAttention && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant="destructive"
                                  className="cursor-default gap-1"
                                >
                                  <AlertTriangle className="h-3 w-3" />
                                  {assignment.openIssueCount} open{" "}
                                  {assignment.openIssueCount === 1
                                    ? "issue"
                                    : "issues"}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                Write off what&apos;s gone, or resolve the issue
                                from the item&apos;s page if it was repaired.
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>

                        <div className="text-sm text-muted-foreground">
                          {assignment.inventoryItem.category.replace(/_/g, " ")}
                        </div>

                        {assignment.serialNumber && (
                          <div className="text-xs text-muted-foreground">
                            {assignment.serialNumber}
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {assignment.unit.property.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {assignment.unit.name}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-right tabular-nums">
                        <span className="font-medium">
                          {formatQty(assignment.quantity)}
                        </span>
                        <span className="ml-1 text-xs text-muted-foreground">
                          {uom}
                        </span>
                        {assignment.returnedQuantity > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {formatQty(assignment.returnedQuantity)} returned
                          </div>
                        )}
                        {assignment.writtenOffQuantity > 0 && (
                          <div className="text-xs text-destructive">
                            {formatQty(assignment.writtenOffQuantity)} written
                            off
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-right tabular-nums">
                        {assignment.canReturn ? (
                          <>
                            <span className="font-medium">
                              {formatQty(assignment.outstandingQuantity)}
                            </span>
                            <span className="ml-1 text-xs text-muted-foreground">
                              {uom}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        <StatusBadge assignment={assignment} />
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span>
                            {format(
                              new Date(assignment.assignedAt),
                              "dd/MM/yyyy",
                            )}
                          </span>
                          {assignment.returnedAt && (
                            <>
                              <ArrowRight className="mx-1 size-4" />
                              <span>
                                {format(
                                  new Date(assignment.returnedAt),
                                  "dd/MM/yyyy",
                                )}
                              </span>
                            </>
                          )}
                        </div>
                      </TableCell>

                      {showReturnButton && (
                        <TableCell className="text-right">
                          {assignment.canReturn ? (
                            <div className="flex justify-end gap-2">
                              {assignment.needsAttention && (
                                <ReturnAssignmentDialog
                                  assignment={assignment}
                                  initialMode="writeoff"
                                >
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="cursor-pointer"
                                  >
                                    <Ban className="mr-1.5 h-3.5 w-3.5" />
                                    Write off
                                  </Button>
                                </ReturnAssignmentDialog>
                              )}
                              <ReturnAssignmentDialog assignment={assignment}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="cursor-pointer"
                                >
                                  <Undo2 className="mr-1.5 h-3.5 w-3.5" />
                                  Return
                                </Button>
                              </ReturnAssignmentDialog>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
