import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, SquarePen, Plus } from "lucide-react";
import { PropertyDetails } from "@/components/PropertyDetails";
import { PropertyAmenities } from "@/components/PropertyAmenities";
import { PropertyGallery } from "@/components/PropertyGallery";
import { getCachedProperty } from "@/lib/actions/properties";
import { notFound } from "next/navigation";
import { amenities } from "@/lib/data/properties";
import Link from "next/link";

interface PropertyDetailsPageProps {
  params: Promise<{ id: string }>;
}

async function PropertyDetailsPage({ params }: PropertyDetailsPageProps) {
  // use this id to get property details from backend
  const id = (await params).id;

  // fetch the property from the database
  const property = await getCachedProperty(Number(id));

  if (!property) {
    notFound();
  }

  return (
    <section className="pb-6">
      <header className="flex justify-between p-2">
        <div className="flex gap-2">
          <Button asChild className="self-center" size="icon" variant="ghost">
            <Link href="/properties">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>

          <div className="flex flex-col">
            <p className="text-2xl font-bold text-foreground capitalize">
              {property.name}
            </p>

            <div className="flex gap-2">
              <p className="text-muted-foreground">{property.address}</p>
              <Badge className="bg-chart-2/10 text-chart-2 capitalize border-chart-2">
                {property.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href={`/properties/${id}/edit`}>
              <SquarePen className="size-4 text-white" />
              <span className="text-white">Edit property</span>
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/properties/${id}/add-unit`}>
              <Plus className="size-4 text-white" />
              <span className="text-white">Add unit</span>
            </Link>
          </Button>
        </div>
      </header>

      {/* Property ImageGallery */}
      <PropertyGallery
        propertyImages={property.media}
        propertyImagesLength={property.media.length}
      />

      <div className="flex gap-2">
        <PropertyDetails property={property} />
        <PropertyAmenities amenities={amenities} propertyId={property.id} />
      </div>
    </section>
  );
}

export default PropertyDetailsPage;
