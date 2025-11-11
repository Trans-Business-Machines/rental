import { BookingDialog } from "@/components/BookingDialog";
import { getBookings, getBookingStats } from "@/lib/actions/bookings";
import { getPropertyNames } from "@/lib/actions/properties";
import { Calendar, CheckCircle, Clock, Users } from "lucide-react";
import { StatCards, StatCardsProps } from "@/components/StatCards";
import { Bookings } from "@/components/Bookings";

interface BookingsPageProps {
  searchParams: Promise<{ page: string }>;
}

export default async function BookingsPage({
  searchParams,
}: BookingsPageProps) {
  const { page } = await searchParams;

  // Fetch real data from database
  const bookingsPromise = getBookings(Number(page) || 1);
  const propertiesPromise = getPropertyNames();
  const bookingsStatsPromise = getBookingStats();

  const [bookingsResponse, propertiesResponse, bookingStatsResponse] =
    await Promise.all([
      bookingsPromise,
      propertiesPromise,
      bookingsStatsPromise,
    ]);

  const stats: StatCardsProps[] = [
    {
      title: "Total Bookings",
      value: bookingStatsResponse.total,
      icon: Calendar,
      color: "blue",
    },
    {
      title: "Confirmed",
      value: bookingStatsResponse.confirmed,
      icon: CheckCircle,
      color: "green",
    },
    {
      title: "Pending",
      value: bookingStatsResponse.pending,
      icon: Clock,
      color: "orange",
    },
    {
      title: "Completed",
      value: bookingStatsResponse.completed,
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
      <Bookings
        bookings={bookingsResponse.bookings}
        properties={propertiesResponse}
        totalPages={bookingsResponse.totalPages}
        hasNext={bookingsResponse.hasNext}
        hasPrev={bookingsResponse.hasPrev}
      />
    </section>
  );
}
