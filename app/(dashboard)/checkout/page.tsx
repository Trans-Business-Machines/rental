"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGuestCheckout } from "@/hooks/useGuestCheckout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  Users,
  Loader2,
  ArrowLeft,
  House,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

function CheckoutLandingPage() {
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const { data: bookings, isLoading, isError, refetch } = useGuestCheckout();
  const router = useRouter();

  if (isLoading) {
    return (
      <section className="space-y-6  min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground flex flex-col gap-2 items-center justify-center">
          <Loader2 className="size-6 lg:size-12 animate-spin text-chart-1" />
          <p>Loading checked in bookings . . .</p>
        </div>
      </section>
    );
  }

  if (isError && bookings === undefined) {
    return (
      <section className="space-y-6  min-h-screen flex items-center justify-center">
        <div className="text-char-5 font-semi-bold flex items-center justify-center gap-2">
          <h2>Could not fetch checked in booking.</h2>
          <Button size="sm" onClick={() => refetch()}>
            Retry again
          </Button>
        </div>
      </section>
    );
  }

  const selectedBooking = bookings?.find(
    (b) => b.id.toString() === selectedBookingId
  );

  const handleContinue = () => {
    if (selectedBooking) {
      router.push(`/checkout/${selectedBookingId}`);
    }
  };

  return (
    <section className="space-y-3 md:space-y-4 lg:space-y-6">
      <header className="flex flex-col items-start gap-3">
        <Button asChild variant="secondary" className="group">
          <Link href="/bookings" className="flex items-center gap-2">
            <ArrowLeft className="size-4 group-hover:rotate-45 transition-transform duration-300 ease-in-out" />
            <span>Back to bookings</span>
          </Link>
        </Button>

        <div>
          <h1 className="text-3xl font-bold tracking-normal text-foreground">
            Guest Checkout
          </h1>
          <p className="text-muted-foreground">
            Select a guest to begin the checkout process
          </p>
        </div>
      </header>

      {bookings?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="size-10 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No guests to check out</p>
            <p className="text-sm text-muted-foreground">
              There are no guests currently checked in
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 min-h-[80%]">
          {/* Select Checked In Guest Drop down */}
          <Card className="md:col-span-2 border-0 shadow-sm bg-card">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">
                Select a checked in guest
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="guest-select">Guest and booking</Label>
                <p className="text-sm text-muted-foreground">
                  {bookings?.length} guests available for checkout
                </p>

                <Select
                  value={selectedBookingId}
                  onValueChange={setSelectedBookingId}
                >
                  <SelectTrigger id="guest-select" className="w-full">
                    <SelectValue placeholder="Select a guest" />
                  </SelectTrigger>
                  <SelectContent>
                    {bookings?.map((booking) => (
                      <SelectItem
                        key={booking.id}
                        value={booking.id.toString()}
                        className="cursor-pointer"
                      >
                        {booking.guest.firstName} {booking.guest.lastName} -{" "}
                        {booking.property.name} {booking.unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedBooking && (
                <div>
                  <h2 className="text-base font-semibold tracking-normal text-foreground">
                    Selected booking details
                  </h2>

                  <Card>
                    <CardContent className="grid md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-chart-4/10 mt-0.5">
                            <Building2 className="h-4 w-4 text-chart-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              Property
                            </p>
                            <p className="font-semibold truncate">
                              {selectedBooking.property.name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-chart-4/10 mt-0.5">
                            <House className="h-4 w-4 text-chart-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              Unit
                            </p>
                            <p className="font-semibold truncate">
                              {selectedBooking.unit.name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-chart-1/10 mt-0.5">
                            <Calendar className="h-4 w-4 text-chart-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              Checked In
                            </p>
                            <p className="font-semibold">
                              {format(
                                new Date(selectedBooking.checkInDate),
                                "PPP"
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-chart-1/10 mt-0.5">
                            <Calendar className="h-4 w-4 text-chart-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              Expected Checked Out
                            </p>
                            <p className="font-semibold">
                              {format(
                                new Date(selectedBooking.checkOutDate),
                                "PPP"
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-chart-1/10 mt-0.5">
                            <Users className="h-4 w-4 text-chart-1" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              Number of Guests
                            </p>
                            <p className="font-semibold">
                              {selectedBooking.numberOfGuests} guests
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected Booking preview */}
          <Card className="md:col-span-1 border-0 shadow-sm bg-card">
            <CardHeader>
              <CardTitle className="text-xl">Guest Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedBooking ? (
                <div className="space-y-6">
                  {/* Guest Information */}
                  <div className="space-y-4">
                    <article className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-chart-1/10 mt-0.5">
                        <User className="h-4 w-4 text-chart-1" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Guest Name
                        </p>
                        <p className="font-semibold truncate">
                          {selectedBooking.guest.firstName}{" "}
                          {selectedBooking.guest.lastName}
                        </p>
                      </div>
                    </article>

                    <article className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-chart-2/10 mt-0.5">
                        <Mail className="h-4 w-4 text-chart-2" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Email
                        </p>
                        <p className="font-semibold truncate">
                          {selectedBooking.guest.email}
                        </p>
                      </div>
                    </article>

                    <article className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-chart-3/10 mt-0.5">
                        <Phone className="h-4 w-4 text-chart-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Phone
                        </p>
                        <p className="font-semibold truncate">
                          {selectedBooking.guest.phone}
                        </p>
                      </div>
                    </article>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 rounded-full bg-muted/50 mb-4">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Select a guest to view booking details
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="text-center py-5">
        <Button
          disabled={!selectedBookingId}
          className="w-2/3 cursor-pointer"
          onClick={() => handleContinue()}
        >
          {!selectedBookingId
            ? "Choose guest to proceed"
            : "Proceed to checkout"}
        </Button>
      </div>
    </section>
  );
}

export default CheckoutLandingPage;
