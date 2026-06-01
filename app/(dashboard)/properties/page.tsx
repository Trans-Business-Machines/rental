import { getProperties } from "@/lib/actions/properties";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PropertyListing } from "@/components/PropertyListing";
import Link from "next/link";
import { getServerSession } from "@/lib/check-permissions";
import { redirect } from "next/navigation";
import type { Role } from "@/lib/types/types";

interface PropertiesPageParams {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

export default async function PropertiesPage({
  searchParams,
}: PropertiesPageParams) {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;

  const page = Number(params.page) || 1;
  const search = params.search || "";
  const isAgentOrUser = user.role === "agent" || user.role === "user";

  const propertiesData = await getProperties({ page, search });

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-normal text-foreground">
            Properties
          </h1>
          <p className="text-muted-foreground">
            {isAgentOrUser
              ? "View rental properties for bookings"
              : "Manage your rental properties"}
          </p>
        </div>

        {["admin", "superAdmin"].includes(user.role as Role) && (
          <Link href="/properties/add">
            <Button>
              <Plus className="size-4 mr-1" />
              <span>Add Property</span>
            </Button>
          </Link>
        )}
      </div>

      <PropertyListing
        properties={propertiesData.properties}
        hasNext={propertiesData.hasNext}
        hasPrev={propertiesData.hasPrev}
        totalPages={propertiesData.totalPages}
        currentPage={page}
        initialFilters={{ search }}
        isAgentOrUser={isAgentOrUser}
      />
    </section>
  );
}
