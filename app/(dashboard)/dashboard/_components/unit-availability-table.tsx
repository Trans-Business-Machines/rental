"use client";

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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Eye, Search, Home, Loader2 } from "lucide-react";
import { UnitEditDialog } from "./unit-edit-dialog";
import { UnitViewDialog } from "./unit-view-dialog";
import { SearchNotFound } from "@/components/SearchNotFound";
import { ItemsNotFound } from "@/components/ItemsNotFound";
import { Footer } from "@/components/Footer";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import type { UnitStatus } from "@/lib/types/types";

export interface Unit {
  id: number;
  name: string;
  property: string;
  propertyId: number;
  type: string;
  status: UnitStatus;
  guest: string | null;
  checkOut: string | null;
  rent: number;
  isOverstayed: boolean | null;
}

interface UnitFilters {
  search: string;
  status: string;
}

interface UnitAvailabilityTableProps {
  units: Unit[];
  totalPages: string | number;
  hasNext: boolean;
  hasPrev: boolean;
  currentPage: number;
  initialFilters: UnitFilters;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "occupied":
      return (
        <Badge
          variant="default"
          className="bg-chart-5/20 border border-chart-5 text-chart-5 text-sm"
        >
          Occupied
        </Badge>
      );
    case "available":
      return (
        <Badge
          variant="default"
          className="bg-chart-2/20 border border-chart-2 text-chart-2 text-sm"
        >
          Available
        </Badge>
      );
    case "maintenance":
      return (
        <Badge
          variant="secondary"
          className="bg-chart-1/20 border border-chart-1 text-chart-1 text-sm"
        >
          Maintenance
        </Badge>
      );
    case "reserved":
      return (
        <Badge className="bg-chart-4/20 border border-chart-4 text-chart-4 text-sm">
          Reserved
        </Badge>
      );
    case "booked":
      return (
        <Badge className="bg-chart-3/20 border border-chart-3 text-chart-3 text-sm">
          Booked
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function UnitAvailabilityTable({
  units,
  hasNext,
  hasPrev,
  totalPages,
  currentPage,
  initialFilters,
}: UnitAvailabilityTableProps) {
  const { searchValue, isSearching, handleSearchChange, handleStatusChange } =
    useDebouncedSearch({ tab: "units" });

  const hasActiveFilters =
    initialFilters.search !== "" || initialFilters.status !== "all";

  if (units.length === 0 && !hasActiveFilters) {
    return (
      <ItemsNotFound
        title="No units found!"
        icon={Home}
        message="Get started by adding a property then add units."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:gap-0 md:flex-row items-center justify-between">
          <div>
            <CardTitle>Unit Availability</CardTitle>
            <CardDescription>
              Overview of all units with their current status and checkout dates
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search units..."
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8 w-xs md:w-64"
              />
              {isSearching && (
                <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            {/* Status Filter */}
            <Select
              value={initialFilters.status}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      {units.length === 0 && hasActiveFilters ? (
        <SearchNotFound
          title="No units match the search criteria."
          icon={Home}
        />
      ) : (
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table className="px-2">
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="font-semibold text-foreground">
                    Unit
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Property
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Type
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Current Guest
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Checkout Date
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Monthly Rent
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">{unit.name}</TableCell>
                    <TableCell>{unit.property}</TableCell>
                    <TableCell className="capitalize">{unit.type}</TableCell>
                    <TableCell>{getStatusBadge(unit.status)}</TableCell>
                    <TableCell>{unit.guest || "-"}</TableCell>
                    <TableCell>
                      {unit.checkOut ? (
                        <span
                          className={
                            unit.isOverstayed
                              ? "text-red-600 font-medium"
                              : "text-sm"
                          }
                        >
                          {unit.checkOut}
                          {unit.isOverstayed && " (Overstayed)"}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>Ksh. {unit.rent}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UnitViewDialog unit={unit}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </UnitViewDialog>
                        <UnitEditDialog unit={unit}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </UnitEditDialog>
                      </div>
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
