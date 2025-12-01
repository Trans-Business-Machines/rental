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
import type { UnitBooking } from "@/lib/types/types";

interface UnitBookings {
  bookings: UnitBooking[];
  context: {
    unitId: number;
    propertyId: number;
  };
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case "confirmed":
      return "bg-chart-4/10 text-chart-4 border-chart-2/20";
    case "checked-in":
      return "bg-chart-1/10 text-chart-1 border-chart-3/20";
    case "completed":
      return "bg-chart-2/10 text-chart-2 border-chart-4/20";
    case "cancelled":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "checked-out":
      return "bg-chart-3/10 text-chart-3 border-destructive/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

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
              className="gap-2 cursor-pointer bg-chart-1 hover:bg-chart-1/90"
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
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`${getStatusColor(booking.status)} capitalize`}
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>
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
