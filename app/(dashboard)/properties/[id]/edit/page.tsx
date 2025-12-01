import { EditPropertyForm } from "@/components/EditPropertyForm";
import { getCachedProperty } from "@/lib/actions/properties";
import { notFound } from "next/navigation";

interface EditPropertyPageParams {
  params: Promise<{ id: string }>;
}

export default async function EditPropertyPage({
  params,
}: EditPropertyPageParams) {
  const { id } = await params;
  const property = await getCachedProperty(Number(id));

  if (!property) {
    notFound();
  }

  return (
    <section className="container mx-auto py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
        <p className="text-gray-600 mt-2">{property.name}</p>
      </header>

      {/* Pass property data to client component */}
      <EditPropertyForm propertyId={id} initialProperty={property} />
    </section>
  );
}
