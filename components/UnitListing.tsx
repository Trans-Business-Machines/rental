"use client";

import { useState } from "react";
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
import { Bath, Users, Bed, Eye, Edit, Search, House } from "lucide-react";
import { useFilter } from "@/hooks/useFilter";
import { useSort } from "@/hooks/useSort";
import { ItemsNotFound } from "./ItemsNotFound";
import { SearchNotFound } from "./SearchNotFound";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchUnitDetails } from "@/hooks/useUnitDetails";
import Link from "next/link";
import Image from "next/image";
import type { sortTypes, Unit, UnitStatus } from "@/lib/types/types";

interface UnitListingProps {
  units: Unit[];
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

export function UnitListing({ units }: UnitListingProps) {
  // State to manage sorting and filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [selectFilters, setselectFilters] = useState({
    type: "all",
    status: "all",
  });

  const [sortOrder, setSortOrder] = useState<sortTypes>("none");

  const queryClient = useQueryClient();

  const filteredUnits = useFilter({
    items: units,
    searchTerm,
    searchFields: ["name"],
    selectFilters,
  });

  const sortedUnits = useSort({
    sortItems: filteredUnits,
    sortOrder,
    sortKey: "rent",
  });

  const handleUnitHover = (unitId: number, propertyId: number) => {
    prefetchUnitDetails(queryClient, unitId.toString(), propertyId.toString());
  };

  if (units.length === 0 || !units) {
    return (
      <ItemsNotFound
        title="No units found!"
        icon={House}
        message="Get started by adding your first unit."
      />
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-semibold text-base md:text-2xl text-muted-foreground">
          View and manage {units[0].property.name} units
        </h2>
      </div>

      {/* Units Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Bar  */}
        <div className="relative flex-1 w-full lg:max-w-md">
          <Search className="absolute left-3 top-2  size-4  text-muted-foreground" />
          <Input
            placeholder="seach by name or type ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Price filter */}
        <Select
          value={sortOrder}
          onValueChange={(value: sortTypes) => {
            setSortOrder(value);
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Any price</SelectItem>
            <SelectItem value="asc">Price: Low to high</SelectItem>
            <SelectItem value="desc">Price: Hight to low</SelectItem>
          </SelectContent>
        </Select>

        {/*  Unit type filter */}
        <Select
          value={selectFilters.type}
          onValueChange={(value: string) => {
            setselectFilters((prev) => ({ ...prev, type: value }));
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="studio">Studio</SelectItem>
          </SelectContent>
        </Select>

        {/* Unit status filter */}
        <Select
          value={selectFilters.status}
          onValueChange={(value: string) => {
            setselectFilters((prev) => ({ ...prev, status: value }));
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="occupied">Occupied</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Unit listing grid */}
      <div className="grid pt-2 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedUnits.length === 0 ? (
          <SearchNotFound
            icon={House}
            title="No unit matches your search criteria."
            className="md:col-span-2 lg:col-span-3 pt-3"
          />
        ) : (
          sortedUnits.map((unit) => (
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
                          alt={`Unit ${unit.name}  image ${index} + 1`}
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover"
                        />
                        {getStatusBadge(unit.status)}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 " />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                <CarouselPrevious className="left-4 opacity-0 group-hover:opacity-100 cursor-pointer bg-background/80" />
                <CarouselNext className="right-4 opacity-0 group-hover:opacity-100 cursor-pointer  bg-background/80" />
              </Carousel>

              <CardContent>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-lg text-foreground">
                      {unit.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">{unit.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg  text-foreground">
                      ${unit.rent}
                    </p>
                    <p className="text-xs text-muted-foreground">per month</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center my-3 gap-2">
                  <div className="shrink-0 flex items-center gap-2 px-3  border border-accent-foreground/30 py-2 rounded-lg bg-muted/50">
                    <Bath className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {unit.bathrooms}
                    </span>
                  </div>
                  <div className="shrink-0 flex items-center gap-2 px-3 py-2 border border-accent-foreground/30  rounded-lg bg-muted/50">
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
                    className="flex-1 gap-2 bg-chart-3 hover:bg-chart-3/90"
                    size="sm"
                    asChild
                  >
                    <Link
                      href={`/properties/${unit.propertyId}/units/${unit.id}/edit`}
                      className="flex items-center gap-2"
                    >
                      <Edit className="size-4" />
                      <span> Edit</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}
