import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { NewUnitForm } from "@/components/NewUnitForm";
import Link from "next/link";

interface AddUnitPageParams {
  params: Promise<{ id: string }>;
}

async function AddUnitPage({ params }: AddUnitPageParams) {
  const { id } = await params;
  const propertyId = Number(id);

  return (
    <section className="space-y-6">
      <div className="flex flex-col  items-start gap-2 md:gap-4">
        <Button
          asChild
          size="sm"
          variant="outline"
          className="group hover:bg-blue-500 hover:border-blue-500 hover:text-white"
        >
          <Link
            href={`/properties/${propertyId}/units`}
            className="flex items center gap-3"
          >
            <ArrowLeft className="size-4 mr-1" />
            <span>Back to units</span>
          </Link>
        </Button>

        <div>
          <h1 className="font-bold text-lg md:text-2xl">Add a unit</h1>
          <p className="text-muted-foreground">
            Create a unit for this property.
          </p>
        </div>
      </div>

      <div className="w-12/12">
        <NewUnitForm propertyId={propertyId} />
      </div>
    </section>
  );
}

export default AddUnitPage;
