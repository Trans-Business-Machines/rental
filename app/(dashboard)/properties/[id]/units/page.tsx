"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
import { UnitListing } from "@/components/UnitListing";
import { useSearchParams, useParams } from "next/navigation";
import { usePropertyUnits } from "@/hooks/useProperties";
import Link from "next/link";
import { usePermissions } from "@/hooks/usePermissions";

export default function UnitsPage() {
  const { isMarketer } = usePermissions();
  const searchParams = useSearchParams();
  const params = useParams();

  // Get URL params
  const currentPage = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "all";
  const type = searchParams.get("type") || "all";

  // Get the property id from params
  const propertyId = params.id;
  const parsedPropertyId = Number(propertyId);

  // Fetch property units from DB with filters
  const { data, isError, isLoading, refetch } = usePropertyUnits({
    propertyId: parsedPropertyId,
    page: currentPage,
    search,
    status,
    type,
  });

  if (!propertyId || isNaN(parsedPropertyId)) {
    return (
      <div className="text-center p-6 bg-red-50 border border-red-400">
        <p className="text-red-400">Invalid property ID</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center p-6 bg-red-50 border border-red-400">
        <p className="text-red-400">An error occurred fetching units</p>
        <Button size="sm" variant="outline" onClick={() => refetch()}>
          Refetch units
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <section className="px-6 space-y-2 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="size-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-lg font-medium text-gray-700">Loading units...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 space-y-2">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button variant="default" asChild>
            <Link
              href={`/properties/${propertyId}`}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden md:inline">Back to property</span>
            </Link>
          </Button>
        </div>

        {!isMarketer && (
          <Button className="space-x-2 text-white" asChild>
            <Link
              href={`/properties/${propertyId}/add-unit`}
              className="flex items-center"
            >
              <Plus className="size-4" />
              <span>Add unit</span>
            </Link>
          </Button>
        )}
      </header>

      {/* Unit Listing with filters */}
      <UnitListing
        units={data.units}
        propertyId={parsedPropertyId}
        currentPage={data.currentPage}
        totalPages={data.totalPages}
        hasNext={data.hasNext}
        hasPrev={data.hasPrev}
        initialFilters={{ search, status, type }}
      />
    </section>
  );
}
