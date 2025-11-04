"use client";

import { InventoryDialog } from "@/components/InventoryDialog";
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
import { Edit, Plus, Search, Package } from "lucide-react";
import { useState } from "react";
import Pagination from "@/components/Pagination";
import { useFilter } from "@/hooks/useFilter";
import { SearchNotFound } from "@/components/SearchNotFound";
import { ItemsNotFound } from "@/components/ItemsNotFound";
import type { InvetoryItem } from "@/lib/types/types";

interface InventoryTableProps {
  items: InvetoryItem[];
}

function getInventoryStatus(item: InvetoryItem) {
  const assignedQuantity = item.assignments.length;
  const availableQuantity = item.quantity - assignedQuantity;

  if (availableQuantity <= 0) {
    return { status: "critical", label: "Critical" };
  } else if (availableQuantity < item.quantity) {
    return { status: "low", label: "Low Stock" };
  } else {
    return { status: "good", label: "Good" };
  }
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
          className="bg-yellow-500 hover:bg-yellow-600 text-white"
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

export function InventoryTable({ items }: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = useFilter({
    items,
    searchTerm,
    searchFields: ["itemName"],
  });

  if (!items || items.length === 0) {
    return (
      <ItemsNotFound
        title="No Inventory Items found!"
        message="Go to inventory page to add inventory items."
        icon={Package}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:gap-0 md:flex-row  md:items-center md:justify-between">
          <div>
            <CardTitle>Inventory Management</CardTitle>
            <CardDescription>
              Track supplies and maintenance items
            </CardDescription>
          </div>

          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by item name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-xs md:w-lg"
            />
          </div>
        </div>
      </CardHeader>
      {filteredItems.length === 0 ? (
        <SearchNotFound
          title="No inventory items matches the search criteria."
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
                {filteredItems.map((item) => {
                  const assignedQuantity = item.assignments.length;
                  const availableQuantity = item.quantity - assignedQuantity;
                  const inventoryStatus = getInventoryStatus(item);

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium capitalize">
                        {item.itemName}
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{availableQuantity}</TableCell>
                      <TableCell>{assignedQuantity}</TableCell>
                      <TableCell>
                        {getInventoryBadge(inventoryStatus.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <InventoryDialog>
                            <Button variant="ghost" size="icon">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </InventoryDialog>
                          <InventoryEditDialog item={item}>
                            <Button variant="ghost" size="icon">
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
        <Pagination />
      </CardFooter>
    </Card>
  );
}
