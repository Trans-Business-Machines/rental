"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useState } from "react"

interface Unit {
  id: string
  property: string
  type: string
  status: string
  guest: string | null
  checkOut: string | null
  rent: number
}

interface UnitViewDialogProps {
  unit: Unit
  children: React.ReactNode
}

export function UnitViewDialog({ unit, children }: UnitViewDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Unit Details - {unit.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Unit ID</Label>
              <p className="text-sm">{unit.id}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Type</Label>
              <p className="text-sm">{unit.type}</p>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Property</Label>
            <p className="text-sm">{unit.property}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <p className="text-sm capitalize">{unit.status}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Monthly Rent</Label>
              <p className="text-sm">${unit.rent}</p>
            </div>
          </div>
          
          {unit.guest && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Current Guest</Label>
              <p className="text-sm">{unit.guest}</p>
            </div>
          )}
          
          {unit.checkOut && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Checkout Date</Label>
              <p className="text-sm">{unit.checkOut}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}