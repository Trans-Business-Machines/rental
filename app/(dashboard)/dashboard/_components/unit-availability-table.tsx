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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Eye, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { UnitEditDialog } from "./unit-edit-dialog";
import { UnitViewDialog } from "./unit-view-dialog";

interface Unit {
  id: string;
  property: string;
  type: string;
  status: string;
  guest: string | null;
  checkOut: string | null;
  rent: number;
}

interface UnitAvailabilityTableProps {
  units: Unit[];
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
        <Badge
          variant="outline"
          className="bg-chart-4/20 border border-chart-4 text-chart-4 text-sm"
        >
          Reserved
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function UnitAvailabilityTable({ units }: UnitAvailabilityTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUnits = units.filter(
    (unit) =>
      unit.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.guest?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:gap-0 md:flex-row  items-center justify-between">
          <div>
            <CardTitle>Unit Availability</CardTitle>
            <CardDescription>
              Overview of all units with their current status and checkout dates
            </CardDescription>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search units..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-xs md:w-lg"
              />
            </div>
          </div>
        </div>
      </CardHeader>
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
              {filteredUnits.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell className="font-medium">{unit.id}</TableCell>
                  <TableCell>{unit.property}</TableCell>
                  <TableCell className="capitalize">{unit.type}</TableCell>
                  <TableCell>{getStatusBadge(unit.status)}</TableCell>
                  <TableCell>{unit.guest || "-"}</TableCell>
                  <TableCell>
                    {unit.checkOut ? (
                      <span className="text-sm">{unit.checkOut}</span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>${unit.rent}</TableCell>
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
      <CardFooter>
        <div className="flex items-center justify-between pt-4 w-full">
          <p className="text-sm text-muted-foreground">Page 1 of 1</p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 bg-transparent"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
