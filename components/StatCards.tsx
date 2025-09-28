import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatCardsProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export function StatCards({ stats }: { stats: StatCardsProps[] }) {
  const statsLength = stats.length;

  return (
    <div
      className={cn(
        "grid gap-2 md:grid-cols-2 lg:grid-cols-4",
        statsLength === 4 && "lg:grid-cols-4",
        statsLength === 5 && "lg:grid-cols-5",
        statsLength === 6 && "lg:grid-cols-3"
      )}
    >
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <Card
            key={stat.title}
            className="relative overflow-hidden border border-border shadow-sm bg-card"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div
                className={`p-3 rounded-lg ${
                  stat.color === "blue"
                    ? "bg-chart-1/10"
                    : stat.color === "green"
                      ? "bg-chart-2/10"
                      : stat.color === "orange"
                        ? "bg-chart-3/10"
                        : stat.color === "red"
                          ? "bg-chart-5/10"
                          : "bg-chart-4/10"
                }`}
              >
                <Icon
                  className={`size-5 ${
                    stat.color === "blue"
                      ? "text-chart-1"
                      : stat.color === "green"
                        ? "text-chart-2"
                        : stat.color === "orange"
                          ? "text-chart-3"
                          : stat.color === "red"
                            ? "text-chart-5"
                            : "text-chart-4"
                  }`}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div
                className={`text-3xl font-bold ${
                  stat.color === "blue"
                    ? "text-chart-1"
                    : stat.color === "green"
                      ? "text-chart-2"
                      : stat.color === "orange"
                        ? "text-chart-3"
                        : stat.color === "red"
                          ? "text-chart-5"
                          : "text-chart-4"
                }`}
              >
                {stat.value}
              </div>
              {stat?.subtitle && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-sm font-normal text-muted-foreground">
                    {stat?.subtitle}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
