import { BookingDialog } from "@/components/BookingDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getBookings } from "@/lib/actions/bookings";
import { getAllPropertiesWithUnits as getProperties } from "@/lib/actions/properties";
import {
  Bed,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  Search,
  Users,
} from "lucide-react";
import { StatCards, StatCardsProps } from "@/components/StatCards";

interface BookingsPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    property?: string;
  }>;
}

export default async function BookingsPage({
  searchParams,
}: BookingsPageProps) {
  const { search, status, property } = await searchParams;

  // Fetch real data from database
  const bookings = await getBookings();
  const properties = await getProperties();

  // Filter bookings based on search params
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      !search ||
      booking.guest.firstName.toLowerCase().includes(search.toLowerCase()) ||
      booking.guest.lastName.toLowerCase().includes(search.toLowerCase()) ||
      booking.guest.email.toLowerCase().includes(search.toLowerCase()) ||
      booking.property.name.toLowerCase().includes(search.toLowerCase()) ||
      booking.unit.name.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      !status || status === "all" || booking.status === status;
    const matchesProperty =
      !property || property === "all" || booking.property.name === property;

    return matchesSearch && matchesStatus && matchesProperty;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string | Date) => {
    return new Date(dateString).toLocaleString();
  };

  // Statistics
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(
    (b) => b.status === "confirmed"
  ).length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const completedBookings = bookings.filter(
    (b) => b.status === "completed"
  ).length;

  const stats: StatCardsProps[] = [
    {
      title: "Total Bookings",
      value: totalBookings,
      icon: Calendar,
      color: "blue",
    },
    {
      title: "Confirmed",
      value: confirmedBookings,
      icon: CheckCircle,
      color: "green",
    },
    {
      title: "Pending",
      value: pendingBookings,
      icon: Clock,
      color: "orange",
    },
    {
      title: "Completed",
      value: completedBookings,
      icon: Users,
      color: "",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-normal text-foreground">
            Bookings
          </h1>
          <p className="text-muted-foreground">
            Manage guest bookings and reservations.
          </p>
        </div>

        <BookingDialog />
      </div>

      {/* Statistics Cards */}
      <StatCards stats={stats} />

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search bookings..."
            defaultValue={search || ""}
            className="pl-10"
          />
        </div>
        <Select defaultValue={status || "all"}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="checked_in">Checked In</SelectItem>
            <SelectItem value="checked_out">Checked Out</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue={property || "all"}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            {properties.map((property) => (
              <SelectItem key={property.id} value={property.name}>
                {property.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bookings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBookings.map((booking) => (
          <Card key={booking.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="text-lg">
                      {booking.guest.firstName[0]}
                      {booking.guest.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {booking.guest.firstName} {booking.guest.lastName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {booking.guest.email}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Property Information */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Bed className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{booking.property.name}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {booking.unit.name}
                  </span>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-2 bg-muted/50 rounded-lg">
                  <p className="font-medium">Check-in</p>
                  <p className="text-muted-foreground">
                    {formatDate(booking.checkInDate)}
                  </p>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded-lg">
                  <p className="font-medium">Check-out</p>
                  <p className="text-muted-foreground">
                    {formatDate(booking.checkOutDate)}
                  </p>
                </div>
              </div>

              {/* Financial Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Amount
                  </span>
                  <span className="font-medium">
                    {formatCurrency(booking.totalAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Guests</span>
                  <span className="text-sm">
                    {booking.numberOfGuests}{" "}
                    {booking.numberOfGuests === 1 ? "guest" : "guests"}
                  </span>
                </div>
              </div>

              {/* Source and Created Date */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Source</span>
                  <span className="text-sm capitalize">{booking.source}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm">
                    {formatDateTime(booking.createdAt)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                {booking.status === "confirmed" && (
                  <Button variant="outline" size="sm">
                    <Bed className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No bookings found</h3>
          <p className="text-muted-foreground">
            {search
              ? "Try adjusting your search criteria"
              : "Get started by creating your first booking"}
          </p>
        </div>
      )}
    </div>
  );
}
