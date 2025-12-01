import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface Amenity {
  icon: React.ComponentType<{ className: string }>;
  label: string;
}

export function PropertyAmenities({ amenities }: { amenities: Amenity[] }) {
  return (
    <Card className="flex-1 border-0 shadow-sm bg-card">
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
            const Icon = amenity.icon;
            return (
              <div
                key={amenity.label}
                className="flex items-center gap-3 p-3 rounded-lg transition-colors 
                     bg-chart-2/5 hover:bg-chart-2/10"
              >
                <div className="p-2 rounded-lg bg-chart-2/10 text-chart-2">
                  <Icon className="size-4" />
                </div>
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
