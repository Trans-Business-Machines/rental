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
  MapPin,
  IdCard,
  Users,
  Bed,
  Banknote,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import Header from "./Header";

interface BookingDetailsPros {
  params: Promise<{ bookingId: string | number }>;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return "bg-chart-2/10 text-chart-2 border-chart-2/20";
    case "checked-in":
      return "bg-chart-1/10 text-chart-1 border-chart-1/20";
    case "checked-out":
      return "bg-chart-4/10 text-chart-4 border-chart-4/20";
    case "cancelled":
      return "bg-destructive/10 text-destructive border-destructive/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle2 className="size-4" />;
      case "checked-in":
        return <Clock className="size-4" />;
      case "checked-out":
        return <CheckCircle2 className="size-4" />;
      case "cancelled":
        return <XCircle className="size-4" />;
      default:
        return <Clock className="size-4" />;
    }
  };

  return (
    <section className="space-y-6">
      <Header booking={booking} />

      {/* Booking status banner */}
      <Card className="border-l-2 border-l-chart-2 mb-6">
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
                {booking.status}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-2xl font-bold text-foreground">
              ${(booking.unit.rent * nights).toLocaleString()}
            </p>
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

              <div className="grid grid-cols-3 gap-4">
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
                  <p className="text-sm font-medium text-foreground">
                    ${booking.unit.rent}
                  </p>
                  <p className="text-xs text-muted-foreground">Per Night</p>
                </div>
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
                      Check-in
                    </p>
                    <p className="text-sm font-normal text-foreground">
                      {format(checkInDate, "EEE, MMM d, yyyy")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(checkInDate, "hh:mm a")}
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
                      Check-out
                    </p>
                    <p className="text-sm font-normal text-foreground">
                      {format(checkOutDate, "EEE, MMM d, yyyy")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(checkOutDate, "hh:mm a")}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="p-3 rounded-lg bg-muted/60 text-center">
                <p className="text-2xl font-bold text-foreground">{nights}</p>
                <p className="text-sm text-muted-foreground">Total Nights</p>
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
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    ${booking.unit.rent} &#x78; {nights} nights
                  </span>
                  <span className="text-foreground">
                    ${(booking.unit.rent * nights).toLocaleString()}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold text-foreground">
                    Total Amount
                  </span>
                  <span className="text-xl font-bold text-foreground">
                    ${(booking.unit.rent * nights).toLocaleString()}
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
                    {format(
                      new Date(booking.createdAt),
                      "MMM dd, yyyy, hh:mm a"
                    )}
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
                    {format(
                      new Date(booking.updatedAt),
                      "MMM dd, yyyy, hh:mm a"
                    )}
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
