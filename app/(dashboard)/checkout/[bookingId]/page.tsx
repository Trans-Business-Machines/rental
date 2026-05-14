import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { Card, CardContent } from "@/components/ui/card";
import {
  getBookingsForCheckout,
  getInventoryAssignmentsForUnit,
} from "@/lib/actions/checkout";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import Link from "next/link";

// Check if current time is within checkout hours (6 AM - 10 AM EAT)
function isCheckoutTimeAllowed() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Nairobi",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(new Date());
  const h = parseInt(parts.find((p) => p.type === "hour")?.value || "0");
  const m = parseInt(parts.find((p) => p.type === "minute")?.value || "0");
  const totalMinutes = h * 60 + m;
  return totalMinutes >= 360 && totalMinutes <= 600;
}

interface CheckoutProcessPageProps {
  params: Promise<{ bookingId: string }>;
}

async function CheckoutProcessPage({ params }: CheckoutProcessPageProps) {
  const { bookingId } = await params;
  const parsedBookingId = parseInt(bookingId);

  if (isNaN(parsedBookingId)) {
    notFound();
  }

  if (!isCheckoutTimeAllowed()) {
    return (
      <section className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center space-y-4">
            <div className="mx-auto p-4 rounded-full bg-orange-100 w-fit">
              <Clock className="size-8 text-orange-500" />
            </div>
            <h2 className="text-xl font-semibold">Checkout Unavailable</h2>
            <p className="text-muted-foreground">
              Check-out is only allowed between 6:00 AM and 10:00 AM (EAT).
              Please come back during checkout hours.
            </p>
            <Button asChild>
              <Link href="/checkout">Back to Checkout</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  // Fetch all checked in bookings for the select list
  const bookings = await getBookingsForCheckout();

  // Find the specific booking
  const selectedBooking = bookings.find((b) => b.id === parsedBookingId);

  if (!selectedBooking) {
    notFound();
  }

  // Fetch inventory assignments for the unit
  const assignments = await getInventoryAssignmentsForUnit(
    selectedBooking.unit.id,
  );

  return (
    <section className="min-h-screen">
      <header className="flex flex-col items-start gap-4">
        <Button
          variant="outline"
          className="group hover:bg-blue-500 hover:text-white hover:border-blue-500"
          asChild
        >
          <Link href="/checkout">Cancel checkout</Link>
        </Button>

        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
            Guest Checkout
          </h1>
          <p className="text-muted-foreground  text-balance md:text-lg mt-1">
            Complete the checkout process for {selectedBooking.guest.firstName}{" "}
            {selectedBooking.guest.lastName}
          </p>
        </div>
      </header>

      <CheckoutForm
        bookings={bookings}
        assignments={assignments}
        bookingId={parsedBookingId}
      />
    </section>
  );
}

export default CheckoutProcessPage;
