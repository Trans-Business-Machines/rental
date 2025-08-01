"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Edit,
    Eye,
} from "lucide-react"
import { BookingEditDialog } from "./booking-edit-dialog"
import { BookingViewDialog } from "./booking-view-dialog"

interface Booking {
  id: number
  guest: {
    firstName: string
    lastName: string
  }
  unit: {
    name: string
  }
  checkInDate: Date
  checkOutDate: Date
  totalAmount: number
}

interface RecentBookingsTableProps {
  bookings: Booking[]
}

export function RecentBookingsTable({ bookings }: RecentBookingsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
        <CardDescription>Latest guest bookings and reservations</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guest Name</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Check-out</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">
                  {booking.guest.firstName} {booking.guest.lastName}
                </TableCell>
                <TableCell>{booking.unit.name}</TableCell>
                <TableCell>{new Date(booking.checkInDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(booking.checkOutDate).toLocaleDateString()}</TableCell>
                <TableCell>${booking.totalAmount}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <BookingViewDialog booking={booking}>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </BookingViewDialog>
                    <BookingEditDialog booking={booking}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </BookingEditDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}