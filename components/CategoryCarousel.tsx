"use client";

import { useRef } from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CategoryItemStats } from "@/lib/types/types";
import { cn } from "@/lib/utils";

type AvailabilityStatus = "critical" | "low" | "healthy";

function getAvailabilityStatus(
  available: number,
  total: number,
): AvailabilityStatus {
  if (available === 0) {
    return "critical";
  }

  if (available < total / 4) {
    return "low";
  }

  return "healthy";
}

const statusStyles: Record<
  AvailabilityStatus,
  { background: string; text: string; progress: string }
> = {
  critical: {
    background: "bg-lipstick-red/10",
    text: "text-lipstick-red",
    progress: "bg-lipstick-red",
  },
  low: {
    background: "bg-princeton-orange/10",
    text: "text-princeton-orange",
    progress: "bg-princeton-orange",
  },
  healthy: {
    background: "bg-medium-jungle/10",
    text: "text-medium-jungle",
    progress: "bg-medium-jungle",
  },
};

export function CategoryCarousel({ stats }: { stats: CategoryItemStats }) {
  const autoplayPlugin = useRef(
    Autoplay({
      delay: 4000,
    }),
  );

  if (stats.length === 0) {
    return null;
  }

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      plugins={[autoplayPlugin.current]}
      className="w-12/12"
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {stats.map((stat) => {
          const status = getAvailabilityStatus(stat.available, stat.totalItems);
          const styles = statusStyles[status];

          return (
            <CarouselItem
              key={stat.category}
              className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold truncate">
                    {stat.category}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {stat.totalItems} {stat.totalItems === 1 ? "item" : "items"}{" "}
                    in this category
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Total */}
                    <article className="flex flex-col items-center p-2 rounded-lg bg-blue-50">
                      <span className="text-xl font-bold text-blue-600">
                        {stat.totalItems}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Total
                      </span>
                    </article>

                    {/* Available - Color coded */}
                    <article
                      className={cn(
                        "flex flex-col items-center p-2 rounded-lg",
                        styles.background,
                      )}
                    >
                      <span className={cn("text-xl font-bold", styles.text)}>
                        {stat.available}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Available
                      </span>
                    </article>

                    {/* Assigned */}
                    <article className="flex flex-col items-center p-2 rounded-lg bg-orange-50">
                      <span className="text-xl font-bold text-orange-600">
                        {stat.assigned}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Assigned
                      </span>
                    </article>
                  </div>

                  {/* Progress Bar - Color coded */}
                  <article className="mt-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Utilization</span>
                      <span>
                        {stat.totalItems > 0
                          ? Math.round((stat.assigned / stat.totalItems) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          styles.progress,
                        )}
                        style={{
                          width: `${stat.totalItems > 0 ? (stat.assigned / stat.totalItems) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </article>
                </CardContent>
              </Card>
            </CarouselItem>
          );
        })}
      </CarouselContent>

      <CarouselPrevious className="-left-4 md:-left-5" />
      <CarouselNext className="-right-4 md:-right-5" />
    </Carousel>
  );
}
