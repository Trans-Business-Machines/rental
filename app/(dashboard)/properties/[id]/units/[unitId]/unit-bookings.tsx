/* 'use client'

import { BookingDialog } from "@/components/BookingDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, Users } from "lucide-react";
import Link from "next/link";

interface Booking {
	id: number;
	guest: {
		id: number;
		firstName: string;
		lastName: string;
		email: string;
	};
	checkInDate: Date;
	checkOutDate: Date;
	numberOfGuests: number;
	totalAmount: number;
	status: string;
	source: string;
	purpose: string;
	createdAt: Date;
}

interface UnitBookingsProps {
	unit: {
		id: number;
		name: string;
		propertyId: number;
	};
	bookings: Booking[];
}

export function UnitBookings({ unit, bookings }: UnitBookingsProps) {
	const getStatusColor = (status: string) => {
		switch (status) {
			case "confirmed":
				return "default";
			case "checked-in":
				return "secondary";
			case "checked-out":
				return "outline";
			case "cancelled":
				return "destructive";
			case "pending":
				return "outline";
			default:
				return "default";
		}
	};

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString();
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="text-lg">Recent Bookings</CardTitle>
					<div className="flex items-center space-x-2">
						<Badge variant="outline">{bookings.length} bookings</Badge>
						<BookingDialog 
							preselectedPropertyId={unit.propertyId}
							preselectedUnitId={unit.id}
						/>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{bookings.length === 0 ? (
					<div className="text-center py-8">
						<Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
						<p className="text-sm text-muted-foreground">No bookings yet</p>
						<p className="text-xs text-muted-foreground mt-1">
							Create a booking to get started
						</p>
					</div>
				) : (
					<div className="space-y-3">
						{bookings.slice(0, 5).map((booking) => (
							<Card key={booking.id} className="p-4">
								<div className="flex items-start justify-between">
									<div className="space-y-1 flex-1">
										<div className="flex items-center space-x-2">
											<h3 className="font-medium">
												{booking.guest.firstName} {booking.guest.lastName}
											</h3>
											<Badge variant={getStatusColor(booking.status)}>
												{booking.status}
											</Badge>
										</div>
										<p className="text-sm text-muted-foreground">
											{booking.guest.email}
										</p>
										<div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
											<div className="flex items-center">
												<Calendar className="h-3 w-3 mr-1" />
												<span>
													{formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
												</span>
											</div>
											<div className="flex items-center">
												<Users className="h-3 w-3 mr-1" />
												<span>{booking.numberOfGuests} guest{booking.numberOfGuests !== 1 ? 's' : ''}</span>
											</div>
											<div className="flex items-center">
												<DollarSign className="h-3 w-3 mr-1" />
												<span>${booking.totalAmount}</span>
											</div>
											<div>
												<span className="capitalize">{booking.source}</span>
											</div>
										</div>
									</div>
								</div>
							</Card>
						))}
						{bookings.length > 5 && (
							<div className="text-center pt-2">
								<Link href="/bookings">
									<Button variant="outline" size="sm">
										View All Bookings
									</Button>
								</Link>
							</div>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}  */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";

export default function UnitBookings() {
  // Mock data - replace with actual data fetching
  const bookings = [];

  return (
    <Card className="border-border shadow-sm bg-card rounded-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">
              Recent Bookings
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {bookings.length} bookings
            </p>
          </div>
          <Button
            size="sm"
            className="gap-2 cursor-pointer bg-chart-1 hover:bg-chart-1/90"
          >
            <Plus className="h-4 w-4" />
            New Booking
          </Button>
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
          <div className="space-y-2">{/* Bookings list will go here */}</div>
        )}
      </CardContent>
    </Card>
  );
}
