"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "./ui/select";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import {
  Bath,
  Users,
  Bed,
  Eye,
  Edit,
  Search,
  House,
  Loader2,
} from "lucide-react";
import { ItemsNotFound } from "./ItemsNotFound";
import { SearchNotFound } from "./SearchNotFound";
import { Footer } from "./Footer";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchUnitDetails } from "@/hooks/useUnitDetails";
import Link from "next/link";
import Image from "next/image";
import type { Unit, UnitStatus } from "@/lib/types/types";
import { usePermissions } from "@/hooks/usePermissions";
import {
  getDurationLabel,
  calculateTotalWithVAT,
  formatPrice,
  cn,
} from "@/lib/utils";

interface UnitFilters {
  search: string;
  status: string;
  type: string;
}

interface UnitListingProps {
  units: Unit[];
  propertyId: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  initialFilters: UnitFilters;
}

const getStatusBadge = (status: UnitStatus) => {
  switch (status) {
    case "available":
      return (
        <Badge className="absolute top-4 left-4 bg-chart-2 text-white hover:bg-chart-2/90 border-0 shadow-md z-10">
          Available
        </Badge>
      );
    case "occupied":
      return (
        <Badge className="absolute top-4 left-4 bg-destructive text-white hover:bg-destructive/90 border-0 shadow-md z-10">
          Occupied
        </Badge>
      );
    case "maintenance":
      return (
        <Badge className="absolute top-4 left-4 bg-chart-1 text-white hover:bg-chart-1/90 border-0 shadow-md z-10">
          Maintenance
        </Badge>
      );
    case "reserved":
      return (
        <Badge className="absolute top-4 left-4 bg-chart-4 text-white hover:bg-chart-4/90 border-0 shadow-md z-10">
          Reserved
        </Badge>
      );
    case "booked":
      return (
        <Badge className="absolute top-4 left-4 bg-chart-3 text-white hover:bg-chart-3/90 border-0 shadow-md z-10">
          Booked
        </Badge>
      );
    default:
      return null;
  }
};

export function UnitListing({
  units,
  propertyId,
  currentPage,
  totalPages,
  hasNext,
  hasPrev,
  initialFilters,
}: UnitListingProps) {
  const { isAgent } = usePermissions();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Separate transitions for apply and clear
  const [isApplyPending, startApplyTransition] = useTransition();
  const [isClearPending, startClearTransition] = useTransition();
  const isPending = isApplyPending || isClearPending;

  // Local state for filter inputs
  const [filters, setFilters] = useState<UnitFilters>(initialFilters);

  // Sync filters with URL on mount/URL changes
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Check if there are any active filters
  const hasActiveFilters =
    initialFilters.search !== "" ||
    initialFilters.status !== "all" ||
    initialFilters.type !== "all";

  /* ------------ URL Update Handlers ------------ */
  const applyFilters = () => {
    const params = new URLSearchParams();
    params.set("page", "1"); // Reset to page 1 when applying filters

    if (filters.search) {
      params.set("search", filters.search);
    }
    if (filters.status !== "all") {
      params.set("status", filters.status);
    }
    if (filters.type !== "all") {
      params.set("type", filters.type);
    }

    startApplyTransition(() => {
      router.push(`/properties/${propertyId}/units?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "all",
      type: "all",
    });

    startClearTransition(() => {
      router.push(`/properties/${propertyId}/units?page=1`);
    });
  };

  const handleUnitHover = (unitId: number, propertyId: number) => {
    prefetchUnitDetails(queryClient, unitId.toString(), propertyId.toString());
  };

  if (units.length === 0) {
    return (
      <section className="text-center">
        <ItemsNotFound
          title="No units found!"
          icon={House}
          message="Get started by adding your first unit."
        />
        {hasActiveFilters && (
          <Button
            onClick={clearFilters}
            disabled={isPending}
            className="cursor-pointer px-8 bg-chart-5 hover:bg-red-600"
          >
            {isClearPending ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Clearing...
              </>
            ) : (
              "Clear filters"
            )}
          </Button>
        )}
      </section>
    );
  }

  const propertyName = units[0].property.name || "this property's";

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-semibold text-base md:text-2xl text-muted-foreground">
          View and manage {propertyName} units
        </h2>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              disabled={isPending}
              className="pl-9"
            />
          </div>

          <div className="flex-2 md:flex md:items-center space-y-4 md:space-y-0 md:space-x-2">
            {/* Unit Type Filter */}
            <Select
              value={filters.type}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, type: value }))
              }
              disabled={isPending}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="1 bedroom">1 Bedroom</SelectItem>
                <SelectItem value="2 bedroom">2 Bedroom</SelectItem>
              </SelectContent>
            </Select>

            {/* Unit Status Filter */}
            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, status: value }))
              }
              disabled={isPending}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={applyFilters}
            disabled={isPending}
            className="cursor-pointer px-8"
          >
            {isApplyPending ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Applying...
              </>
            ) : (
              "Apply filters"
            )}
          </Button>
          <Button
            onClick={clearFilters}
            disabled={isPending}
            className="cursor-pointer px-8 bg-chart-5 hover:bg-red-600"
          >
            {isClearPending ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Clearing...
              </>
            ) : (
              "Clear filters"
            )}
          </Button>
        </div>
      </div>

      {/* Unit Listing Grid */}
      <div
        className={`grid pt-2 gap-4 md:grid-cols-2 lg:grid-cols-3 ${isPending ? "opacity-50 pointer-events-none" : ""}`}
      >
        {units.length === 0 && hasActiveFilters ? (
          <SearchNotFound
            icon={House}
            title="No unit matches your search criteria."
            className="md:col-span-2 lg:col-span-3 pt-3"
          />
        ) : (
          units.map((unit) => (
            <Card
              key={unit.id}
              className="border-0 shadow-sm hover:shadow-md group pt-0 pb-4 bg-card"
              onMouseEnter={() =>
                handleUnitHover(unit.id, Number(unit.propertyId))
              }
            >
              <Carousel
                opts={{ loop: true }}
                className="rounded-t-md w-full relative overflow-hidden group"
              >
                <CarouselContent>
                  {unit.media.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="w-full h-56 relative">
                        <Image
                          src={image.filePath}
                          alt={`Unit ${unit.name} image ${index + 1}`}
                          fill
                          priority
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover"
                        />
                        {getStatusBadge(unit.status)}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                <CarouselPrevious className="left-4 opacity-0 group-hover:opacity-100 cursor-pointer bg-background/80" />
                <CarouselNext className="right-4 opacity-0 group-hover:opacity-100 cursor-pointer bg-background/80" />
              </Carousel>

              <CardContent>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-lg text-foreground">
                      {unit.name}
                    </h4>
                    <div>
                      {unit.pricingOptions.map((opt) => (
                        <div
                          key={opt.id}
                          className="text-muted-foreground text-sm"
                        >
                          <span>{getDurationLabel(opt.duration)} </span>-
                          <span>
                            {" "}
                            {formatPrice(calculateTotalWithVAT(opt.price))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-black capitalize">
                    {unit.type}
                  </p>
                </div>

                <div className="flex flex-wrap items-center my-3 gap-2">
                  <div className="shrink-0 flex items-center gap-2 px-3 border border-accent-foreground/30 py-2 rounded-lg bg-muted/50">
                    <Bath className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {unit.bathrooms}
                    </span>
                  </div>
                  <div className="shrink-0 flex items-center gap-2 px-3 py-2 border border-accent-foreground/30 rounded-lg bg-muted/50">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {unit.maxGuests === 1 ? "1" : `1 - ${unit.maxGuests}`}
                    </span>
                  </div>
                  <div className="shrink-0 flex items-center gap-2 px-3 py-2 border border-accent-foreground/30 rounded-lg bg-muted/50">
                    <Bed className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {unit.bedrooms}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 mt-1">
                  <Button
                    variant="default"
                    className="flex-1 gap-2 bg-chart-1 hover:bg-chart-1/90"
                    size="sm"
                    asChild
                  >
                    <Link
                      href={`/properties/${unit.propertyId}/units/${unit.id}`}
                      className="flex items-center gap-2"
                    >
                      <Eye className="size-4" />
                      <span>View</span>
                    </Link>
                  </Button>
                  <Button
                    variant="default"
                    className={cn(
                      "flex-1 gap-2 bg-chart-3 hover:bg-chart-3/90",
                      isAgent && "hidden",
                    )}
                    size="sm"
                    asChild
                  >
                    <Link
                      href={`/properties/${unit.propertyId}/units/${unit.id}/edit`}
                      className="flex items-center gap-2"
                    >
                      <Edit className="size-4" />
                      <span>Edit</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Footer Pagination */}
      <Footer
        currentPage={currentPage}
        totalPages={totalPages}
        hasNext={hasNext}
        hasPrev={hasPrev}
        paramName="page"
        preserveParams={["search", "status", "type", "sortOrder"]}
      />
    </section>
  );
}
