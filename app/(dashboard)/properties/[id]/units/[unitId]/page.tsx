import { InventoryDialog } from "@/components/InventoryDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBookings } from "@/lib/actions/bookings";
import { getInventoryByUnit } from "@/lib/actions/inventory";
import { getUnitById } from "@/lib/actions/units";
import { ArrowLeft, DollarSign, Edit, Home } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface UnitPageProps {
  params: Promise<{ id: string; unitId: string }>;
}

export default async function UnitPage({ params }: UnitPageProps) {
  const { id, unitId } = await params;
  const unitData = await getUnitById(Number(unitId));

  if (!unitData) return notFound();
  const inventory = await getInventoryByUnit(Number(unitId));
  const allBookings = await getBookings();
  const bookings = allBookings.filter(b => b.unitId === Number(unitId));
  const unit = unitData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/properties/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Property
            </Button>
          </Link>
          <div>
            <h1>{unit.name}</h1>
            <p className="text-muted-foreground">Unit Details</p>
          </div>
        </div>
        <Button disabled>
          <Edit className="h-4 w-4 mr-2" />
          Edit Unit
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{unit.name}</CardTitle>
          <Badge>{unit.status}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <Home className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="capitalize">{unit.type}</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>${unit.rent}</span>
            </div>
          </div>
          <div className="flex space-x-4 mt-4">
            <InventoryDialog initialPropertyId={unit.propertyId} initialUnitId={unit.id}>
              <Button variant="outline">Add Inventory</Button>
            </InventoryDialog>
          </div>
          <div className="mt-6">
            <h2 className="font-semibold mb-2">Inventory</h2>
            {inventory.length === 0 ? (
              <p className="text-muted-foreground">No inventory items for this unit.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Condition</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{item.itemName}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.condition}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
      <div className="mt-8">
        <Tabs defaultValue="bookings">
          <TabsList>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            {/* Add more tabs here later */}
          </TabsList>
          <TabsContent value="bookings">
            {bookings.length === 0 ? (
              <p className="text-muted-foreground">No bookings for this unit.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map(booking => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.guest?.firstName} {booking.guest?.lastName}</TableCell>
                      <TableCell>{typeof booking.checkInDate === 'string' ? new Date(booking.checkInDate).toLocaleDateString() : booking.checkInDate.toLocaleDateString()}</TableCell>
                      <TableCell>{typeof booking.checkOutDate === 'string' ? new Date(booking.checkOutDate).toLocaleDateString() : booking.checkOutDate.toLocaleDateString()}</TableCell>
                      <TableCell>{booking.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 