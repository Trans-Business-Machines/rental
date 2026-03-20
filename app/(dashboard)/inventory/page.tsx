import { getCheckoutReports } from "@/lib/actions/checkout";
import {
  getInventoryAssignments,
  getInventoryItems,
  getInventoryStatsByCategory,
} from "@/lib/actions/inventory";
import { getPropertyNames } from "@/lib/actions/properties";
import { InventoryDialog } from "@/components/InventoryDialog";
import { InventoryAssignments } from "@/components/InventoryAssignments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryCarousel } from "@/components/CategoryCarousel";
import { InventoryItems } from "@/components/InventoryItems";
import { InventortyCheckoutReports } from "@/components/InventortyCheckoutReports";
import { getServerSession } from "@/lib/check-permissions";
import { redirect } from "next/navigation";
import { UnauthorizedUI } from "./unauthorized-ui";
import Link from "next/link";
import type { Role } from "@/lib/types/types";

interface InventoryPageSearchParams {
  searchParams: Promise<{
    tab?: string;
    page?: string;
    search?: string;
    status?: string;
    category?: string;
    propertyId?: string;
    unitId?: string;
    sortOrder?: "none" | "asc" | "asc";
  }>;
}

export default async function InventoryPage({
  searchParams,
}: InventoryPageSearchParams) {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  const userRole = user.role as Role;

  if (userRole === "agent") {
    return <UnauthorizedUI />;
  }

  const params = await searchParams;

  const tab = params.tab || "inventory";
  const page = Number(params.page) || 1;
  const search = params.search || "";
  const status = params.status || "all";
  const category = params.category || "all";
  const propertyId = params.propertyId || "all";
  const unitId = params.unitId || "";
  const sortOrder = params.sortOrder || "none";

  // Fetch data based on active tab with filters
  const inventoryItemsPromise = getInventoryItems({
    page,
    search,
    status,
    category,
  });

  const assignmentsPromise = getInventoryAssignments({
    page,
    search,
    propertyId,
    unitId,
    status,
  });

  const checkoutReportsPromise = getCheckoutReports({
    page,
    search,
    sortOrder,
  });

  const propertiesPromise = getPropertyNames();
  const categoryStatsPromise = getInventoryStatsByCategory();

  const [
    inventoryItemsResponse,
    checkoutReportsResponse,
    assignmentsResponse,
    propertiesResponse,
    categoryStatsResponse,
  ] = await Promise.all([
    inventoryItemsPromise,
    checkoutReportsPromise,
    assignmentsPromise,
    propertiesPromise,
    categoryStatsPromise,
  ]);

  return (
    <section className="space-y-6">
      <header className="flex flex-col md:flex-row gap-4 md:gap-0 md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-normal text-foreground">
            Inventory Management
          </h1>
          <p className="text-muted-foreground">
            Manage property inventory and guest checkout inspections
          </p>
        </div>
        <div className="flex space-x-2">
          <InventoryDialog />
        </div>
      </header>

      {/* Statistics Cards */}
      <div className="flex px-4 justify-center">
        <CategoryCarousel stats={categoryStatsResponse} />
      </div>

      {/* Tabs */}
      <Tabs value={tab} className="space-y-2">
        <TabsList className="md:w-xl lg:w-3xl">
          <TabsTrigger value="inventory" className="cursor-pointer" asChild>
            <Link href="/inventory?tab=inventory&page=1">Inventory Items</Link>
          </TabsTrigger>
          <TabsTrigger value="assignments" className="cursor-pointer" asChild>
            <Link href="/inventory?tab=assignments&page=1">Assignments</Link>
          </TabsTrigger>
          <TabsTrigger value="checkout" className="cursor-pointer" asChild>
            <Link href="/inventory?tab=checkout&page=1">Checkout Reports</Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <InventoryItems
            items={inventoryItemsResponse.items}
            totalPages={inventoryItemsResponse.totalPages}
            hasNext={inventoryItemsResponse.hasNext}
            hasPrev={inventoryItemsResponse.hasPrev}
            currentPage={page}
            initialFilters={{ search, status, category }}
          />
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <InventoryAssignments
            assignments={assignmentsResponse.assignments}
            properties={propertiesResponse}
            hasNext={assignmentsResponse.hasNext}
            hasPrev={assignmentsResponse.hasPrev}
            totalAssignments={assignmentsResponse.totalAssignments}
            totalPages={assignmentsResponse.totalPages}
            currentPage={page}
            initialFilters={{ search, propertyId, unitId, status }}
          />
        </TabsContent>

        <TabsContent value="checkout" className="space-y-4">
          <InventortyCheckoutReports
            reports={checkoutReportsResponse.reports}
            hasNext={checkoutReportsResponse.hasNext}
            hasPrev={checkoutReportsResponse.hasPrev}
            totalPages={checkoutReportsResponse.totalPages}
            currentPage={page}
            initialFilters={{ search, sortOrder }}
          />
        </TabsContent>
      </Tabs>
    </section>
  );
}
