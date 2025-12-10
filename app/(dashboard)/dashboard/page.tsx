import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Home, Wrench } from "lucide-react";
import { InventoryTable } from "./_components/inventory-table";
import { RecentBookingsTable } from "./_components/recent-bookings-table";
import { UnitAvailabilityTable } from "./_components/unit-availability-table";
import { StatCards, StatCardsProps } from "@/components/StatCards";
import { format } from "date-fns";
import {
  getDashboardStats,
  getUnits,
  getRecentBookings,
  getInventoryItems,
} from "@/lib/actions/dashboard";

interface DashboardSearchParamsProps {
  searchParams: Promise<{
    unitsPage: string;
    recentBookingsPage: string;
    itemsPage: string;
  }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardSearchParamsProps) {
  const { unitsPage, recentBookingsPage, itemsPage } = await searchParams;

  const unitsStatsPromise = getDashboardStats();
  const unitsPromise = getUnits(Number(unitsPage) || 1);
  const bookingsPromise = getRecentBookings(Number(recentBookingsPage) || 1);
  const itemsPromise = getInventoryItems(Number(itemsPage) || 1);

  const [
    unitsResponse,
    recentBookingsResponse,
    inventoryItemsResponse,
    unitsStatsResponse,
  ] = await Promise.all([
    unitsPromise,
    bookingsPromise,
    itemsPromise,
    unitsStatsPromise,
  ]);

  const occupancyRate = Math.round(
    (unitsStatsResponse.occupied / unitsStatsResponse.total) * 100
  );

  // Transform units data for the table
  const unitsForTable = unitsResponse.units.map((unit) => {
    const currentBooking = unit.bookings[0];
    const checkOutDate =
      currentBooking &&
      format(new Date(currentBooking.checkOutDate), "dd/MM/yyyy");
    const guestName =
      currentBooking &&
      currentBooking.guest.firstName + " " + currentBooking.guest.lastName;

    /* const unitStatus = isOccupied ? "occupied" : isBookedOrReserved ? "" */

    return {
      id: unit.id,
      name: unit.name,
      property: unit.property.name,
      propertyId: unit.propertyId,
      type: unit.type,
      status: unit.status,
      guest: guestName || null,
      checkOut: checkOutDate || null,
      rent: unit.rent,
    };
  });

  const stats: StatCardsProps[] = [
    {
      title: "Total units",
      value: unitsStatsResponse.total,
      subtitle: `${occupancyRate}% occupancy rate`,
      icon: Home,
      color: "blue",
    },
    {
      title: "Available units",
      value: unitsStatsResponse.available,
      subtitle: "Ready for booking",
      icon: Home,
      color: "orange",
    },
    {
      title: "Monthly revenue",
      value: `$0`,
      subtitle: "+12% increase from last month",
      icon: DollarSign,
      color: "green",
    },
    {
      title: "Maintenance",
      value: unitsStatsResponse.maintenance,
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
          <UnitAvailabilityTable
            units={unitsForTable}
            hasNext={unitsResponse.hasNext}
            hasPrev={unitsResponse.hasPrev}
            totalPages={unitsResponse.totlaPages}
          />
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <RecentBookingsTable
            bookings={recentBookingsResponse.recentBookings}
            hasNext={recentBookingsResponse.hasNext}
            hasPrev={recentBookingsResponse.hasNext}
            totalPages={recentBookingsResponse.totalPages}
          />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <InventoryTable
            items={inventoryItemsResponse.inventoryItems as any}
            totalPages={inventoryItemsResponse.totalPages}
            hasNext={inventoryItemsResponse.hasNext}
            hasPrev={inventoryItemsResponse.hasPrev}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
