"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  Loader,
  TriangleAlert,
  CheckCircle2,
  Package,
} from "lucide-react";
import { ItemsNotFound } from "./ItemsNotFound";
import { SearchNotFound } from "./SearchNotFound";
import { Footer } from "@/components/Footer";
import type { PropertyNames } from "@/lib/types/types";

const ISSUE_TYPE_OPTIONS = [
  { value: "damaged", label: "Damaged" },
  { value: "missing", label: "Missing" },
  { value: "worn_out", label: "Worn out" },
] as const;

const RESOLUTION_LABELS: Record<string, string> = {
  repair: "Repaired",
  replace: "Replaced",
  discard: "Discarded",
  pending: "Pending",
};

export interface QueueIssue {
  id: string;
  issueType: string;
  quantityAffected: number;
  description: string;
  status: string;
  resolution: string;
  resolutionNotes: string | null;
  cost: number;
  reportedAt: Date | string;
  resolvedAt: Date | string | null;
  assignmentId: string | null;
  isStoreIssue: boolean;
  ageDays: number;
  isStale: boolean;
  reportedBy: { id: string; name: string };
  resolvedBy: { id: string; name: string } | null;
  inventoryItem: {
    id: string;
    itemName: string;
    category: string;
    unitOfMeasure: string;
    property: { id: number; name: string };
  };
  assignment: {
    id: string;
    status: string;
    unit: { id: number; name: string };
  } | null;
}

interface IssueFilters {
  search: string;
  status: string;
  issueType: string;
  propertyId: string;
}

interface InventoryIssuesProps {
  issues: QueueIssue[];
  properties: PropertyNames;
  totalIssues: number;
  totalPages: string | number;
  hasNext: boolean;
  hasPrev: boolean;
  currentPage: number;
  initialFilters: IssueFilters;
}

function formatQty(value: number) {
  return Number(value.toFixed(2)).toLocaleString();
}

export function InventoryIssues({
  issues,
  properties,
  totalIssues,
  hasNext,
  hasPrev,
  totalPages,
  currentPage,
  initialFilters,
}: InventoryIssuesProps) {
  const router = useRouter();

  const [isApplyPending, startApplyTransition] = useTransition();
  const [isClearPending, startClearTransition] = useTransition();
  const isPending = isApplyPending || isClearPending;

  const [filters, setFilters] = useState<IssueFilters>(initialFilters);

  // "open" is the default view, so it doesn't count as an active filter.
  const hasActiveFilters =
    initialFilters.search !== "" ||
    initialFilters.status !== "open" ||
    initialFilters.issueType !== "all" ||
    initialFilters.propertyId !== "all";

  const applyFilters = () => {
    const params = new URLSearchParams();
    params.set("tab", "issues");
    params.set("page", "1");

    if (filters.search) params.set("search", filters.search);
    if (filters.status !== "open") params.set("issueStatus", filters.status);
    if (filters.issueType !== "all") params.set("issueType", filters.issueType);
    if (filters.propertyId !== "all")
      params.set("propertyId", filters.propertyId);

    startApplyTransition(() => {
      router.push(`/inventory?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "open",
      issueType: "all",
      propertyId: "all",
    });

    startClearTransition(() => {
      router.push("/inventory?tab=issues&page=1");
    });
  };

  if (issues.length === 0 && !hasActiveFilters) {
    return (
      <ItemsNotFound
        title="No open issues"
        message="Nothing is currently damaged, missing or worn out. Issues get reported from an item's detail page."
        icon={CheckCircle2}
      />
    );
  }

  return (
    <section>
      {/* Filters */}
      <header className="mb-4 flex flex-col gap-4 py-1 text-sm text-muted-foreground">
        <div className="flex flex-col gap-4 pr-5 md:flex-row md:gap-2">
          <div className="relative flex-1 md:flex-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              placeholder="Search issues by item name . . ."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="w-full pl-10 text-black"
              disabled={isPending}
            />
          </div>

          <Select
            value={filters.status}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, status: value }))
            }
            disabled={isPending}
          >
            <SelectTrigger className="w-full text-black/70 hover:cursor-pointer md:flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.issueType}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, issueType: value }))
            }
            disabled={isPending}
          >
            <SelectTrigger className="w-full text-black/70 hover:cursor-pointer md:flex-1">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {ISSUE_TYPE_OPTIONS.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.propertyId}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, propertyId: value }))
            }
            disabled={isPending}
          >
            <SelectTrigger className="w-full text-black/70 hover:cursor-pointer md:flex-1">
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id.toString()}>
                  {property.name}
                </SelectItem>
              ))}
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
                <Loader className="size-4 animate-spin" />
                Searching
              </span>
            ) : (
              "Apply filters"
            )}
          </Button>
          <Button
            onClick={clearFilters}
            disabled={isPending}
            className="cursor-pointer bg-chart-5 px-12 hover:bg-red-600"
          >
            {isClearPending ? (
              <span className="flex items-center gap-2">
                <Loader className="size-4 animate-spin" />
                Clearing
              </span>
            ) : (
              "Clear filters"
            )}
          </Button>
        </div>
      </header>

      {issues.length === 0 ? (
        <SearchNotFound
          title="No issue matches the search criteria"
          icon={Package}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TriangleAlert className="h-5 w-5" />
              Item Issues
            </CardTitle>
            <CardDescription>
              {totalIssues === 1
                ? `${totalIssues} issue`
                : `${totalIssues} issues`}
              &nbsp;found
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead>Item</TableHead>
                  <TableHead>Found</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {issues.map((issue) => {
                  const uom = issue.inventoryItem.unitOfMeasure;

                  return (
                    <TableRow
                      key={issue.id}
                      className={issue.isStale ? "bg-destructive/5" : undefined}
                    >
                      <TableCell className="font-medium capitalize">
                        {issue.inventoryItem.itemName}
                      </TableCell>

                      {/* Store vs unit is what decided whether stock moved */}
                      <TableCell>
                        <div className="text-sm">
                          {issue.isStoreIssue
                            ? "Store"
                            : issue.assignment?.unit.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {issue.inventoryItem.property.name}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {issue.issueType.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right tabular-nums">
                        {formatQty(issue.quantityAffected)}
                        <span className="ml-1 text-xs text-muted-foreground">
                          {uom}
                        </span>
                      </TableCell>

                      <TableCell className="text-sm">
                        {issue.reportedBy.name}
                      </TableCell>

                      <TableCell>
                        {issue.status === "open" ? (
                          issue.isStale ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant="destructive"
                                  className="cursor-default"
                                >
                                  Overdue
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                Open for {issue.ageDays} days. Stock stays
                                understated until it&apos;s resolved.
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <Badge className="bg-amber-500 text-white hover:bg-amber-600">
                              Open
                            </Badge>
                          )
                        ) : (
                          <div className="space-y-0.5">
                            <Badge variant="secondary">
                              {RESOLUTION_LABELS[issue.resolution] ??
                                issue.resolution}
                            </Badge>
                            {issue.cost > 0 && (
                              <div className="text-xs text-muted-foreground">
                                KES {issue.cost.toLocaleString()}
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        {/* Full issue detail and Resolve live on the item page */}
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/inventory/${issue.inventoryItem.id}`}>
                            View details
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Footer
        currentPage={currentPage}
        hasNext={hasNext}
        hasPrev={hasPrev}
        totalPages={totalPages}
        paramName="page"
        preserveParams={[
          "tab",
          "search",
          "issueStatus",
          "issueType",
          "propertyId",
        ]}
      />
    </section>
  );
}
