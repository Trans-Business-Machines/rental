"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Package, Download, Eye, Bed, Search, File } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectGroup,
} from "./ui/select";
import { Input } from "./ui/input";
import { useFilter } from "@/hooks/useFilter";
import { useSort } from "@/hooks/useSort";
import { format } from "date-fns";
import Pagination from "./Pagination";
import { ItemsNotFound } from "./ItemsNotFound";
import { SearchNotFound } from "./SearchNotFound";
import type { CheckoutReport, sortTypes } from "@/lib/types/types";

interface InventortyCheckoutReportsProps {
  reports: CheckoutReport[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(amount);
};

function InventortyCheckoutReports({
  reports,
}: InventortyCheckoutReportsProps) {
  // State for sorting reports by date and time
  const [order, setOrder] = useState<sortTypes>("none");

  // State to filter reports by guest name
  const [searchTerm, setSearchTerm] = useState("");

  const filteredReports = useFilter<CheckoutReport>({
    items: reports,
    searchTerm,
    searchFields: ["guest.firstName", "guest.lastName"],
  });

  const sortedReports = useSort<CheckoutReport>({
    sortItems: filteredReports,
    sortOrder: order,
    sortKey: "checkoutDate",
  });

  if (!reports || reports.length === 0) {
    return (
      <ItemsNotFound
        title="No reports found!"
        icon={File}
        message="Checkout reports will appear here when a guest checks out."
      />
    );
  }

  return (
    <section className="space-y-1">
      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {/* ItemName filter */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search reports by guest name . . ."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={order}
          onValueChange={(value: sortTypes) => setOrder(value)}
        >
          <SelectTrigger className="w-xs">
            <SelectValue placeholder="Sort by . . ."></SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Sort by</SelectLabel>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="asc">
                Date: Ascending (Earliest first)
              </SelectItem>
              <SelectItem value="desc">
                Date: Descending (Latest first)
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Report grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedReports.length === 0 ? (
          <SearchNotFound
            title="No report matches the search criteria."
            className="md:col-span-2 lg:col-span-3"
            icon={File}
          />
        ) : (
          sortedReports.map((report) => (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {report.guest.firstName} {report.guest.lastName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {report.guest.email}
                    </p>
                  </div>
                  <Badge
                    variant={
                      report.status === "completed" ? "default" : "secondary"
                    }
                  >
                    {report.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Property Information */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Bed className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {report.booking.property.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {report.booking.unit.name}
                    </span>
                  </div>
                </div>

                {/* Checkout Date and Inspector */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-2 bg-muted/50 rounded-lg">
                    <p className="font-medium">Checkout Date</p>
                    <p className="text-muted-foreground">
                      {format(new Date(report.checkoutDate), "dd/MM/yyyy")}
                    </p>
                  </div>
                  <div className="text-center p-2 bg-muted/50 rounded-lg">
                    <p className="font-medium">Inspector</p>
                    <p className="text-muted-foreground">{report.inspector}</p>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Damage Cost
                    </span>
                    <span
                      className={
                        report.totalDamageCost > 0
                          ? "text-red-600 font-medium"
                          : "text-green-600 font-medium"
                      }
                    >
                      {formatCurrency(report.totalDamageCost)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Deposit Deduction
                    </span>
                    <span
                      className={
                        report.depositDeduction > 0
                          ? "text-red-600 font-medium"
                          : "text-green-600 font-medium"
                      }
                    >
                      {formatCurrency(report.depositDeduction)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1 gap-2 bg-chart-1 hover:bg-chart-1/90"
                  >
                    <Eye className="size-4 mr-2" />
                    <span> View</span>
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 gap-2 bg-chart-3 hover:bg-chart-3/90"
                  >
                    <Download className="size-4 mr-2" />
                    <span>Download</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      <footer className="mt-4 mb-2">
        <Pagination />
      </footer>
    </section>
  );
}

export { InventortyCheckoutReports };
