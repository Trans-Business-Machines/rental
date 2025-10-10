"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { UnitListing } from "@/components/UnitListing";
import { mockUnits } from "@/lib/data/properties";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function UnitsPage() {
  const params = useParams<{ id: string }>();

  // TODO: use this params.id (propertyId) to get property units info from db
  console.log(`Unit id: ${params.id}`);

  // State to manage sorting and filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [sortby, setSortBy] = useState("any-price");
  const [typeFilter, setTypeFilter] = useState("all-types");

  return (
    <section className="px-6 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/properties/${params.id}`}>
              <ArrowLeft className="size-4" />
            </Link>
          </Button>

          <h2 className="text-2xl font-bold text-foreground">
            Luxcity apartment units
          </h2>
        </div>
        <Button className="space-x-2 text-white">
          <Plus className="size-4" />
          <span>Add unit</span>
        </Button>
      </header>

      {/* Units Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2  size-4  text-muted-foreground" />
          <Input
            placeholder="seach by name or type ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={sortby} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any-price">Any price</SelectItem>
            <SelectItem value="price-low">Price: Low to high</SelectItem>
            <SelectItem value="price-high">Price: Hight to low</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="all types">All types</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-types">All types</SelectItem>
            <SelectItem value="villa">Villa</SelectItem>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="studio">Studio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Place Unit grid here */}
      <UnitListing units={mockUnits} />

      {/* Pagination */}
      <footer className="flex items-center justify-between pt-4">
        <p className="text-sm text-muted-foreground">Page 1 of 1</p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="default"
            className="gap-2 bg-chart-1 text-white hover:bg-chart-1/90"
          >
            <ChevronLeft className="size-4" />
            <span>Previous</span>
          </Button>
          <Button
            variant="outline"
            size="default"
            className="gap-2 bg-chart-1 text-white hover:bg-chart-1/90"
          >
            <ChevronRight className="size-4" />
            <span>Next</span>
          </Button>
        </div>
      </footer>
    </section>
  );
}
