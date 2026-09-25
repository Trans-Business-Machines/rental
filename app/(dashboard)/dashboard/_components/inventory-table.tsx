"use client";

import { InventoryActions } from "@/components/InventoryActions";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Input } from "@/components/ui/input";
import {
  Search,
  Package,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { SearchNotFound } from "@/components/SearchNotFound";
import { ItemsNotFound } from "@/components/ItemsNotFound";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import type { InventoryItem } from "@/lib/types/types";

interface InventoryFilters {
  search: string;
}

interface InventoryTableProps {
  items: InventoryItem[];
  totalPages: string | number;
  hasNext: boolean;
  hasPrev: boolean;
  currentPage: number;
  initialFilters: InventoryFilters;
}

/** Laundry is used centrally, so an "assigned" figure is always zero. */
const NEVER_ASSIGNED = new Set(["laundry"]);

/** Trim trailing zeros: 2.50 -> 2.5, 40.00 -> 40 */
function formatQty(value: number) {
  return Number(value.toFixed(2)).toLocaleString();
}

/**
 * Stock state comes straight off the item now — needsRestock is derived
 * server-side from availableQuantity <= restockAt, so each item is
 * judged against its own threshold rather than a shared constant.
 */
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
        {/* Assets keep spares in store — "low" there means few spares */}
        {NEVER_ASSIGNED.has(item.category) || item.assignedQuantity === 0
          ? "Low stock"
          : "Spares low"}
      </Badge>
    );
  }

  return (
    <Badge variant="default" className="bg-green-500 hover:bg-green-600">
      Good
    </Badge>
  );
}

export function InventoryTable({
  items,
  hasNext,
  hasPrev,
  totalPages,
  currentPage,
  initialFilters,
}: InventoryTableProps) {
  const { searchValue, isSearching, handleSearchChange } = useDebouncedSearch({
    tab: "inventory",
  });

  const hasActiveFilters = initialFilters.search !== "";

  if (items.length === 0 && !hasActiveFilters) {
    return (
      <ItemsNotFound
        title="No inventory items found!"
        message="Go to inventory page to add inventory items."
        icon={Package}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-0">
          <div>
            <CardTitle>Inventory Management</CardTitle>
            <CardDescription>
              Track supplies and maintenance items
            </CardDescription>
          </div>

          <div className="flex flex-col items-center gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by item name..."
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-xs pl-8 md:w-64 lg:w-96"
              />
              {isSearching && (
                <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      {items.length === 0 && hasActiveFilters ? (
        <SearchNotFound
          title="No inventory items match the search criteria."
          icon={Package}
        />
      ) : (
        <CardContent>
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
                  {/* Same order as the main inventory table */}
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

                    <TableCell className="text-right tabular-nums">
                      <span className="font-medium">
                        {formatQty(item.availableQuantity)}
                      </span>
                      <span className="ml-1 text-xs text-muted-foreground">
                        {item.unitOfMeasure}
                      </span>
                    </TableCell>

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

                    {/* available + assigned, derived rather than stored */}
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
        </CardContent>
      )}

      <CardFooter>
        <Footer
          currentPage={currentPage}
          totalPages={totalPages}
          hasNext={hasNext}
          hasPrev={hasPrev}
          paramName="page"
          preserveParams={["tab", "search", "status"]}
        />
      </CardFooter>
    </Card>
  );
}