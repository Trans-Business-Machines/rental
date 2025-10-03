import { BookingDialog } from "@/components/BookingDialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getBookings } from "@/lib/actions/bookings";
import { getAllPropertiesWithUnits as getProperties } from "@/lib/actions/properties";
import {
  Calendar,
  CheckCircle,
  Clock,
  Search,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { StatCards, StatCardsProps } from "@/components/StatCards";
import { Bookings } from "@/components/Bookings";
import { Button } from "@/components/ui/button";

export default async function BookingsPage() {
  // Fetch real data from database
  const bookings = await getBookings();
  const properties = await getProperties();

  // Statistics
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(
    (b) => b.status === "confirmed"
  ).length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const completedBookings = bookings.filter(
    (b) => b.status === "completed"
  ).length;

  const stats: StatCardsProps[] = [
    {
      title: "Total Bookings",
      value: totalBookings,
      icon: Calendar,
      color: "blue",
    },
    {
      title: "Confirmed",
      value: confirmedBookings,
      icon: CheckCircle,
      color: "green",
    },
    {
      title: "Pending",
      value: pendingBookings,
      icon: Clock,
      color: "orange",
    },
    {
      title: "Completed",
      value: completedBookings,
      icon: Users,
      color: "",
    },
  ];

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-normal text-foreground">
            Bookings
          </h1>
          <p className="text-muted-foreground">
            Manage guest bookings and reservations.
          </p>
        </div>

        <BookingDialog />
      </header>

      {/* Statistics Cards */}
      <StatCards stats={stats} />

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Search bookings..." className="pl-10" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="checked_in">Checked In</SelectItem>
            <SelectItem value="checked_out">Checked Out</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            {properties.map((property) => (
              <SelectItem key={property.id} value={property.name}>
                {property.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bookings Grid */}
      <Bookings bookings={bookings} />

      {/* Pagination */}
      <footer className="flex items-center justify-between pt-4 w-full">
        <p className="text-sm text-muted-foreground">Page 1 of 1</p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 bg-transparent"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </footer>

      {bookings.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No bookings found</h3>
          <p className="text-muted-foreground">
            Get started by creating your first booking
          </p>
        </div>
      )}
    </section>
  );
}
