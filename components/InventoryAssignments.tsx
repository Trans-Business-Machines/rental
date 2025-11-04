"use client";

import { useState } from "react";
import { InventoryAssignmentsList } from "@/components/InventoryAssignmentsList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFilter } from "@/hooks/useFilter";
import { Input } from "@/components/ui/input";
import { Search, CircleX } from "lucide-react";
import type { Assignment, PropertyWithUnits } from "@/lib/types/types";
import { ItemsNotFound } from "./ItemsNotFound";

interface InventoryAssignmentsProps {
  assignments: Assignment[];
  properties: PropertyWithUnits[];
}

function InventoryAssignments({
  assignments,
  properties,
}: InventoryAssignmentsProps) {
  // Define state to hold the search term
  const [searchTerm, setSearchTerm] = useState("");

  // Define state to hold the select filters
  const [selectFilters, setSelectFilters] = useState({
    property: "all",
    status: "all",
  });

  const filteredAssignments = useFilter({
    items: assignments,
    searchTerm,
    searchFields: ["inventoryItem.itemName"],
    selectFilters: {
      "property.name": selectFilters.property,
      isActive: selectFilters.status,
    },
  });

  if (!assignments || assignments.length === 0) {
    return (
      <ItemsNotFound
        title="No item assignments found!"
        message="Get started by making your first assignment."
        icon={CircleX}
      />
    );
  }

  return (
    <div>
      {/* Assignment Filters */}
      <div className="flex flex-col sm:flex-row gap-4 flex-1 mt-2 mb-4">
        {/* ItemName filter */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search assignments by item name . . ."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Property Filter */}
        <div className="min-w-[350px">
          <Select
            defaultValue="all"
            value={selectFilters.property}
            onValueChange={(value) =>
              setSelectFilters((prev) => ({ ...prev, property: value }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.name}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="min-w-[250px]">
          <Select
            value={selectFilters.status}
            onValueChange={(value) =>
              setSelectFilters((prev) => ({ ...prev, status: value }))
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
      </div>

      {/* Assignments List */}
      <InventoryAssignmentsList assignments={filteredAssignments} />
    </div>
  );
}

export { InventoryAssignments };
