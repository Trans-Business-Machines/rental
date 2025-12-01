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
      <div className="flex flex-col gap-2">
        <Link href={`/properties/${propertyId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4 mr-1" />
            Back to Property
          </Button>
        </Link>
        <div>
          <h1 className="font-bold text-lg md:text-2xl">Add a unit</h1>
          <p className="text-muted-foreground">
            Create a unit for this property.
          </p>
        </div>
      </div>

      <div className="w-11/12">
        {/* NewUnitForm goes here */}
        <NewUnitForm propertyId={propertyId} />
      </div>
    </section>
  );
}

export default AddUnitPage;
