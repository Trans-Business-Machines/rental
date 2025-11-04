import { BookingDialog } from "@/components/BookingDialog";
import { getBookings, getBookingStats } from "@/lib/actions/bookings";
import { getAllPropertiesWithUnits as getProperties } from "@/lib/actions/properties";
import { Calendar, CheckCircle, Clock, Users } from "lucide-react";
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

      {/* Bookings cards and table*/}
      <Bookings bookings={bookings} properties={properties} />

      {/* Pagination */}
      <footer className="flex items-center justify-between pt-4 w-full">
        <Pagination />
      </footer>
    </section>
  );
}
