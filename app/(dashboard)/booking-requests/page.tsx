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

  // If user is an agent, also prefetch the form data
  if (session.user.role === "agent") {
    await queryClient.prefetchQuery({
      queryKey: ["booking-request-form-data"],
      queryFn: () => getBookingRequestFormData(),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BookingRequestsContent userRole={session.user.role as Role} />
    </HydrationBoundary>
  );
}
 
