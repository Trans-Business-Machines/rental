"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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

interface BookingEditDialogProps {
  booking: Booking
  children: React.ReactNode
}

export function BookingEditDialog({ booking, children }: BookingEditDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Booking - #{booking.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center p-8">
            <p className="text-muted-foreground">
              Booking editing functionality is not yet implemented.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Use the bookings page for detailed editing.
            </p>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}