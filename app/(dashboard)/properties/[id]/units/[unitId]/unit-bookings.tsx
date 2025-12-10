import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { BookingDialog } from "@/components/BookingDialog";
import type { UnitBooking, UnitStatus } from "@/lib/types/types";

interface UnitBookings {
  bookings: UnitBooking[];
  context: {
    unitId: number;
    propertyId: number;
    unitStatus: UnitStatus;
  };
}

function getStatusBadge(status: UnitStatus) {
  switch (status) {
    case "occupied":
      return (
        <Badge
          variant="default"
          className="bg-chart-5/20 border border-chart-5 text-chart-5 text-sm"
        >
          Occupied
        </Badge>
      );
    case "available":
      return (
        <Badge
          variant="default"
          className="bg-chart-2/20 border border-chart-2 text-chart-2 text-sm"
        >
          Available
        </Badge>
      );
    case "maintenance":
      return (
        <Badge
          variant="secondary"
          className="bg-chart-1/20 border border-chart-1 text-chart-1 text-sm"
        >
          Maintenance
        </Badge>
      );
    case "reserved":
      return (
        <Badge className="bg-chart-4/20 border border-chart-4 text-chart-4 text-sm">
          Reserved
        </Badge>
      );
    case "booked":
      return (
        <Badge className="bg-chart-3/20 border border-chart-3 text-chart-3 text-sm">
          Booked
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function UnitBookings({ bookings, context }: UnitBookings) {
  return (
    <Card className="border-border shadow-sm bg-card rounded-xl">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">
              Recent Bookings
            </CardTitle>
            {bookings.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                The table below shows the latest {bookings.length}{" "}
                {bookings.length === 1 ? " booking" : " bookings"}
              </p>
            )}
          </div>

          <BookingDialog
            preselectedUnitId={context.unitId}
            preselectedPropertyId={context.propertyId}
          >
            <Button
              size="sm"
              disabled={context.unitStatus !== "available"}
              className="gap-2 cursor-pointer disabled:cursor-not-allowed bg-chart-1 hover:bg-chart-1/90"
            >
              <Plus className="h-4 w-4" />
              New Booking
            </Button>
          </BookingDialog>
        </div>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              No bookings yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Create a booking to get started
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      {booking.guest.firstName} {booking.guest.lastName}
                    </TableCell>
                    <TableCell>{booking.guest.email}</TableCell>
                    <TableCell>{booking.guest.phone}</TableCell>
                    <TableCell>
                      {format(new Date(booking.checkInDate), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>
                      {booking.checkOutDate
                        ? format(new Date(booking.checkOutDate), "dd/MM/yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(context.unitStatus)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
