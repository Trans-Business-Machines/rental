"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardContent, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Home, Users, Eye } from "lucide-react";
import Link from "next/link";
import { propertyUnitKeys } from "@/hooks/useProperties";
import { getOccupancyRate } from "@/lib/utils";
import type { UniqueProperty } from "@/lib/types/types";

function PropertyDetails({ property }: { property: UniqueProperty }) {
  const queryClient = useQueryClient();

  const prefetchPropertyUnits = async () => {
    await queryClient.prefetchQuery({
      queryKey: propertyUnitKeys.propertyUnitList(property.id, { page: 1 }),
      queryFn: async () => {
        const response = await fetch(
          `/api/properties/${property.id}/units?page=${1}`,
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch units: ${response.status}`);
        }

        const data = await response.json();
        return data;
      },
    });
  };

  const maxGuests = property?.maxBedrooms ? property.maxBedrooms * 2 : 1;

  return (
    <Card
      className="flex-2 gap-4 border-0 bg-card shadow-sm"
      onMouseEnter={prefetchPropertyUnits}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl lg:text-2xl font-bold text-foreground">
            Property Details
          </CardTitle>
          <Button variant="outline" className="gap-2 bg-transparent" asChild>
            <Link href={`/properties/${property.id}/units`}>
              <Eye className="size-4" />
              View units
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 m-0">
        {/* Description and pricing */}
        <div>
          <p className="text-foreground font-medium">{property.description}</p>
          <p className="text-2xl font-bold text-chart-2">
            Ksh. {property.rent}
            <span className="text-base font-normal text-muted-foreground">
              &nbsp; / month
            </span>
          </p>
        </div>

        {/* Property Stats */}
        <div className="grid  grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/60">
            <div className="p-2 rounded-lg bg-chart-1/10">
              <Home className="h-5 w-5 text-chart-1" />
            </div>
            <div>
              <p className="font-semibold text-foreground capitalize">
                {property.type}
              </p>
              <p className="text-sm text-muted-foreground">
                {property._count.units || 0} units
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/60">
            <div className="p-2 rounded-lg bg-chart-3/10">
              <Users className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {maxGuests > 1 ? `1 - ${maxGuests}` : "1"}
              </p>
              <p className="text-sm text-muted-foreground">Guests</p>
            </div>
          </div>
        </div>

        {/* Occupancy */}
        <div className="space-y-3 mt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-secondary-foreground">
                Occupancy
              </span>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {property.occupied}/{property.totalUnits || 0} (
              {getOccupancyRate(property.occupied, property.totalUnits)}
              %)
            </span>
          </div>
          <Progress
            value={getOccupancyRate(property.occupied, property.totalUnits)}
            className="h-2"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export { PropertyDetails };
