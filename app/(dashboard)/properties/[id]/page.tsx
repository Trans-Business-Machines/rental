import { Button } from "@/components/ui/button";
import { ArrowLeft, SquarePen, Plus } from "lucide-react";
import { PropertyDetails } from "@/components/PropertyDetails";
import { PropertyGallery } from "@/components/PropertyGallery";
import { getPropertyById } from "@/lib/actions/properties";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "@/lib/check-permissions";
import { redirect } from "next/navigation";

interface PropertyDetailsPageProps {
  params: Promise<{ id: string }>;
}

async function PropertyDetailsPage({ params }: PropertyDetailsPageProps) {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  // use this id to get property details from backend
  const id = (await params).id;

  // fetch the property from the database
  const { property, pricings } = await getPropertyById(Number(id));

  if (!property || property === null) {
    notFound();
  }

  return (
    <section className="pb-6 lg:pb-8">
      <header className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between md:pb-3">
        <div className="flex gap-2">
          <Button asChild className="self-center" size="icon" variant="ghost">
            <Link href="/properties">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>

          <div className="flex flex-col">
            <p className="text-xl md:text-2xl font-bold text-foreground capitalize">
              {property.name}
            </p>

            <div className="flex gap-2">
              <p className="text-muted-foreground">{property.address}</p>
            </div>
          </div>
        </div>

        {user.role === "superAdmin" && (
          <div className="flex items-center gap-2 py-3 md:py-0">
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
        )}
      </header>

      {/* Property ImageGallery */}
      <PropertyGallery
        propertyImages={property.media}
        propertyImagesLength={property.media.length}
      />

      <div className="flex flex-col md:flex-row gap-2">
        <PropertyDetails property={property} pricings={pricings} />
        {/*  <PropertyAmenities amenities={amenities} propertyId={property.id} /> */}
      </div>
    </section>
  );
}

export default PropertyDetailsPage;
