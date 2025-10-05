import { Card, CardHeader, CardContent, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Home, Users, Bed, Bath, Eye } from "lucide-react";
import type { Property } from "@/lib/data/properties";
import Link from "next/link";

function PropertyDetails({ property }: { property: Property }) {
  return (
    <Card className="flex-2 gap-4 border-0 bg-card shadow-sm">
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
            ${property.rent}
            <span className="text-base font-normal text-muted-foreground">
              &nbsp; per month
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
              <p className="font-semibold text-foreground">{property.type}</p>
              <p className="text-sm text-muted-foreground">
                {property.units} units
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/60">
            <div className="p-2 rounded-lg bg-chart-3/10">
              <Users className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {property.maxGuests > 1 ? `1 - ${property.maxGuests}` : "1"}
              </p>
              <p className="text-sm text-muted-foreground">Guests</p>
            </div>
          </div>
        </div>

        {/* Room Details */}
        <div className="flex gap-4">
          <div className="flex bg-muted/60 border border-border p-3 rounded-xl items-center gap-3">
            <Bath className="size-4 text-muted-foreground" />
            <span className="text-foreground text-sm">
              {property.bathrooms} Bathroom
            </span>
          </div>
          <div className="flex bg-muted/60 border border-border p-3 rounded-xl items-center gap-3">
            <Bed className="size-4 text-muted-foreground" />
            <span className="text-foreground text-sm">
              {property.bedrooms} Bedrooms
            </span>
          </div>
        </div>

        {/* Occupancy */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-secondary-foreground">
                Occupancy
              </span>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              0/48 (0%)
            </span>
          </div>
          <Progress value={0} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

export { PropertyDetails };
