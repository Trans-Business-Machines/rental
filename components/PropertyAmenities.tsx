"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { propertyUnitKeys } from "@/hooks/useProperties";

interface Amenity {
  label: string;
}

export function PropertyAmenities({
  amenities,
  propertyId,
}: {
  amenities: Amenity[];
  propertyId: number;
}) {
  const queryClient = useQueryClient();

  const prefetchPropertyUnits = async () => {
    await queryClient.prefetchQuery({
      queryKey: propertyUnitKeys.propertyUnitList(propertyId, 1),
      queryFn: async () => {
        const response = await fetch(
          `/api/properties/${propertyId}/units?page=${1}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch units: ${response.status}`);
        }

        const data = await response.json();
        return data;
      },
    });
  };

  return (
    <Card
      className="flex-1 border-0 shadow-sm bg-card"
      onMouseEnter={prefetchPropertyUnits}
    >
      <CardHeader>
        <CardTitle className="text-xl lg:text-2xl font-bold text-foreground">
          Amenities
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Available facilities and services
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {amenities.map((amenity) => {
            return (
              <div
                key={amenity.label}
                className="flex items-center gap-3 p-3 rounded-lg transition-colors 
                     bg-chart-2/20 hover:bg-chart-2/40"
              >
                <span className="font-medium text-foreground">
                  {amenity.label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
