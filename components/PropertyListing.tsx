"use client";

import { useState } from "react";
import { useFilter } from "@/hooks/useFilter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PropertyCardActions } from "@/components/PropertyCardActions";
import { Input } from "@/components/ui/input";
import { Building2, Home, MapPin, Users, Banknote, Search } from "lucide-react";
import Pagination from "./Pagination";
import { ItemsNotFound } from "./ItemsNotFound";
import { SearchNotFound } from "./SearchNotFound";
import type { Property } from "@/lib/types/types";
import { useRouter, useSearchParams } from "next/navigation";

interface PropertyListingProps {
  properties: Property[];
  totalPages: string | number;
  hasNext: boolean;
  hasPrev: boolean;
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

const getOccupancyRate = (occupied: number, total: number | null) => {
  if (!total || total === 0) return 0;
  return Math.round((occupied / total) * 100);
};

function PropertyListing({
  properties,
  hasNext,
  hasPrev,
  totalPages,
}: PropertyListingProps) {
  // Define state to track the search term
  const [searchTerm, setSearchTerm] = useState("");

  // Get search params and router objects
  const searchParams = useSearchParams();
  const router = useRouter();

  const filteredProperties = useFilter<Property>({
    items: properties,
    searchTerm,
    searchFields: ["name", "address", "description"],
  });

  if (!properties || properties.length == 0) {
    return (
      <ItemsNotFound
        title="No properties found!"
        icon={Building2}
        message="Get started by adding your first property."
      />
    );
  }

  // Get the current page from search params
  const currentPage = Number(searchParams.get("page")) || 1;

  // function handle page change
  const handlePageChange = (page: number) => {
    // create a new params object using the exisitng searchParams
    // this helps to reserve other existing params
    const params = new URLSearchParams(searchParams);

    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <>
      <div className="relative flex-1 w-10/12 md:max-w-md lg:max-w-lg">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          key="property-search-input"
          placeholder="Search properties by name, address, or description . . ."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.length === 0 ? (
          <SearchNotFound
            title="No property matches the search criteria."
            icon={Building2}
            className="md:col-span-2 lg:col-span-3"
          />
        ) : (
          filteredProperties.map((property) => (
            <Card
              key={property.id}
              className="hover:shadow-lg transition-shadow p-0 pb-4"
            >
              <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                <img
                  src={property.image}
                  alt={property.name}
                  className="object-cover w-full h-full"
                />
              </div>
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
                  <div className="flex items-center">
                    <Banknote className="size-5 mr-2 text-muted-foreground" />
                    <span>${property.rent}/month</span>
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
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${getOccupancyRate(
                          property.occupied,
                          property.totalUnits
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <PropertyCardActions property={property} />
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <footer className="my-2">
        <Pagination
          currentPage={currentPage}
          handlePageChange={handlePageChange}
          hasNext={hasNext}
          hasPrev={hasPrev}
          totalPages={totalPages}
        />
      </footer>
    </>
  );
}

export { PropertyListing };
