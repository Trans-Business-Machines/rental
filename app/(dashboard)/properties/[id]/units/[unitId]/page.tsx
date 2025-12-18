"use client";

import { useUnitDetails } from "@/hooks/useUnitDetails";
import { notFound, useParams } from "next/navigation";
import { Loader2, ArrowLeft, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import UnitGallery from "./unit-gallery";
import UnitInfo from "./unit-info";
import UnitInventory from "./unit-inventory";
import UnitBookings from "./unit-bookings";

function UnitDetailsPage() {
  const params = useParams();
  const propertyId = params.id as string;
  const unitId = params.unitId as string;

  /**
   * This hook checks React Query's cache first
   * If data was prefetched, it uses that immediately (no loading state)
   * If not prefetched, it fetches from the API
   */
  const { data: unit, isLoading } = useUnitDetails({
    unitId,
    propertyId,
  });

  if (isLoading) {
    return (
      <section className="px-6 space-y-2 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="size-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-lg font-medium text-gray-700">
            Loading unit details...
          </p>
        </div>
      </section>
    );
  }

  if (!unit) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link
              href={`/properties/${propertyId}/units`}
              className="flex items-center"
            >
              <ArrowLeft className="size-4 text-muted-foreground" />
              <span className="text-base font-semibold"> Back to units</span>
            </Link>
          </Button>
        </div>

        <Button className="gap-2 bg-chart-1 hover:bg-chart-1/90" asChild>
          <Link
            href={`/properties/${propertyId}/units/${unitId}/edit`}
            className="flex items-center"
          >
            <Edit className="size-4" />
            <span>Edit Unit</span>
          </Link>
        </Button>
      </header>

      <UnitGallery images={unit.media} />

      <UnitInfo unit={unit} />

      <div className="grid gap-6 lg:grid-cols-2">
        <UnitInventory
          assignments={unit.assignments}
          context={{ unitId: unit.id, propertyId: unit.propertyId }}
        />
        <UnitBookings
          bookings={unit.bookings}
          context={{
            propertyId: unit.propertyId,
            unitId: unit.id,
            unitStatus: unit.status,
          }}
        />
      </div>
    </section>
  );
}

export default UnitDetailsPage;
