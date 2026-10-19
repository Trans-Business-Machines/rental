"use client";

import { Badge } from "@/components/ui/badge";
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
import { AlertTriangle } from "lucide-react";
import { InventoryActions } from "@/components/InventoryActions";
import { getCategoryDisplay } from "@/lib/inventory-categories";
import type { InventoryItem } from "@/lib/types/types";
import { cn } from "@/lib/utils";
import { USAGE_TRACKED_CATEGORIES } from "@/lib/inventory-categories";

/**
 * Usage tracked supplies (laundry, housekeeping, office) are never assigned,
 * so an "assigned" figure is always zero and reads as missing data.
 */
const NEVER_ASSIGNED = new Set<string>(USAGE_TRACKED_CATEGORIES);

/** Trim trailing zeros: 2.50 -> 2.5, 40.00 -> 40 */
function formatQty(value: number) {
  return Number(value.toFixed(2)).toLocaleString();
}

function StockBadge({ item }: { item: InventoryItem }) {
  if (item.availableQuantity <= 0) {
    return <Badge variant="destructive">Out of stock</Badge>;
  }

  if (item.needsRestock) {
    return (
      <Badge
        variant="secondary"
        className="bg-amber-500 text-white hover:bg-amber-600"
      >
        {/* Assets keep spares in store, so "low" means few spares, not empty */}
        {NEVER_ASSIGNED.has(item.category) || item.assignedQuantity === 0
          ? "Low stock"
          : "Spares low"}
      </Badge>
    );
  }

  return (
    <Badge variant="default" className="bg-green-600 hover:bg-green-700">
      In stock
    </Badge>
  );
}

interface InventoryItemsTableProps {
  items: InventoryItem[];
}

export function InventoryItemsTable({ items }: InventoryItemsTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead className="font-semibold text-foreground">
              Item
            </TableHead>
            <TableHead className="font-semibold text-foreground">
              Property
            </TableHead>
            <TableHead className="font-semibold text-foreground">
              Category
            </TableHead>
            <TableHead className="text-right font-semibold text-foreground">
              Available
            </TableHead>
            <TableHead className="text-right font-semibold text-foreground">
              Assigned
            </TableHead>
            <TableHead className="text-right font-semibold text-foreground">
              Total
            </TableHead>
            <TableHead className="font-semibold text-foreground">
              Status
            </TableHead>
            <TableHead className="text-right font-semibold text-foreground">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <span className="capitalize">{item.itemName}</span>

                  {item.openIssueCount > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex items-center gap-1 text-amber-600">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">
                            {item.openIssueCount}
                          </span>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {item.openIssueCount} unresolved{" "}
                        {item.openIssueCount === 1 ? "issue" : "issues"}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </TableCell>

              <TableCell className="text-sm text-muted-foreground">
                {item.property.name}
              </TableCell>

              <TableCell className="text-sm">
                <Badge
                  variant="outline"
                  className={cn(
                    "font-normal",
                    getCategoryDisplay(item.category).badgeClassName,
                  )}
                >
                  {getCategoryDisplay(item.category).label}
                </Badge>
              </TableCell>

              {/* In the store, free to assign or use */}
              <TableCell className="text-right tabular-nums">
                <span className="font-medium">
                  {formatQty(item.availableQuantity)}
                </span>
                <span className="ml-1 text-xs text-muted-foreground">
                  {item.unitOfMeasure}
                </span>
              </TableCell>

              {/* Still out in units and expected back */}
              <TableCell className="text-right tabular-nums">
                {NEVER_ASSIGNED.has(item.category) ? (
                  <span className="text-xs text-muted-foreground">—</span>
                ) : (
                  <>
                    <span
                      className={
                        item.assignedQuantity > 0
                          ? "font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      {formatQty(item.assignedQuantity)}
                    </span>
                    <span className="ml-1 text-xs text-muted-foreground">
                      {item.unitOfMeasure}
                    </span>
                  </>
                )}
              </TableCell>

              {/* available + assigned — derived, never stored */}
              <TableCell className="text-right tabular-nums">
                <span className="font-semibold">
                  {formatQty(item.totalOwned)}
                </span>
                <span className="ml-1 text-xs text-muted-foreground">
                  {item.unitOfMeasure}
                </span>
              </TableCell>

              <TableCell>
                <StockBadge item={item} />
              </TableCell>

              <TableCell className="text-right">
                <InventoryActions item={item} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
