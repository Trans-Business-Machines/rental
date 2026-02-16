"use client";

import { useState, useTransition } from "react";
import { InventoryAssignmentsList } from "@/components/InventoryAssignmentsList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, CircleX, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ItemsNotFound } from "./ItemsNotFound";
import { Footer } from "@/components/Footer";
import { useRouter } from "next/navigation";
import type { Assignment, PropertyNames } from "@/lib/types/types";

interface InventoryAssignmentsFilters {
  search: string;
  propertyId: string;
  unitId: string;
  status: string;
}

interface InventoryAssignmentsProps {
  assignments: Assignment[];
  properties: PropertyNames;
  totalPages: string | number;
  hasNext: boolean;
  hasPrev: boolean;
  totalAssignments: number;
  currentPage: number;
  initialFilters: InventoryAssignmentsFilters;
}

function InventoryAssignments({
  assignments,
  properties,
  hasNext,
  hasPrev,
  totalPages,
  totalAssignments,
  currentPage,
  initialFilters,
}: InventoryAssignmentsProps) {
  // Get the router object
  const router = useRouter();

  const [isApplyPending, startApplyTransition] = useTransition();
  const [isClearPending, startClearTransition] = useTransition();

  // Combined pending state for disabling inputs
  const isPending = isApplyPending || isClearPending;

  // Local state for filter inputs (before Apply is clicked)
  const [filters, setFilters] =
    useState<InventoryAssignmentsFilters>(initialFilters);

  // Check if there are any active filters in the URL
  const hasActiveFilters =
    initialFilters.search !== "" ||
    initialFilters.status !== "all" ||
    initialFilters.propertyId !== "all" ||
    initialFilters.unitId !== "";

  const propertyUnits = properties.find(
    (p) => p.id.toString() === filters.propertyId,
  )?.units;

  // ----------- URL handlers -----------
  const applyFilters = () => {
    const params = new URLSearchParams();
    params.set("tab", "assignments");
    params.set("page", "1");

    if (filters.search) {
      params.set("search", filters.search);
    }
    if (filters.status !== "all") {
      params.set("status", filters.status);
    }
    if (filters.propertyId !== "all") {
      params.set("propertyId", filters.propertyId);
    }

    if (filters.unitId !== "") {
      params.set("unitId", filters.unitId);
    }

    startApplyTransition(() => {
      router.push(`/inventory?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "all",
      propertyId: "all",
      unitId: "",
    });

    startClearTransition(() => {
      router.push("/inventory?tab=assignments&page=1");
    });
  };

  if (assignments.length === 0 && !hasActiveFilters) {
    return (
      <ItemsNotFound
        title="No item assignments found!"
        message="Get started by making your first assignment."
        icon={CircleX}
      />
    );
  }

  return (
    <section>
      {/* Assignment Filters */}
      <header className="flex flex-col  gap-4 flex-1 mt-2 mb-4">
        <article className="flex flex-col md:flex-row gap-4 md:gap-2 lg:pr-8">
          {/* ItemName filter */}
          <div className="relative md:flex-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search assignments by item name . . ."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="md:flex-1">
            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Returned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Property Filter */}
          <div className="md:flex-1">
            <Select
              defaultValue="all"
              value={filters.propertyId}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, propertyId: value }))
              }
            >
              <SelectTrigger className="w-full">
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

          {/* Unit Filter */}
          <div className="md:flex-1">
            <Select
              disabled={filters.propertyId === "all"}
              value={filters.unitId}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, unitId: value }))
              }
            >
              <SelectTrigger className="w-full text-black">
                <SelectValue placeholder="All Units" />
              </SelectTrigger>
              <SelectContent>
                {propertyUnits?.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id.toString()}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </article>

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

      {/* Assignments List */}
      <InventoryAssignmentsList
        assignments={assignments}
        totalAssignments={totalAssignments}
      />

      {/*Footer and  Pagination */}
      <Footer
        currentPage={currentPage}
        hasNext={hasNext}
        hasPrev={hasPrev}
        totalPages={totalPages}
        paramName="page"
        preserveParams={["tab", "search", "status", "propertyId", "unitId"]}
      />
    </section>
  );
}

export { InventoryAssignments };
