import { BookingDialog } from "@/components/BookingDialog";
import {
  getBookings,
  getBookingStats,
  getBookingFormData,
} from "@/lib/actions/bookings";
import { getPropertyNames } from "@/lib/actions/properties";
import {
  Calendar,
  CircleCheckBig,
  CalendarClock,
  CircleDashed,
  ClipboardPaste,
  Plus,
} from "lucide-react";
import { StatCards, StatCardsProps } from "@/components/StatCards";
import { Bookings } from "@/components/Bookings";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getServerSession } from "@/lib/check-permissions";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getPaymentSettings } from "@/lib/actions/app-settings";

interface BookingsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    propertyId?: string;
  }>;
}

export default async function BookingsPage({
  searchParams,
}: BookingsPageProps) {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;

  const page = Number(params.page) || 1;
  const search = params.search || "";
  const status = params.status || "all";
  const propertyId = params.propertyId || "all";

  // Create the queryClient used for prefetching
  const queryClient = new QueryClient();

  // Prefetch the booking form data
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["booking-form-data"],
      queryFn: getBookingFormData,
    }),
    queryClient.prefetchQuery({
      queryKey: ["payment-settings"],
      queryFn: () => getPaymentSettings(),
    }),
  ]);

  // Fetch data with filters
  const bookingsPromise = getBookings({ page, search, status, propertyId });
  const propertiesPromise = getPropertyNames();
  const bookingsStatsPromise = getBookingStats();

  const [bookingStatsResponse, bookingsResponse, propertiesResponse] =
    await Promise.all([
      bookingsStatsPromise,
      bookingsPromise,
      propertiesPromise,
    ]);

  const isAgent = user.role === "agent";

  const subtitleSuffix = isAgent
    ? "from your requests"
    : "across all properties";

  const stats: StatCardsProps[] = [
    {
      title: "Total Bookings",
      value: bookingStatsResponse.total,
      subtitle: `All bookings ${subtitleSuffix}`,
      icon: Calendar,
      color: "blue",
    },
    ...(!isAgent
      ? [
          {
            title: "Pending",
            value: bookingStatsResponse.pending ?? 0,
            subtitle: "Awaiting confirmation",
            icon: CircleDashed,
            color: "orange",
          },
        ]
      : []),
    {
      title: "Checked In",
      value: bookingStatsResponse.checkedIn,
      subtitle: "Currently staying",
      icon: CircleCheckBig,
      color: "green",
    },
    {
      title: "Reserved",
      value: bookingStatsResponse.reserved,
      subtitle: "Upcoming stays",
      icon: CalendarClock,
      color: "",
    },
  ];

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <section className="space-y-6">
        <header className="flex flex-col gap-3 md:gap-0 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-normal text-foreground">
              Bookings
            </h1>
            <p className="text-muted-foreground">
              Manage guest bookings and reservations.
            </p>
          </div>

          <div className="flex gap-3">
            {isAgent ? (
              <Button asChild>
                <Link
                  href="/booking-requests/new"
                  className="flex items-center gap-3"
                >
                  <Plus className="size-4 text-white" />
                  <span className="text-white">New Booking Request</span>
                </Link>
              </Button>
            ) : (
              <BookingDialog />
            )}
            <Button asChild className={cn(isAgent && "hidden")}>
              <Link href="/checkout" className="flex items-center gap-3">
                <ClipboardPaste className="size-4 text-white" />
                <span className="text-white">Checkout guest</span>
              </Link>
            </Button>
          </div>
        </header>

        {/* Statistics Cards */}
        <StatCards stats={stats} />

        {/* Bookings cards and table */}
        <Bookings
          bookings={bookingsResponse.bookings}
          properties={propertiesResponse}
          totalPages={bookingsResponse.totalPages}
          hasNext={bookingsResponse.hasNext}
          hasPrev={bookingsResponse.hasPrev}
          currentPage={page}
          initialFilters={{ search, status, propertyId }}
        />
      </section>
    </HydrationBoundary>
  );
}
