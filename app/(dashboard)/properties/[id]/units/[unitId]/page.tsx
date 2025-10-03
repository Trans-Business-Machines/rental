import { ArrowLeft, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockUnits } from "@/lib/data/properties";
import { notFound } from "next/navigation";
import Link from "next/link";
import UnitGallery from "./unit-gallery";
import UnitInfo from "./unit-info";
import TenantInfo from "./tenant-info";
import UnitInventory from "./unit-inventory";
import UnitBookings from "./unit-bookings";

interface UnitDetailsPageProps {
  params: Promise<{ id: string; unitId: string }>;
}

const getUnitById = (id: string) => {
  return mockUnits.find((unit) => unit.id === id);
};

async function UnitDetailsPage({ params }: UnitDetailsPageProps) {
  const { id: propertyId, unitId } = await params;

  // TODO: switch to server actions later
  const unit = getUnitById(unitId);

  if (!unit) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" asChild>
            <Link href={`/properties/${propertyId}/units`}>
              <ArrowLeft className="size-4 text-muted-foreground" />
            </Link>
          </Button>
          <Link
            href={`/properties/${propertyId}/units`}
            className="text-2xl cursor-pointer font-bold text-foreground"
          >
            Back to units
          </Link>
        </div>

        <Button className="gap-2 bg-chart-1 hover:bg-chart-1/90">
          <Edit className="size-4" />
          <span>Edit Unit</span>
        </Button>
      </header>

      {/* Unit Gallery */}
      <UnitGallery images={unit.images} />

      {/* Unit information */}
      <UnitInfo unit={unit} />

      {/* If unit has tenant, then show tenant info else shoe booking details */}
      {unit?.tenant ? (
        <TenantInfo tenant={unit.tenant} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <UnitInventory />
          <UnitBookings />
        </div>
      )}
    </section>
  );
}

export default UnitDetailsPage;
