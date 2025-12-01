"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
import { UnitListing } from "@/components/UnitListing";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { usePropertyUnits } from "@/hooks/useProperties";
import Pagination from "@/components/Pagination";
import Link from "next/link";

export default function UnitsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  const currentPage = Number(searchParams.get("page")) || 1;
  const propertyId = params.id;

  // Fetch property units from DB
  const { data, isError, error, isLoading } = usePropertyUnits({
    page: currentPage,
    propertyId: Number(propertyId),
  });

  if (isError) {
    console.error("Fetch units failed: ", error);
    return (
      <div className="text-center p-6 bg-red-50 border border-red-400">
        <p className="text-red-400">{error.message}</p>
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

  const handlePageChange = (page: number) => {
    // create a new params object using the exisitng searchParams
    // this helps to reserve other existing params
    const params = new URLSearchParams(searchParams);

    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <section className="px-6 space-y-2">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button variant="ghost" asChild>
            <Link
              href={`/properties/${propertyId}`}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden md:inline">Back to property</span>
            </Link>
          </Button>
        </div>
        <Button className="space-x-2 text-white" asChild>
          <Link
            href={`/properties/${propertyId}/add-unit`}
            className="flex items-center"
          >
            <Plus className="size-4" />
            <span>Add unit</span>
          </Link>
        </Button>
      </header>

      {/* Place Unit grid here */}
      <UnitListing units={data.units} />

      {/* Pagination */}
      <footer className="flex items-center justify-between pt-4">
        <Pagination
          currentPage={data.currentPage}
          totalPages={data.totalPages}
          hasNext={data.hasNext}
          hasPrev={data.hasPrev}
          handlePageChange={handlePageChange}
        />
      </footer>
    </section>
  );
}
