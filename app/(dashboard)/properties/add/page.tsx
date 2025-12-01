//import { PropertyForm } from "@/components/PropertyForm";
import { Button } from "@/components/ui/button";
import { NewPropertyForm } from "./new-property-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AddPropertyPage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <Link href="/properties">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4 mr-1" />
            Back to Properties
          </Button>
        </Link>
        <div>
          <h1 className="font-bold text-lg md:text-2xl">Add New Property</h1>
          <p className="text-muted-foreground">
            Create a new rental property.
          </p>
        </div>
      </div>

      <div className="w-11/12">
        <NewPropertyForm />
      </div>
    </section>
  );
}
