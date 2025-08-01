"use client"

import { InventoryDialog } from "@/components/InventoryDialog"
import { InventoryEditDialog } from "@/components/InventoryEditDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Edit,
    Plus,
} from "lucide-react"

interface InventoryItem {
  id: number
  category: string
  itemName: string
  description: string
  quantity: number
  purchasePrice?: number
  currentValue?: number
  supplier?: string | null
  warrantyExpiry?: Date | null
  status: string
  assignableOnBooking?: boolean
  assignments: any[]
}

interface InventoryTableProps {
  items: InventoryItem[]
}

function getInventoryStatus(item: InventoryItem) {
  const assignedQuantity = item.assignments.length
  const availableQuantity = item.quantity - assignedQuantity
  
  if (availableQuantity <= 0) {
    return { status: "critical", label: "Critical" }
  } else if (availableQuantity < item.quantity * 0.3) {
    return { status: "low", label: "Low Stock" }
  } else {
    return { status: "good", label: "Good" }
  }
}

function getInventoryBadge(status: string) {
  switch (status) {
    case "good":
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          Good
        </Badge>
      )
    case "low":
      return (
        <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white">
          Low Stock
        </Badge>
      )
    case "critical":
      return <Badge variant="destructive">Critical</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function InventoryTable({ items }: InventoryTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Management</CardTitle>
        <CardDescription>Track supplies and maintenance items</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Total Stock</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const assignedQuantity = item.assignments.length
              const availableQuantity = item.quantity - assignedQuantity
              const inventoryStatus = getInventoryStatus(item)
              
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.itemName}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{availableQuantity}</TableCell>
                  <TableCell>{assignedQuantity}</TableCell>
                  <TableCell>{getInventoryBadge(inventoryStatus.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <InventoryDialog>
                        <Button variant="ghost" size="icon">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </InventoryDialog>
                      <InventoryEditDialog item={item}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </InventoryEditDialog>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}