"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardContent, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Home, Users, Eye, Moon, Calendar, Bed } from "lucide-react";
import Link from "next/link";
import { propertyUnitKeys } from "@/hooks/useProperties";
import { getOccupancyRate, formatPrice, getDurationLabel } from "@/lib/utils";
import { notFound } from "next/navigation";
import type { UniqueProperty, PropertyPricings } from "@/lib/types/types";

function PropertyDetails({
  property,
  pricings,
}: {
  property: UniqueProperty;
  pricings: PropertyPricings;
}) {
  const queryClient = useQueryClient();

  if (!property || property === null) {
    notFound();
  }

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

  // Group pricings by unit type
  const oneBedroomPricings = pricings.filter((p) => p.unitType === "1 bedroom");
  const twoBedroomPricings = pricings.filter((p) => p.unitType === "2 bedroom");

  return (
    <Card
      className="flex-2 gap-2 border-0 bg-card shadow-sm"
      onMouseEnter={prefetchPropertyUnits}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl lg:text-2xl font-bold text-foreground capitalize">
            {property.name}
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
        {/* Description */}
        <div>
          <p className="text-lg font-semibold text-foreground">
            {property.description}
          </p>
        </div>

        {/* Pricing Section */}
        {pricings.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-base font-medium text-foreground">
              Property Pricings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1 Bedroom Pricing */}
              {oneBedroomPricings.length > 0 && (
                <div className="rounded-xl border border-night/60 bg-card p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-azure/10">
                      <Bed className="size-5 text-azure" />
                    </div>
                    <h4 className="font-semibold text-night/90">
                      1 Bedroom Apartment
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {oneBedroomPricings.map((pricing) => (
                      <div
                        key={pricing.id}
                        className="flex items-center justify-between p-3 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          {pricing.duration === "one_night" ? (
                            <Moon className="size-4 text-muted-foreground" />
                          ) : (
                            <Calendar className="size-4 text-muted-foreground" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {getDurationLabel(pricing.duration)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {pricing.nights}{" "}
                              {pricing.nights === 1 ? "night" : "nights"}
                            </p>
                          </div>
                        </div>
                        <p className="text-lg font-bold text-azure">
                          {formatPrice(pricing.price)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2 Bedroom Pricing */}
              {twoBedroomPricings.length > 0 && (
                <div className="rounded-xl border border-night/60 bg-card p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-medium-jungle/10">
                      <Bed className="size-5 text-medium-jungle" />
                    </div>
                    <h4 className="font-semibold text-night/90">
                      2 Bedroom Apartment
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {twoBedroomPricings.map((pricing) => (
                      <div
                        key={pricing.id}
                        className="flex items-center justify-between p-3 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          {pricing.duration === "one_night" ? (
                            <Moon className="size-4 text-muted-foreground" />
                          ) : (
                            <Calendar className="size-4 text-muted-foreground" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {getDurationLabel(pricing.duration)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {pricing.nights}{" "}
                              {pricing.nights === 1 ? "night" : "nights"}
                            </p>
                          </div>
                        </div>
                        <p className="text-lg font-bold text-medium-jungle">
                          {formatPrice(pricing.price)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Property Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-night/60">
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

          <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-night/60">
            <div className="p-2 rounded-lg bg-medium-jungle/10">
              <Users className="h-5 w-5 text-medium-jungle" />
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
