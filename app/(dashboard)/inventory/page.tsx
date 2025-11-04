import { getCheckoutReports } from "@/lib/actions/checkout";
import {
  getInventoryAssignments,
  getInventoryItems,
  getInventoryStats,
} from "@/lib/actions/inventory";
import { getAllPropertiesWithUnits as getProperties } from "@/lib/actions/properties";
import { CheckoutDialog } from "@/components/CheckoutDialog";
import { InventoryDialog } from "@/components/InventoryDialog";
import { InventoryAssignments } from "@/components/InventoryAssignments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Package, XCircle } from "lucide-react";
import { StatCards, StatCardsProps } from "@/components/StatCards";
import { InventoryItems } from "@/components/InventoryItems";
import { InventortyCheckoutReports } from "@/components/InventortyCheckoutReports";

export default async function InventoryPage() {
  // Fetch real data from database
  const inventoryStats = await getInventoryStats();
  const inventoryItems = await getInventoryItems();
  const properties = await getProperties();
  const checkoutReports = await getCheckoutReports();
  const assignments = await getInventoryAssignments();

  const stats: StatCardsProps[] = [
    {
      title: "Total Items",
      value: inventoryStats.total,
      icon: Package,
      color: "blue",
    },
    {
      title: "Available",
      value: inventoryStats.available,
      icon: CheckCircle,
      color: "green",
    },
    {
      title: "Assigned",
      value: inventoryStats.assigned,
      icon: Package,
      color: "",
    },
    {
      title: "Active",
      value: inventoryStats.active,
      icon: CheckCircle,
      color: "green",
    },
    {
      title: "Discontinued",
      value: inventoryStats.discontinued,
      icon: XCircle,
      color: "red",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
          <InventoryItems items={inventoryItems} />
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <InventoryAssignments
            assignments={assignments}
            properties={properties}
          />
        </TabsContent>

        <TabsContent value="checkout" className="space-y-4">
          <InventortyCheckoutReports reports={checkoutReports} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
