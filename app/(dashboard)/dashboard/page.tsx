//import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { prisma } from "@/lib/prisma";
import { DollarSign, Home, Wrench } from "lucide-react";
import { InventoryTable } from "./_components/inventory-table";
import { RecentBookingsTable } from "./_components/recent-bookings-table";
import { UnitAvailabilityTable } from "./_components/unit-availability-table";
import { StatCards, StatCardsProps } from "@/components/StatCards";

export const dynamic = "force-dynamic";
// This is temporary - will move to server actions later
async function getDashboardData() {
  // Get all units with their current bookings to determine status
  const units = await prisma.unit.findMany({
    include: {
      property: true,
      bookings: {
        where: {
          status: "confirmed",
          checkOutDate: {
            gte: new Date(),
          },
        },
        include: {
          guest: true,
        },
        take: 1,
        orderBy: {
          checkOutDate: "asc",
        },
      },
    },
  });

  // Get recent bookings
  const recentBookings = await prisma.booking.findMany({
    include: {
      guest: true,
      unit: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  // Get inventory items
  const inventoryItems = await prisma.inventoryItem.findMany({
    include: {
      assignments: {
        where: {
          isActive: true,
        },
      },
    },
    orderBy: {
      itemName: "asc",
    },
  });

  // Calculate monthly revenue from current month bookings
  const currentMonth = new Date();
  currentMonth.setDate(1);
  currentMonth.setHours(0, 0, 0, 0);

  const nextMonth = new Date(currentMonth);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const monthlyBookings = await prisma.booking.findMany({
    where: {
      createdAt: {
        gte: currentMonth,
        lt: nextMonth,
      },
    },
  });

  const monthlyRevenue = monthlyBookings.reduce(
    (sum, booking) => sum + booking.totalAmount,
    0
  );

  return {
    units,
    recentBookings,
    inventoryItems,
    monthlyRevenue,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  // Calculate metrics
  const totalUnits = data.units.length;
  const occupiedUnits = data.units.filter(
    (unit) => unit.bookings.length > 0
  ).length;

  const availableUnits = data.units.filter(
    (unit) => unit.status === "available" && unit.bookings.length === 0
  ).length;

  const maintenanceUnits = data.units.filter(
    (unit) => unit.status === "maintenance"
  ).length;

  const occupancyRate = Math.round((occupiedUnits / totalUnits) * 100);

  // Transform units data for the table
  const unitsForTable = data.units.map((unit) => {
    const currentBooking = unit.bookings[0];
    const isOccupied = currentBooking && unit.status !== "maintenance";

    return {
      id: unit.name,
      property: unit.property.name,
      type: unit.type,
      status: isOccupied ? "occupied" : unit.status,
      guest: currentBooking
        ? `${currentBooking.guest.firstName} ${currentBooking.guest.lastName}`
        : null,
      checkOut: currentBooking
        ? currentBooking.checkOutDate.toLocaleDateString()
        : null,
      rent: unit.rent,
    };
  });

  const stats: StatCardsProps[] = [
    {
      title: "Total units",
      value: totalUnits,
      subtitle: `${occupancyRate}% occupancy rate`,
      icon: Home,
      color: "blue",
    },
    {
      title: "Available units",
      value: availableUnits,
      subtitle: "Ready for booking",
      icon: Home,
      color: "orange",
    },
    {
      title: "Monthly revenue",
      value: `$${data.monthlyRevenue}`,
      subtitle: "+12% increase from last month",
      icon: DollarSign,
      color: "green",
    },
    {
      title: "Maintenance",
      value: maintenanceUnits,
      subtitle: "Units under maintenance",
      icon: Wrench,
      color: "red",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-normal text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Here&apos;s an overview of your rental properties.
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <StatCards stats={stats} />

      <Tabs defaultValue="units" className="space-y-4">
        <TabsList className="md:w-xl lg:w-3xl">
          <TabsTrigger value="units" className="cursor-pointer">
            Unit Status
          </TabsTrigger>
          <TabsTrigger value="bookings" className="cursor-pointer">
            Recent Bookings
          </TabsTrigger>
          <TabsTrigger value="inventory" className="cursor-pointer">
            Inventory
          </TabsTrigger>
        </TabsList>

        <TabsContent value="units" className="space-y-4">
          <UnitAvailabilityTable units={unitsForTable} />
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <RecentBookingsTable bookings={data.recentBookings} />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <InventoryTable items={data.inventoryItems as any} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
