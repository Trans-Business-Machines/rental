import { EditUnitForm } from "@/components/EditUnitForm";
import { Button } from "@/components/ui/button";
import { getUnitById } from "@/lib/actions/units";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface EditUnitPageParams {
  params: Promise<{ id: string; unitId: string }>;
}

async function EditUnitPage({ params }: EditUnitPageParams) {
  const { id: propertyId, unitId } = await params;

  const unit = await getUnitById(unitId, propertyId);

  if (!unit) {
    notFound();
  }

  return (
    <section className="container mx-auto py-8">
      <header className="mb-6 flex gap-2">
        <div>
          <Button
            asChild
            size="sm"
            variant="default"
            className="group hover:bg-blue-500 hover:border-blue-500 hover:text-white"
          >
            <Link
              href={`/properties/${propertyId}/units/`}
              className="flex items center gap-3"
            >
              <ArrowLeft color="#fff" />
            </Link>
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Unit</h1>
          <p className="text-gray-600">{unit.name}</p>
        </div>
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
