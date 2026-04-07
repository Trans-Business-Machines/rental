import { getBookingById } from "@/lib/actions/bookings";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Building,
  Home,
  User,
  Mail,
  Phone,
  CreditCard,
  FileText,
  Banknote,
  MapPin,
  IdCard,
  Users,
  Bed,
  CheckCircle2,
  Clock,
  XCircle,
  Percent,
} from "lucide-react";
import { differenceInDays } from "date-fns";
import Header from "./Header";
import type { BookingStatus } from "@/lib/types/types";
import {
  cn,
  getPeriodLabelSingular,
  formatPrice,
  formatDateInTimezone,
  hasDiscount,
  getDurationLabel,
} from "@/lib/utils";

const getStatusColor = (status: BookingStatus): string => {
  switch (status) {
    case "pending":
      return "bg-chart-3/10 text-chart-3 border-chart-3";
    case "reserved":
      return "bg-chart-4/10 text-chart-4 border-chart-4";
    case "checked_in":
      return "bg-chart-2/10 text-chart-2 border-chart-2";
    case "checked_out":
      return "bg-chart-5/10 text-chart-5 border-chart-5";
    case "cancelled":
      return "bg-destructive/10 text-destructive border-destructive";
    default:
      return "bg-muted text-muted-foreground";
  }
};

interface BookingDetailsPros {
  params: Promise<{ bookingId: string | number }>;
}

async function BookingDetails({ params }: BookingDetailsPros) {
  const { bookingId } = await params;

  // convert the booking ID to a number if its a string
  const id = typeof bookingId === "string" ? Number(bookingId) : bookingId;

  // Get booking details from the backend
  const booking = await getBookingById(id);

  // call not-found page when no booking is found
  if (!booking) {
    notFound();
  }

  const checkInDate = new Date(booking.checkInDate);
  const checkOutDate = new Date(booking.checkOutDate);
  const nights = differenceInDays(checkOutDate, checkInDate);

  // Calculate original price before discount (if discount was applied)
  const discountRate = booking.discountRate || 0;
  const hasDiscountApplied = hasDiscount(discountRate);

  // unitPrice is already the discounted price, so we need to calculate original
  const originalUnitPrice = hasDiscountApplied
    ? Math.round(booking.unitPrice / (1 - discountRate))
    : booking.unitPrice;

  const originalTotalAmount = originalUnitPrice * booking.period;
  const savings = originalTotalAmount - booking.totalAmount;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle2 className="size-5" />;
      case "checked_in":
        return <Clock className="size-5" />;
      case "checked_out":
        return <CheckCircle2 className="size-5" />;
      case "cancelled":
        return <XCircle className="size-5" />;
      default:
        return <Clock className="size-5" />;
    }
  };

  return (
    <section className="space-y-4 lg:space-y-5">
      <Header booking={booking} />

      {/* Booking status banner */}
      <Card
        className={cn(
          "border-l-2 mb-6",
          booking.status === "pending" && "border-l-chart-3",
          booking.status === "reserved" && "border-l-chart-4",
          booking.status === "checked_in" && "border-l-chart-2",
          booking.status === "checked_out" && "border-l-chart-5",
          booking.status === "cancelled" && "border-l-destructive",
        )}
      >
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-chart-2/10 flex items-center justify-center">
              {getStatusIcon(booking.status)}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Booking Status</p>
              <Badge
                variant="secondary"
                className={`${getStatusColor(booking.status)} mt-1 capitalize`}
              >
                {booking.status.includes("_")
                  ? booking.status.replace("_", " ")
                  : booking.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left Column - Main Booking details */}
        <article className="lg:col-span-2 space-y-4">
          {/* Guest Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-5 text-chart-1" />
                Guest Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="size-16">
                  <AvatarFallback className="bg-chart-1/10 text-chart-1 text-lg font-semibold">
                    {booking.guest.firstName[0].toUpperCase()}
                    {booking.guest.lastName[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {booking.guest.firstName} {booking.guest.lastName}
                  </h3>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-lg bg-chart-2/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="size-5 text-chart-2" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">
                      Email Address
                    </p>
                    <p className="text-sm text-foreground truncate">
                      {booking.guest.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-lg bg-chart-3/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="size-5 text-chart-3" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Phone Number
                    </p>
                    <p className="text-sm text-foreground">
                      {booking.guest.phone}
                    </p>
                  </div>
                </div>

                {booking.guest.nationality && (
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-lg bg-chart-4/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="size-5 text-chart-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Nationality
                      </p>
                      <p className="text-sm text-foreground">
                        {booking.guest.nationality}
                      </p>
                    </div>
                  </div>
                )}

                {booking.guest.idNumber && (
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-lg bg-chart-5/10 flex items-center justify-center flex-shrink-0">
                      <IdCard className="size-5 text-chart-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        ID Number
                      </p>
                      <p className="text-sm text-foreground">
                        {booking.guest.idNumber}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Property and unit info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="size-5 text-chart-2" />
                Property & Unit Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-lg bg-chart-1/10 flex items-center justify-center flex-shrink-0">
                      <Building className="size-5 text-chart-1" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Property
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {booking.property.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {booking.property.address}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-lg bg-chart-2/10 flex items-center justify-center flex-shrink-0">
                      <Home className="size-5 text-chart-2" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Unit
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {booking.unit.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">
                        {booking.unit.type}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div
                className={cn(
                  "grid gap-4",
                  hasDiscountApplied
                    ? "grid-cols-2 md:grid-cols-4"
                    : "grid-cols-3",
                )}
              >
                <div className="text-center p-3 rounded-lg bg-muted/60">
                  <Bed className="size-5 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">
                    {booking.unit.bedrooms}
                  </p>
                  <p className="text-xs text-muted-foreground">Bedrooms</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/60">
                  <Users className="size-5 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">
                    {booking.numberOfGuests}
                  </p>
                  <p className="text-xs text-muted-foreground">Guests</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/60">
                  <Banknote className="size-5 text-muted-foreground mx-auto mb-2" />
                  <div>
                    {hasDiscountApplied ? (
                      <>
                        <p className="text-xs text-muted-foreground line-through">
                          {formatPrice(originalUnitPrice)}
                        </p>
                        <p className="text-sm font-medium text-primary">
                          {formatPrice(booking.unitPrice)}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm font-medium text-foreground">
                        {formatPrice(booking.unitPrice)}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Per {getPeriodLabelSingular(booking.priceDuration)}
                  </p>
                </div>
                {hasDiscountApplied && (
                  <div className="text-center p-3 rounded-lg bg-green-50">
                    <Percent className="size-5 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-green-600">
                      {Math.round(discountRate * 100)}%
                    </p>
                    <p className="text-xs text-green-600">Discount</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Special Requests */}
          {booking.specialRequests && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="size-5 text-chart-3" />
                  Special Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground leading-relaxed">
                  {booking.specialRequests}
                </p>
              </CardContent>
            </Card>
          )}
        </article>

        {/* Right column - Booking summary */}
        <article className="space-y-4">
          {/* Stay Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-chart-3" />
                Stay Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-lg bg-chart-2/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="size-5 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Check in date
                    </p>
                    <p className="text-sm font-normal text-foreground">
                      {formatDateInTimezone(checkInDate)}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-lg bg-chart-4/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="size-5 text-chart-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Check out date
                    </p>
                    <p className="text-sm font-normal text-foreground">
                      {formatDateInTimezone(checkOutDate)}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/60 text-center">
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-lg font-bold text-foreground">
                    {getDurationLabel(booking.priceDuration)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/60 text-center">
                  <p className="text-sm text-muted-foreground">Total Nights</p>
                  <p className="text-lg font-bold text-foreground">{nights}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="size-5 text-chart-4" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Booking Source</span>
                  <span className="font-medium text-foreground capitalize">
                    {booking.source}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Purpose</span>
                  <span className="font-medium text-foreground capitalize">
                    {booking.purpose}
                  </span>
                </div>
                {booking.paymentMethod && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Payment Method
                    </span>
                    <span className="font-medium text-foreground capitalize">
                      {booking.paymentMethod.replace("_", " ")}
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                {/* Unit Price */}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {getDurationLabel(booking.priceDuration)} Rate
                  </span>
                  <span className="text-foreground">
                    {hasDiscountApplied ? (
                      <span className="flex items-center gap-2">
                        <span className="line-through text-muted-foreground">
                          {formatPrice(originalUnitPrice)}
                        </span>
                        <span className="text-primary font-medium">
                          {formatPrice(booking.unitPrice)}
                        </span>
                      </span>
                    ) : (
                      formatPrice(booking.unitPrice)
                    )}
                  </span>
                </div>

                {/* Discount Row */}
                {hasDiscountApplied && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">
                      Discount ({Math.round(discountRate * 100)}%)
                    </span>
                    <span className="text-green-600 font-medium">
                      -{formatPrice(originalUnitPrice - booking.unitPrice)}
                    </span>
                  </div>
                )}

                {/* Period Calculation */}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {formatPrice(booking.unitPrice)} × {booking.period}{" "}
                    {getPeriodLabelSingular(booking.priceDuration)}
                    {booking.period > 1 ? "s" : ""}
                  </span>
                  <span className="text-foreground">
                    {formatPrice(booking.totalAmount)}
                  </span>
                </div>

                <Separator />

                {/* Total Savings */}
                {hasDiscountApplied && savings > 0 && (
                  <div className="flex justify-between text-sm p-2 rounded-lg bg-green-50">
                    <span className="text-green-600 font-medium">
                      Total Savings
                    </span>
                    <span className="text-green-600 font-bold">
                      {formatPrice(savings)}
                    </span>
                  </div>
                )}

                {/* Billing */}
                <div className="flex justify-between pt-2">
                  <span className="font-semibold text-foreground">
                    Total Amount
                  </span>
                  <span className="text-xl font-bold text-foreground">
                    {formatPrice(booking.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="font-semibold text-foreground">
                    Payment code
                  </span>
                  <span className="text-sm font-semibold">
                    {booking.paymentCode}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-5 text-chart-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="size-2 rounded-full bg-chart-2 mt-2" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Booking Created
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateInTimezone(new Date(booking.createdAt))}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="size-2 rounded-full bg-muted-foreground/50 mt-2" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Last Updated
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateInTimezone(new Date(booking.updatedAt))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </article>
      </div>
    </section>
  );
}

export default BookingDetails;
