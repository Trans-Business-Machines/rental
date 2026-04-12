import { getServerSession } from "@/lib/check-permissions";
import { redirect } from "next/navigation";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import {
  getBookingRequests,
  getBookingRequestFormData,
} from "@/lib/actions/booking-requests";
import { BookingRequestsContent } from "@/components/BookingRequestsContent";
import { bookingRequestKeys } from "@/hooks/useBookingRequests";
import { Statistics } from "./Statistics";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import type { Role } from "@/lib/types/types";

export default async function BookingRequestsPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  const queryClient = new QueryClient();

  // Prefetch booking requests list
  await queryClient.prefetchQuery({
    queryKey: bookingRequestKeys.list({ page: 1 }),
    queryFn: () => getBookingRequests({ page: 1 }),
  });

  const isAgent = session.user.role === "agent";

  // If user is an agent, also prefetch the form data
  if (isAgent) {
    await queryClient.prefetchQuery({
      queryKey: ["booking-request-form-data"],
      queryFn: () => getBookingRequestFormData(),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>

      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Booking Requests
          </h1>
          <p className="text-muted-foreground">
            {isAgent
              ? "View and manage your booking requests"
              : "Review and approve booking requests from agents"}
          </p>
        </div>

        {isAgent && (
          <Button asChild>
            <Link href="/booking-requests/new">
              <Plus className="size-4 mr-2" />
              New Request
            </Link>
          </Button>
        )}
      </header>

      <Statistics />
      
      <BookingRequestsContent userRole={session.user.role as Role} />
    </HydrationBoundary>
  );
}
