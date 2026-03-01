"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PropertyCardActions } from "@/components/PropertyCardActions";
import { Input } from "@/components/ui/input";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { Building2, Home, MapPin, Users, Search, Loader2 } from "lucide-react";
import { Footer } from "./Footer";
import { ItemsNotFound } from "./ItemsNotFound";
import { SearchNotFound } from "./SearchNotFound";
import Image from "next/image";
import { getOccupancyRate } from "@/lib/utils";
import { Progress } from "./ui/progress";
import type { Property } from "@/lib/types/types";

interface PropertyFilters {
  search: string;
}

interface PropertyListingProps {
  properties: Property[];
  totalPages: string | number;
  hasNext: boolean;
  hasPrev: boolean;
  currentPage: number;
  initialFilters: PropertyFilters;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "default";
    case "maintenance":
      return "destructive";
    case "vacant":
      return "secondary";
    default:
      return "default";
  }
};

function PropertyListing({
  properties,
  hasNext,
  hasPrev,
  totalPages,
  currentPage,
  initialFilters,
}: PropertyListingProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state for search input
  const [searchValue, setSearchValue] = useState(initialFilters.search);
  const [isSearching, setIsSearching] = useState(false);

  // Sync search value with URL on mount/URL changes
  useEffect(() => {
    setSearchValue(initialFilters.search);
  }, [initialFilters.search]);

  // Check if there are any active filters
  const hasActiveFilters = initialFilters.search !== "";

  // Debounced search - updates URL after 600ms
  const debouncedSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams();
    params.set("page", "1"); // Reset to page 1 on search

    if (value) {
      params.set("search", value);
    }

    // Preserve status filter
    const status = searchParams.get("status");
    if (status && status !== "all") {
      params.set("status", status);
    }

    router.push(`/properties?${params.toString()}`);
    setIsSearching(false);
  }, 600);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setIsSearching(true);
    debouncedSearch(value);
  };

  if (properties.length === 0 && !hasActiveFilters) {
    return (
      <ItemsNotFound
        title="No properties found!"
        icon={Building2}
        message="Get started by adding your first property."
      />
    );
  }

  return (
    <>
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search properties by name, address, or description..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Properties Grid */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${isSearching ? "opacity-50" : ""}`}
      >
        {properties.length === 0 && hasActiveFilters ? (
          <SearchNotFound
            title="No property matches the search criteria."
            icon={Building2}
            className="md:col-span-2 lg:col-span-3"
          />
        ) : (
          properties.map((property) => (
            <Card
              key={property.id}
              className="hover:shadow-lg transition-shadow p-0 pb-4 gap-2"
            >
              {property.media.length === 0 ? (
                <div className="relative h-60 w-full overflow-hidden rounded-t-lg">
                  <img
                    src={property.image}
                    alt={property.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <Carousel
                  opts={{ loop: true }}
                  className="rounded-t-md w-full relative overflow-hidden group"
                >
                  <CarouselContent>
                    {property.media.map((image) => (
                      <CarouselItem key={image.id}>
                        <div className="w-full h-60 relative">
                          <Image
                            src={image.filePath}
                            alt={`${property.name} image ${image.originalName}`}
                            fill
                            priority
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>

                  <CarouselPrevious className="left-4 opacity-0 group-hover:opacity-100 cursor-pointer bg-background/80" />
                  <CarouselNext className="right-4 opacity-0 group-hover:opacity-100 cursor-pointer bg-background/80" />
                </Carousel>
              )}

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{property.name}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.address}
                    </div>
                  </div>
                  <Badge variant={getStatusColor(property.status)}>
                    {property.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {property.description}
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Home className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="capitalize">{property.type}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      Occupancy
                    </span>
                    <span>
                      {property.occupied}/{property.totalUnits || 0} (
                      {getOccupancyRate(property.occupied, property.totalUnits)}
                      %)
                    </span>
                  </div>

                  <Progress
                    value={getOccupancyRate(
                      property.occupied,
                      property.totalUnits,
                    )}
                    className="h-2"
                  />
                </div>

                <PropertyCardActions property={property} />
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Footer
        currentPage={currentPage}
        totalPages={totalPages}
        hasNext={hasNext}
        hasPrev={hasPrev}
        paramName="page"
        preserveParams={["search", "status"]}
      />
    </>
  );
}

export { PropertyListing };
