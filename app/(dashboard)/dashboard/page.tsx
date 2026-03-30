import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Wrench } from "lucide-react";
import { InventoryTable } from "./_components/inventory-table";
import { RecentBookingsTable } from "./_components/recent-bookings-table";
import { UnitAvailabilityTable } from "./_components/unit-availability-table";
import { StatCards, StatCardsProps } from "@/components/StatCards";
import { format } from "date-fns";
import Link from "next/link";
import {
  getDashboardStats,
  getUnits,
  getRecentBookings,
  getInventoryItems,
} from "@/lib/actions/dashboard";

interface DashboardSearchParamsProps {
  searchParams: Promise<{
    tab?: string;
    page?: string;
    search?: string;
    status?: string;
  }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardSearchParamsProps) {
  const params = await searchParams;

  const tab = params.tab || "units";
  const page = Number(params.page) || 1;
  const search = params.search || "";
  const status = params.status || "all";

  // Fetch data based on active tab with filters
  const unitsPromise =
    tab === "units"
      ? getUnits({ page, search, status })
      : getUnits({ page: 1 });

  const bookingsPromise =
    tab === "bookings"
      ? getRecentBookings({ page, search, status })
      : getRecentBookings({ page: 1 });

  const itemsPromise =
    tab === "inventory"
      ? getInventoryItems({ page, search })
      : getInventoryItems({ page: 1 });

  const unitsStatsPromise = getDashboardStats();

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

  // In your page.tsx where you transform units
  const unitsForTable = unitsResponse.units.map((unit) => {
    const currentBooking = unit.bookings[0];
    const checkOutDate = currentBooking
      ? new Date(currentBooking.checkOutDate)
      : null;
    const formattedCheckOut = checkOutDate
      ? format(checkOutDate, "dd/MM/yyyy")
      : null;
    const guestName = currentBooking
      ? `${currentBooking.guest.firstName} ${currentBooking.guest.lastName}`
      : null;

    // Check if guest has overstayed
    const isOverstayed =
      currentBooking?.status === "checked_in" &&
      checkOutDate &&
      checkOutDate < new Date();

    return {
      id: unit.id,
      name: unit.name,
      property: unit.property.name,
      propertyId: unit.propertyId,
      type: unit.type,
      status: unit.status,
      guest: guestName,
      checkOut: formattedCheckOut,
      isOverstayed,
    };
  });

  const stats: StatCardsProps[] = [
    {
      title: "Total units",
      value: unitsStatsResponse.total,
      subtitle: `All property units`,
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

      <Tabs value={tab} className="space-y-4">
        <TabsList className="md:w-xl lg:w-3xl">
          <TabsTrigger value="units" className="cursor-pointer" asChild>
            <Link href="/dashboard?tab=units&page=1">Unit Status</Link>
          </TabsTrigger>
          <TabsTrigger value="bookings" className="cursor-pointer" asChild>
            <Link href="/dashboard?tab=bookings&page=1">Recent Bookings</Link>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="cursor-pointer" asChild>
            <Link href="/dashboard?tab=inventory&page=1">Inventory</Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="units" className="space-y-4">
          <UnitAvailabilityTable
            units={unitsForTable}
            hasNext={unitsResponse.hasNext}
            hasPrev={unitsResponse.hasPrev}
            totalPages={unitsResponse.totalPages}
            currentPage={page}
            initialFilters={{ search, status }}
          />
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <RecentBookingsTable
            bookings={recentBookingsResponse.recentBookings}
            hasNext={recentBookingsResponse.hasNext}
            hasPrev={recentBookingsResponse.hasPrev}
            totalPages={recentBookingsResponse.totalPages}
            currentPage={page}
            initialFilters={{ search, status }}
          />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <InventoryTable
            items={inventoryItemsResponse.inventoryItems}
            totalPages={inventoryItemsResponse.totalPages}
            hasNext={inventoryItemsResponse.hasNext}
            hasPrev={inventoryItemsResponse.hasPrev}
            currentPage={page}
            initialFilters={{ search }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
