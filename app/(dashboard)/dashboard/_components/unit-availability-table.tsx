"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    CheckCircle,
    Clock,
    Download,
    Edit,
    Eye,
    Filter,
    Search,
    Settings,
    XCircle,
} from "lucide-react"
import { useState } from "react"
import { UnitEditDialog } from "./unit-edit-dialog"
import { UnitViewDialog } from "./unit-view-dialog"

interface Unit {
  id: string
  property: string
  type: string
  status: string
  guest: string | null
  checkOut: string | null
  rent: number
}

interface UnitAvailabilityTableProps {
  units: Unit[]
}

function getStatusBadge(status: string) {
  switch (status) {
    case "occupied":
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Occupied
        </Badge>
      )
    case "available":
      return (
        <Badge variant="default" className="gap-1 bg-green-500 hover:bg-green-600">
          <CheckCircle className="h-3 w-3" />
          Available
        </Badge>
      )
    case "maintenance":
      return (
        <Badge variant="secondary" className="gap-1">
          <Settings className="h-3 w-3" />
          Maintenance
        </Badge>
      )
    case "reserved":
      return (
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          Reserved
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function UnitAvailabilityTable({ units }: UnitAvailabilityTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredUnits = units.filter(
    (unit) =>
      unit.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.guest?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Unit Availability</CardTitle>
            <CardDescription>
              Overview of all units with their current status and checkout dates
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search units..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-[300px]"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unit ID</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Current Guest</TableHead>
              <TableHead>Checkout Date</TableHead>
              <TableHead>Monthly Rent</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUnits.map((unit) => (
              <TableRow key={unit.id}>
                <TableCell className="font-medium">{unit.id}</TableCell>
                <TableCell>{unit.property}</TableCell>
                <TableCell>{unit.type}</TableCell>
                <TableCell>{getStatusBadge(unit.status)}</TableCell>
                <TableCell>{unit.guest || "-"}</TableCell>
                <TableCell>
                  {unit.checkOut ? (
                    <span className="text-sm">{unit.checkOut}</span>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>${unit.rent}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <UnitViewDialog unit={unit}>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </UnitViewDialog>
                    <UnitEditDialog unit={unit}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </UnitEditDialog>
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