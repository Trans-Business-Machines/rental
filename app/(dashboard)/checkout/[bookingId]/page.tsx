import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import {
  getBookingsForCheckout,
  getInventoryAssignmentsForUnit,
} from "@/lib/actions/checkout";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import Link from "next/link";

interface CheckoutProcessPageProps {
  params: Promise<{ bookingId: string }>;
}

async function CheckoutProcessPage({ params }: CheckoutProcessPageProps) {
  const { bookingId } = await params;
  const parsedBookingId = parseInt(bookingId);

  if (isNaN(parsedBookingId)) {
    notFound();
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
    selectedBooking.unit.id
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
