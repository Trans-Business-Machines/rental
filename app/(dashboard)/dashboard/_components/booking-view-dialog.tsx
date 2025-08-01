"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useState } from "react"

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

interface BookingViewDialogProps {
  booking: Booking
  children: React.ReactNode
}

export function BookingViewDialog({ booking, children }: BookingViewDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Booking Details - #{booking.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Guest Name</Label>
            <p className="text-sm">{booking.guest.firstName} {booking.guest.lastName}</p>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Unit</Label>
            <p className="text-sm">{booking.unit.name}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Check-in</Label>
              <p className="text-sm">{new Date(booking.checkInDate).toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Check-out</Label>
              <p className="text-sm">{new Date(booking.checkOutDate).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Total Amount</Label>
            <p className="text-sm font-medium">${booking.totalAmount}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}