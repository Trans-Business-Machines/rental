"use client";

import { useState, useTransition } from "react";
import { Button } from "./ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Package,
  Download,
  Eye,
  Bed,
  Search,
  File,
  Loader,
} from "lucide-react";
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
import { format } from "date-fns";
import { ItemsNotFound } from "./ItemsNotFound";
import { SearchNotFound } from "./SearchNotFound";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/Footer";
import type { CheckoutReport, sortTypes } from "@/lib/types/types";

interface CheckoutReportFilters {
  search: string;
  sortOrder: "none" | "asc" | "desc";
}

interface InventortyCheckoutReportsProps {
  reports: CheckoutReport[];
  totalPages: string | number;
  hasNext: boolean;
  hasPrev: boolean;
  currentPage: number;
  initialFilters: CheckoutReportFilters;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(amount);
};

function InventortyCheckoutReports({
  reports,
  hasNext,
  hasPrev,
  totalPages,
  currentPage,
  initialFilters,
}: InventortyCheckoutReportsProps) {
  const router = useRouter();

  const [filters, setFilters] = useState<CheckoutReportFilters>(initialFilters);

  // Check if there are any active filters in the URL
  const hasActiveFilters =
    initialFilters.search !== "" || initialFilters.sortOrder !== "none";

  const [isApplyPending, startApplyTransition] = useTransition();
  const [isClearPending, startClearTransition] = useTransition();

  // Combined pending state for disabling inputs
  const isPending = isApplyPending || isClearPending;

  // URL Handlers
  const applyFilters = () => {
    const params = new URLSearchParams();
    params.set("tab", "checkout");
    params.set("page", "1");

    if (filters.search) {
      params.set("search", filters.search);
    }
    if (filters.sortOrder !== "none") {
      params.set("sortOrder", filters.sortOrder);
    }

    startApplyTransition(() => router.push(`/inventory?${params.toString()}`));
  };

  const clearFilters = () => {
    // Reset local state
    setFilters({
      search: "",
      sortOrder: "none",
    });

    // Update URL
    startClearTransition(() => {
      router.push("/inventory?tab=checkout&page=1");
    });
  };

  if (reports.length === 0 && !hasActiveFilters) {
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
      {/*Search and  Filters */}
      <header className="flex flex-col gap-2 lg:gap-4 mb-4">
        <div className="flex flex-col md:flex-row gap-2 lg:pr-8">
          {/* ItemName filter */}
          <div className="relative md:w-3/5">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search reports by guest name . . ."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="pl-10"
            />
          </div>

          <Select
            value={filters.sortOrder}
            onValueChange={(value: sortTypes) =>
              setFilters((prev) => ({ ...prev, sortOrder: value }))
            }
          >
            <SelectTrigger className="w-full md:w-2/5">
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

        <div className="flex items-center gap-2">
          <Button
            onClick={applyFilters}
            disabled={isPending}
            className="cursor-pointer px-12"
          >
            {isApplyPending ? (
              <span className="flex items-center gap-2">
                <Loader className="size-4  animate-spin" />
                Searching
              </span>
            ) : (
              "Apply filters"
            )}
          </Button>
          <Button
            onClick={clearFilters}
            disabled={isPending}
            className="cursor-pointer px-12 bg-chart-5 hover:bg-red-600"
          >
            {isClearPending ? (
              <span className="flex items-center gap-2">
                <Loader className="size-4  animate-spin" />
                Clearing
              </span>
            ) : (
              "Clear filters"
            )}
          </Button>
        </div>
      </header>

      {/* Report grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.length === 0 && !hasActiveFilters ? (
          <SearchNotFound
            title="No report matches the search criteria."
            className="md:col-span-2 lg:col-span-3"
            icon={File}
          />
        ) : (
          reports.map((report) => (
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

      {/*Footer and Pagination */}
      <Footer
        currentPage={currentPage}
        hasNext={hasNext}
        hasPrev={hasPrev}
        totalPages={totalPages}
        paramName="page"
        preserveParams={["tab", "search", "sortOrder"]}
      />
    </section>
  );
}

export { InventortyCheckoutReports };
