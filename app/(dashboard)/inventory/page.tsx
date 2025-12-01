import { getCheckoutReports } from "@/lib/actions/checkout";
import {
  getInventoryAssignments,
  getInventoryItems,
  getInventoryStats,
} from "@/lib/actions/inventory";
import { getPropertyNames } from "@/lib/actions/properties";
import { CheckoutDialog } from "@/components/CheckoutDialog";
import { InventoryDialog } from "@/components/InventoryDialog";
import { InventoryAssignments } from "@/components/InventoryAssignments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Package, XCircle } from "lucide-react";
import { StatCards, StatCardsProps } from "@/components/StatCards";
import { InventoryItems } from "@/components/InventoryItems";
import { InventortyCheckoutReports } from "@/components/InventortyCheckoutReports";

interface InventoryPageSearchParams {
  searchParams: Promise<{
    itemsPage: string;
    assignmentsPage: string;
    reportsPage: string;
  }>;
}

export default async function InventoryPage({
  searchParams,
}: InventoryPageSearchParams) {
  const { itemsPage, reportsPage, assignmentsPage } = await searchParams;

  // Fetch real data from database
  const inventoryItemsPromise = getInventoryItems(Number(itemsPage) || 1);
  const checkoutReportsPromise = getCheckoutReports(Number(reportsPage) || 1);
  const assignmentsPromise = getInventoryAssignments(
    Number(assignmentsPage) || 1
  );
  const propertiesPromise = getPropertyNames();
  const inventoryStatsPromise = getInventoryStats();

  const [
    inventoryItemsResponse,
    checkoutReportsResponse,
    assignmentsResponse,
    propertiesResponse,
    inventoryStatsResponse,
  ] = await Promise.all([
    inventoryItemsPromise,
    checkoutReportsPromise,
    assignmentsPromise,
    propertiesPromise,
    inventoryStatsPromise,
  ]);

  const stats: StatCardsProps[] = [
    {
      title: "Total Items",
      value: inventoryStatsResponse.total,
      icon: Package,
      color: "blue",
    },
    {
      title: "Available",
      value: inventoryStatsResponse.available,
      icon: CheckCircle,
      color: "green",
    },
    {
      title: "Assigned",
      value: inventoryStatsResponse.assigned,
      icon: Package,
      color: "",
    },
    {
      title: "Active",
      value: inventoryStatsResponse.active,
      icon: CheckCircle,
      color: "green",
    },
    {
      title: "Discontinued",
      value: inventoryStatsResponse.discontinued,
      icon: XCircle,
      color: "red",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:gap-0 md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-normal text-foreground">
            Inventory Management
          </h1>
          <p className="text-muted-foreground">
            Manage property inventory and guest checkout inspections
          </p>
        </div>
        <div className="flex space-x-2">
          <CheckoutDialog />
          <InventoryDialog />
        </div>
      </div>

      {/* Statistics Cards */}
      <StatCards stats={stats} />

      {/* Tabs */}
      <Tabs defaultValue="inventory" className="space-y-2">
        <TabsList className="md:w-xl lg:w-3xl">
          <TabsTrigger value="inventory" className="cursor-pointer">
            Inventory Items
          </TabsTrigger>
          <TabsTrigger value="assignments" className="cursor-pointer">
            Assignments
          </TabsTrigger>
          <TabsTrigger value="checkout" className="cursor-pointer">
            Checkout Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <InventoryItems
            items={inventoryItemsResponse.items}
            totalPages={inventoryItemsResponse.totalPages}
            hasNext={inventoryItemsResponse.hasNext}
            hasPrev={inventoryItemsResponse.hasPrev}
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
          />
        </TabsContent>

        <TabsContent value="checkout" className="space-y-4">
          <InventortyCheckoutReports
            reports={checkoutReportsResponse.reports}
            hasNext={checkoutReportsResponse.hasNext}
            hasPrev={checkoutReportsResponse.hasPrev}
            totalPages={checkoutReportsResponse.totalPages}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
