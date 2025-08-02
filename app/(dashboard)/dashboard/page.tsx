import { BookingDialog } from "@/components/BookingDialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { prisma } from "@/lib/prisma"
import {
	CheckCircle,
	DollarSign,
	Key,
	Settings
} from "lucide-react"
import { InventoryTable } from "./_components/inventory-table"
import { RecentBookingsTable } from "./_components/recent-bookings-table"
import { UnitAvailabilityTable } from "./_components/unit-availability-table"

export const dynamic = "force-dynamic"
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
  })

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
  })

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
  })

  // Calculate monthly revenue from current month bookings
  const currentMonth = new Date()
  currentMonth.setDate(1)
  currentMonth.setHours(0, 0, 0, 0)
  
  const nextMonth = new Date(currentMonth)
  nextMonth.setMonth(nextMonth.getMonth() + 1)

  const monthlyBookings = await prisma.booking.findMany({
    where: {
      createdAt: {
        gte: currentMonth,
        lt: nextMonth,
      },
    },
  })

  const monthlyRevenue = monthlyBookings.reduce((sum, booking) => sum + booking.totalAmount, 0)

  return {
    units,
    recentBookings,
    inventoryItems,
    monthlyRevenue,
  }
}



export default async function DashboardPage() {
  const data = await getDashboardData()
  
  // Calculate metrics
  const totalUnits = data.units.length
  const occupiedUnits = data.units.filter(unit => unit.bookings.length > 0).length
  const availableUnits = data.units.filter(unit => unit.status === "available" && unit.bookings.length === 0).length
  const maintenanceUnits = data.units.filter(unit => unit.status === "maintenance").length
  const occupancyRate = Math.round((occupiedUnits / totalUnits) * 100)

  // Transform units data for the table
  const unitsForTable = data.units.map(unit => {
    const currentBooking = unit.bookings[0]
    const isOccupied = currentBooking && unit.status !== "maintenance"
    
    return {
      id: unit.name,
      property: unit.property.name,
      type: unit.type,
      status: isOccupied ? "occupied" : unit.status,
      guest: currentBooking ? `${currentBooking.guest.firstName} ${currentBooking.guest.lastName}` : null,
      checkOut: currentBooking ? currentBooking.checkOutDate.toLocaleDateString() : null,
      rent: unit.rent,
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <BookingDialog />
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnits}</div>
            <p className="text-xs text-muted-foreground">{occupancyRate}% occupancy rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Units</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{availableUnits}</div>
            <p className="text-xs text-muted-foreground">Ready for booking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{maintenanceUnits}</div>
            <p className="text-xs text-muted-foreground">Units under maintenance</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="units" className="space-y-4">
        <TabsList>
          <TabsTrigger value="units">Unit Status</TabsTrigger>
          <TabsTrigger value="bookings">Recent Bookings</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
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
  )
} 