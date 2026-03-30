import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/check-permissions";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getBookingRequestById } from "@/lib/actions/booking-requests";
import { BookingRequestDetails } from "@/components/BookingRequestDetails";
import { bookingRequestKeys } from "@/hooks/useBookingRequests";
import type {Role} from "@/lib/types/types"

interface BookingRequestPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingRequestPage({
  params,
}: BookingRequestPageProps) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const requestId = parseInt(id, 10);

  if (isNaN(requestId)) {
    redirect("/booking-requests");
  }

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: bookingRequestKeys.detail(requestId),
    queryFn: () => getBookingRequestById(requestId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BookingRequestDetails
        requestId={requestId}
        userRole={session.user.role as Role}
      />
    </HydrationBoundary>
  );
}