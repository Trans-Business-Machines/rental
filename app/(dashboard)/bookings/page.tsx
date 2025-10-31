import { BookingDialog } from "@/components/BookingDialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getBookings, getBookingStats } from "@/lib/actions/bookings";
import { getAllPropertiesWithUnits as getProperties } from "@/lib/actions/properties";
import { Calendar, CheckCircle, Clock, Search, Users } from "lucide-react";
import { StatCards, StatCardsProps } from "@/components/StatCards";
import { Bookings } from "@/components/Bookings";
import Pagination from "@/components/Pagination";

export default async function BookingsPage() {
  // Fetch real data from database
  const bookings = await getBookings();
  const bookingsStats = await getBookingStats();
  const properties = await getProperties();

  const stats: StatCardsProps[] = [
    {
      title: "Total Bookings",
      value: bookingsStats.total,
      icon: Calendar,
      color: "blue",
    },
    {
      title: "Confirmed",
      value: bookingsStats.confirmed,
      icon: CheckCircle,
      color: "green",
    },
    {
      title: "Pending",
      value: bookingsStats.pending,
      icon: Clock,
      color: "orange",
    },
    {
      title: "Completed",
      value: bookingsStats.completed,
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

      {/* Bookings cards and table*/}
      <Bookings bookings={bookings} />

      {/* Pagination */}
      <footer className="flex items-center justify-between pt-4 w-full">
        <Pagination />
      </footer>
    </section>
  );
}
