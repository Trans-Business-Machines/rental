"use client";

import { Button } from "./ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Package, Download, Eye, Bed } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectGroup,
} from "./ui/select";
import { useState } from "react";
import { Funnel } from "lucide-react";
import Pagination from "./Pagination";
import type { CheckoutReport } from "@/lib/types/types";

interface InventortyCheckoutReportsProps {
  reports: CheckoutReport[];
}

function InventortyCheckoutReports({
  reports,
}: InventortyCheckoutReportsProps) {
  const [order, setOrder] = useState<"none" | "asc" | "desc" | "">("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!reports || reports.length === 0) {
    return (
      <article className="text-center py-8">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium">No checkout reports found</h3>
        <p className="text-muted-foreground">
          Checkout reports will appear here after guest checkouts are completed.
        </p>
      </article>
    );
  }

  return (
    <section className="space-y-1">
      {/* Filters */}
      <header className="flex justify-end">
        <div className="flex gap-2">
          <div className="px-4 flex shadow-sm justify-center items-center  border border-border  rounded-md">
            <Funnel className="size-5 text-accent-foreground/60" />
          </div>

          <Select
            value={order}
            onValueChange={(value: "none" | "asc" | "desc" | "") =>
              setOrder(value)
            }
          >
            <SelectTrigger className="w-xs">
              <SelectValue placeholder="Sort by ..."></SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sort by</SelectLabel>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
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
                    {formatDate(report.checkoutDate)}
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
        ))}
      </div>

      {/* Pagination */}
      <footer className="mt-4 mb-2">
        <Pagination />
      </footer>
    </section>
  );
}

export { InventortyCheckoutReports };
