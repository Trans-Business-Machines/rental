import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, SquarePen } from "lucide-react";
import { mockProperty } from "@/lib/data/properties";
import { PropertyDetails } from "@/components/PropertyDetails";
import { PropertyAmenities } from "@/components/PropertyAmenities";
import { PropertyGallery } from "@/components/PropertyGallery";
import Link from "next/link";

interface PropertyDetailsPageProps {
  params: Promise<{ id: string }>;
}

async function PropertyDetailsPage({ params }: PropertyDetailsPageProps) {
  // TODO: use this id to get property details from backend
  const id = (await params).id;
  console.log("Property id: ", id);

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
              {mockProperty.name}
            </p>

            <div className="flex gap-2">
              <p className="text-muted-foreground">{mockProperty.address}</p>
              <Badge className="bg-chart-2/10 text-chart-2 capitalize border-chart-2">
                {mockProperty.status}
              </Badge>
            </div>
          </div>
        </div>

        <div>
          <Button asChild>
            <Link href={`/properties/${id}/edit`}>
              <SquarePen className="size-4 text-white" />
              <span className="text-white">Edit property</span>
            </Link>
          </Button>
        </div>
      </header>

      {/* Property ImageGallery */}
      <PropertyGallery
        propertyImages={mockProperty.images}
        propertyImagesLength={mockProperty.images.length}
      />

      <div className="flex gap-2">
        <PropertyDetails property={mockProperty} />
        <PropertyAmenities property={mockProperty} />
      </div>
    </section>
  );
}

export default PropertyDetailsPage;
