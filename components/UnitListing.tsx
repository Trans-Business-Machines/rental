"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import type { Unit } from "@/lib/data/properties";
import { Bath, Users, Bed, Eye, Edit } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface UnitListingProps {
  units: Unit[];
}

const getStatusBadge = (status: string) => {
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
    default:
      return null;
  }
};

export function UnitListing({ units }: UnitListingProps) {
  if (units.length === 0 || !units) {
    return (
      <div>
        <h3 className="text-2xl font-bold text-foreground"> No units found</h3>
        <p className="text-sm text-muted-foreground">
          You can start by adding units
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {units.map((unit) => (
        <Card
          key={unit.id}
          className="border-0 shadow-sm hover:shadow-md group pt-0 bg-card"
        >
          <Carousel
            opts={{ loop: true }}
            className="rounded-t-md w-full relative overflow-hidden group"
          >
            <CarouselContent>
              {unit.images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="w-full h-56 relative">
                    <Image
                      src={image}
                      alt={`Unit ${unit.id} image ${index + 1}`}
                      fill
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
                <h4 className="font-semibold text-lg lg:text-xl text-foreground">
                  {unit.name}
                </h4>
                <p className="text-sm text-muted-foreground">{unit.type}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg lg:text-xl text-foreground">
                  ${unit.rent}
                </p>
                <p className="text-xs text-muted-foreground">/ month</p>
              </div>
            </div>

            <div className="flex items-center my-3 gap-2">
              <div className="flex items-center gap-2 px-3 border border-accent-foreground/30 py-2 rounded-lg bg-muted/50">
                <Bath className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {unit.bathrooms}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 border border-accent-foreground/30  rounded-lg bg-muted/50">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {unit.maxGuests === 1 ? "1" : `1 - ${unit.maxGuests}`}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 border border-accent-foreground/30 rounded-lg bg-muted/50">
                <Bed className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {unit.bedrooms}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
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
                <Link href={`/properties/${unit.propertyId}/units/1/edit`}>
                  <Edit className="size-4" />
                  Edit
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
