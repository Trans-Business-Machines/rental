import { AssignmentFilters } from "@/components/AssignmentFilters";
import { CheckoutDialog } from "@/components/CheckoutDialog";
import { InventoryAssignmentDialog } from "@/components/InventoryAssignmentDialog";
import { InventoryAssignmentsList } from "@/components/InventoryAssignmentsList";
import { InventoryDialog } from "@/components/InventoryDialog";
import { InventoryFilters } from "@/components/InventoryFilters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCheckoutReports } from "@/lib/actions/checkout";
import {
  getInventoryAssignments,
  getInventoryItems,
  getInventoryStats,
} from "@/lib/actions/inventory";
import { getAllPropertiesWithUnits as getProperties } from "@/lib/actions/properties";
import { CheckCircle, Package, XCircle } from "lucide-react";
import { StatCards, StatCardsProps } from "@/components/StatCards";
import { InventoryItems } from "@/components/InventoryItems";
import { InventortyCheckoutReports } from "@/components/InventortyCheckoutReports";

interface InventoryPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    status?: string;
    property?: string;
    unit?: string;
    tab?: string;
    // Assignment filters
    assignmentProperty?: string;
    assignmentItem?: string;
    assignmentStatus?: string;
  }>;
}

export default async function InventoryPage({
  searchParams,
}: InventoryPageProps) {
  const {
    search,
    category,
    status,
    property,
    unit,
    tab,
    assignmentProperty,
    assignmentItem,
    assignmentStatus,
  } = await searchParams;

  // Fetch real data from database
  const inventoryStats = await getInventoryStats();
  const inventoryItems = await getInventoryItems();
  const properties = await getProperties();
  const checkoutReports = await getCheckoutReports();
  const assignments = await getInventoryAssignments();

  // Filter items based on search params
  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch =
      !search ||
      item.itemName.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      (item.supplier ?? "").toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      !category || category === "all" || item.category === category;
    const matchesStatus = !status || status === "all" || item.status === status;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Filter assignments based on search params
  const filteredAssignments = assignments.filter((assignment) => {
    const matchesProperty =
      !assignmentProperty ||
      assignmentProperty === "all" ||
      (assignment.property &&
        assignment.property.id.toString() === assignmentProperty);

    const matchesItem =
      !assignmentItem ||
      assignmentItem === "all" ||
      assignment.inventoryItem.id.toString() === assignmentItem;

    const matchesStatus =
      !assignmentStatus ||
      assignmentStatus === "all" ||
      (assignmentStatus === "active" && assignment.isActive) ||
      (assignmentStatus === "returned" && !assignment.isActive);

    return matchesProperty && matchesItem && matchesStatus;
  });

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

      {/* Search and Filters */}
      <InventoryFilters
        search={search}
        category={category}
        status={status}
        property={property}
        unit={unit}
        properties={properties}
      />

      {/* Tabs */}
      <Tabs defaultValue={tab || "inventory"} className="space-y-4">
        <TabsList className="md:w-xl lg:w-3xl">
          <TabsTrigger value="inventory">Inventory Items</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="checkout">Checkout Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <InventoryItems items={filteredItems} />
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          {/* Assignment Actions */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Assignment Management</h2>
              <p className="text-muted-foreground">
                Track and manage inventory assignments to units
              </p>
            </div>
            <InventoryAssignmentDialog />
          </div>

          {/* Assignment Filters */}
          <AssignmentFilters
            properties={properties}
            inventoryItems={inventoryItems}
          />

          {/* Assignments List */}
          <InventoryAssignmentsList assignments={filteredAssignments as any} />
        </TabsContent>

        <TabsContent value="checkout" className="space-y-4">
          <InventortyCheckoutReports reports={checkoutReports} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
