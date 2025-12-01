import { getProperties } from "@/lib/actions/properties";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PropertyListing } from "@/components/PropertyListing";
import Link from "next/link";

interface PropertiesPageParams {
  searchParams: Promise<{ page: string }>;
}

export default async function PropertiesPage({
  searchParams,
}: PropertiesPageParams) {
  const { page } = await searchParams;

  const currentPage = Number(page) || 1;

  const propertiesData = await getProperties(currentPage);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-normal text-foreground">
            Properties
          </h1>
          <p className="text-muted-foreground">Manage your rental properties</p>
        </div>
        <Link href="/properties/add">
          <Button>
            <Plus className="size-4 mr-1" />
            <span>Add Property</span>
          </Button>
        </Link>
      </div>

      <PropertyListing
        properties={propertiesData.properties}
        hasNext={propertiesData.hasNext}
        hasPrev={propertiesData.hasPrev}
        totalPages={propertiesData.totalPages}
      />
    </section>
  );
}
