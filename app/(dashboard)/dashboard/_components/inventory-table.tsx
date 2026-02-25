// app/(system)/dashboard/_components/inventory-table.tsx
"use client";

import { InventoryEditDialog } from "@/components/InventoryEditDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Edit, Search, Package, Loader2 } from "lucide-react";
import { Footer } from "@/components/Footer";
import { SearchNotFound } from "@/components/SearchNotFound";
import { ItemsNotFound } from "@/components/ItemsNotFound";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { getInventoryStatus } from "@/lib/utils";
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
        <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle>Inventory Management</CardTitle>
            <CardDescription>
              Track supplies and maintenance items
            </CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by item name..."
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8 w-xs md:w-64 lg:w-96"
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
          <div className="rounded-lg overflow-hidden border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="font-semibold text-foreground">
                    Item
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Total Stock
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Available
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Assigned
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const assignedQuantity = item.assignments.length;
                  const inventoryStatus = getInventoryStatus(item);

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium capitalize">
                        {item.itemName}
                      </TableCell>
                      <TableCell>{item.quantity + assignedQuantity}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{assignedQuantity}</TableCell>
                      <TableCell>
                        {getInventoryBadge(inventoryStatus.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <InventoryEditDialog item={item}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="cursor-pointer"
                            >
                              <span>Edit</span>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </InventoryEditDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
