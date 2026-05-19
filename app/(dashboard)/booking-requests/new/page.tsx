import { BookingRequestForm } from "@/components/BookingRequestForm";
import { getServerSession } from "@/lib/check-permissions";
import { redirect } from "next/navigation";
import { UnauthorizedUI } from "./unauthorized-ui";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { Role } from "@/lib/types/types";
import { getPaymentSettings } from "@/lib/actions/app-settings";

export default async function NewRequest() {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  const userRole = user.role as Role;

  // Create the queryClient used for prefetching
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["payment-settings"],
    queryFn: () => getPaymentSettings(),
  });

  if (userRole !== "agent") {
    return <UnauthorizedUI />;
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BookingRequestForm />;
    </HydrationBoundary>
  );
}
