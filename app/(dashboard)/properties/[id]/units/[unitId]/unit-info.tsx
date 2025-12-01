import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bath, Users, Bed, Building, House } from "lucide-react";
import type { UnitDetailsResponse } from "@/lib/types/types";

interface UnitInfoProps {
  unit: UnitDetailsResponse;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "available":
      return (
        <Badge className="bg-chart-2 text-white hover:bg-chart-2/90 border-0 text-base px-4 py-1">
          Available
        </Badge>
      );
    case "occupied":
      return (
        <Badge className="bg-destructive text-white hover:bg-destructive/90 border-0 text-base px-4 py-1">
          Occupied
        </Badge>
      );
    case "maintenance":
      return (
        <Badge className="bg-chart-1 text-white hover:bg-chart-1/90 border-0 text-base px-4 py-1">
          Maintenance
        </Badge>
      );
    default:
      return null;
  }
};

export default function UnitInfo({ unit }: UnitInfoProps) {
  return (
    <Card className="border-border py-4 shadow-sm bg-card rounded-xl">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-foreground mb-1">
              {unit.name}
            </h2>
            <div className="flex items-center gap-2 text-base text-muted-foreground">
              <Building className="size-4 " />

              <span>{unit.property.name}</span>
            </div>

            <div className="flex items-center gap-2 text-base text-muted-foreground">
              <House className="size-4 " />

              <span className="capitalize">{unit.type}</span>
            </div>
          </div>
          {getStatusBadge(unit.status)}
        </div>

        <div className="mb-4">
          <p className="text-2xl text-chart-2 font-bold">
            ${unit.rent}
            <span className="text-base font-normal text-muted-foreground">
              &nbsp;/ month
            </span>
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/50 border border-accent-foreground/30">
            <Bath className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {unit.bathrooms} Bathroom
            </span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/50 border border-accent-foreground/30">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              1 - {unit.maxGuests} Guests
            </span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/50 border border-accent-foreground/30">
            <Bed className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {unit.bedrooms} Bedrooms
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
