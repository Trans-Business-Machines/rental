import { AssignmentFilters } from "@/components/AssignmentFilters";
import { CheckoutDialog } from "@/components/CheckoutDialog";
import { InventoryAssignmentDialog } from "@/components/InventoryAssignmentDialog";
import { InventoryAssignmentsList } from "@/components/InventoryAssignmentsList";
import { InventoryDialog } from "@/components/InventoryDialog";
import { InventoryFilters } from "@/components/InventoryFilters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCheckoutReports } from "@/lib/actions/checkout";
import {
  getInventoryAssignments,
  getInventoryItems,
} from "@/lib/actions/inventory";
import { getAllPropertiesWithUnits as getProperties } from "@/lib/actions/properties";
import {
  Bed,
  CheckCircle,
  Download,
  Eye,
  Package,
  XCircle,
} from "lucide-react";
import { StatCards, StatCardsProps } from "@/components/StatCards";
import { InventoryItems } from "@/components/InventoryItems";

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Statistics
  const totalItems = inventoryItems.length;
  const assignedItems = assignments.filter((a) => a.isActive).length;
  const activeItems = inventoryItems.filter(
    (i) => i.status === "active"
  ).length;
  const discontinuedItems = inventoryItems.filter(
    (i) => i.status === "discontinued"
  ).length;
  const availableItems = inventoryItems.filter(
    (i: any) => i.isAvailable
  ).length;

  const stats: StatCardsProps[] = [
    {
      title: "Total Items",
      value: totalItems,
      icon: Package,
      color: "blue",
    },
    {
      title: "Available",
      value: availableItems,
      icon: CheckCircle,
      color: "green",
    },
    {
      title: "Assigned",
      value: assignedItems,
      icon: Package,
      color: "",
    },
    {
      title: "Active",
      value: activeItems,
      icon: CheckCircle,
      color: "green",
    },
    {
      title: "Discontinued",
      value: discontinuedItems,
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
          {/* Checkout Reports Grid */}
          {checkoutReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {checkoutReports.map((report) => (
                <Card
                  key={report.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {report.guest.firstName} {report.guest.lastName}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {report.guest.email}
                        </p>
                      </div>
                      <Badge
                        variant={
                          report.status === "completed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {report.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Property Information */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Bed className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {report.booking.property.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {report.booking.unit.name}
                        </span>
                      </div>
                    </div>

                    {/* Checkout Date and Inspector */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <p className="font-medium">Checkout Date</p>
                        <p className="text-muted-foreground">
                          {formatDate(report.checkoutDate)}
                        </p>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <p className="font-medium">Inspector</p>
                        <p className="text-muted-foreground">
                          {report.inspector}
                        </p>
                      </div>
                    </div>

                    {/* Financial Information */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Damage Cost
                        </span>
                        <span
                          className={
                            report.totalDamageCost > 0
                              ? "text-red-600 font-medium"
                              : "text-green-600"
                          }
                        >
                          {formatCurrency(report.totalDamageCost)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Deposit Deduction
                        </span>
                        <span
                          className={
                            report.depositDeduction > 0
                              ? "text-red-600 font-medium"
                              : "text-green-600"
                          }
                        >
                          {formatCurrency(report.depositDeduction)}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No checkout reports found</h3>
              <p className="text-muted-foreground">
                Checkout reports will appear here after guest checkouts are
                completed.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
