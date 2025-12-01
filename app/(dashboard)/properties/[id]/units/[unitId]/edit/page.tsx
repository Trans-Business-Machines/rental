import { EditUnitForm } from "@/components/EditUnitForm";
import { getCachedUnitById } from "@/lib/actions/units";
import { notFound } from "next/navigation";

interface EditUnitPageParams {
  params: Promise<{ id: string; unitId: string }>;
}

export async function EditUnitPage({ params }: EditUnitPageParams) {
  const { id: propertyId, unitId } = await params;

  const parsedPropertyId = Number(propertyId);
  const parsedUnitId = Number(unitId);

  const unit = await getCachedUnitById(parsedUnitId, parsedPropertyId);

  if (!unit) {
    notFound();
  }

  return (
    <section className="container mx-auto py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Unit</h1>
        <p className="text-gray-600 mt-2">{/* Add unit.name */}</p>
      </header>

      {/* Edit Unit Form goes here */}
      <div>
        <EditUnitForm
          propertyId={propertyId}
          unitId={unitId}
          initialUnit={unit}
        />
      </div>
    </section>
  );
}

export default EditUnitPage;
