import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { UnitListing } from "@/components/UnitListing";
import { mockUnits } from "@/lib/data/properties";
import Pagination from "@/components/Pagination";
import Link from "next/link";

interface UnitsPageProps {
  params: Promise<{ id: string }>;
}

export default async function UnitsPage({ params }: UnitsPageProps) {
  const { id } = await params;

  // TODO: use this params.id (propertyId) to get property units info from db
  console.log(`property id: ${id}`);

  // TODO: function to handle page change
  function handlePageChange(page: number) {
    console.log(page);
  }

  return (
    <section className="px-6 space-y-2">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/properties/${id}`}>
              <ArrowLeft className="size-4" />
            </Link>
          </Button>

          <Link
            href={`/properties/${id}`}
            className="text-lg hover:text-muted-foreground font-bold text-foreground"
          >
            Back
          </Link>
        </div>
        <Button className="space-x-2 text-white">
          <Plus className="size-4" />
          <span>Add unit</span>
        </Button>
      </header>

      {/* Place Unit grid here */}
      <UnitListing units={mockUnits} />

      {/* Pagination */}
      <footer className="flex items-center justify-between pt-4">
        <Pagination
          currentPage={1}
          totalPages={1}
          hasNext={false}
          hasPrev={false}
          handlePageChange={handlePageChange}
        />
      </footer>
    </section>
  );
}
