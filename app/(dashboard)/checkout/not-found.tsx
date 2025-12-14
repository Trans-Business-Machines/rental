import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import Link from "next/link";

function BookingNotFound() {
  return (
    <section className="py-6 px-4 flex justify-center">
      <Card className="max-w-md w-full">
        <CardContent className="text-center">
          <XCircle className="size-12 text-chart-5/80 mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Booking not found</h2>
          <p className="text-sm text-muted-foreground">
            The booking you are looking for does not exist!
          </p>
          <Button asChild className="mt-4">
            <Link href="/bookings">Back to bookings</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

export default BookingNotFound;
