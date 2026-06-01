import { EditPropertyForm } from "@/components/EditPropertyForm";
import { getPropertyById } from "@/lib/actions/properties";
import { notFound } from "next/navigation";
import { getServerSession } from "@/lib/check-permissions";
import { redirect } from "next/navigation";
import { UnauthorizedUI } from "../../unauthorized-ui";
import type { Role } from "@/lib/types/types";

interface EditPropertyPageParams {
  params: Promise<{ id: string }>;
}

export default async function EditPropertyPage({
  params,
}: EditPropertyPageParams) {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  if (!["admin", "superAdmin"].includes(user.role as Role)) {
    return <UnauthorizedUI />;
  }

  const { id } = await params;
  const { property } = await getPropertyById(Number(id));

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
