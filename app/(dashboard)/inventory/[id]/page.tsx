import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getInventoryItemById,
  getInventoryMovementsForItem,
} from "@/lib/actions/inventory";
import {
  Archive,
  ArrowRightLeft,
  Calendar,
  DollarSign,
  Home,
  ArrowLeft,
  MapPin,
  User,
  UtensilsCrossed,
} from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";

function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "default";
    case "damaged":
      return "destructive";
    case "missing":
      return "destructive";
    case "maintenance":
      return "secondary";
    default:
      return "secondary";
  }
}

export default async function InventoryDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const itemId = Number(id);
  if (isNaN(itemId)) return notFound();

  const item = await getInventoryItemById(itemId);
  if (!item) return notFound();

  const movements = await getInventoryMovementsForItem(itemId);

  return (
    <section className="space-y-6">
      {/* Header and Navigation */}
      <div className="flex items-center gap-2">
        <div>
          <Button variant="secondary" asChild>
            <Link href="/inventory">
              <ArrowLeft className="size-4 flex items-center gap-2" />
              <span className="">Back to Inventory</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-muted/50 to-white">
        <CardContent className="flex items-center gap-6 py-4 md:py-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {item.itemName}
              </h1>
              <Badge
                variant={getStatusColor(item.status)}
                className="uppercase"
              >
                {item.status}
              </Badge>
              <Badge variant="outline">Qty: {item.quantity}</Badge>
            </div>
            <div className="text-muted-foreground text-lg my-4">
              {item.description}
            </div>
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="outline">
                Edit
              </Button>
              <Button size="sm" variant="secondary">
                Move/Assign
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Category</div>
            <div className="font-medium">{item.category}</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <Home className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Quantity</div>
            <div className="font-medium">{item.quantity} available</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Assigned</div>
            <div className="font-medium">
              {(item as any).assignedQuantity || 0} items
            </div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <DollarSign className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Current Value</div>
            <div className="font-medium">
              KES {item.currentValue?.toLocaleString()}
            </div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <User className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Supplier</div>
            <div className="font-medium">
              {item.supplier || "Not specified"}
            </div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <UtensilsCrossed className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Status</div>
            <div className="font-medium capitalize">{item.status}</div>
          </div>
        </Card>
      </div>

      {/* Movement History */}
      <Card className="shadow border-0">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-primary" /> Movement History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {movements.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">
              No movement history for this item.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border rounded-lg overflow-hidden">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-semibold">Date</th>
                    <th className="text-left p-3 font-semibold">By</th>
                    <th className="text-left p-3 font-semibold">From</th>
                    <th className="text-left p-3 font-semibold">To</th>
                    <th className="text-left p-3 font-semibold">Direction</th>
                    <th className="text-left p-3 font-semibold">Quantity</th>
                    <th className="text-left p-3 font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((move: any, idx: number) => {
                    const DirectionIcon =
                      move.direction === "to_unit" ? ArrowRightLeft : Archive;
                    return (
                      <tr
                        key={move.id}
                        className={idx % 2 === 0 ? "bg-white" : "bg-muted/50"}
                      >
                        <td className="p-3 whitespace-nowrap">
                          {new Date(move.movedAt).toLocaleString()}
                        </td>
                        <td className="p-3 whitespace-nowrap flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {move.movedBy}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          {move.fromUnit?.name || (
                            <span className="italic text-gray-400">Store</span>
                          )}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          {move.toUnit?.name || (
                            <span className="italic text-gray-400">Store</span>
                          )}
                        </td>
                        <td className="p-3 whitespace-nowrap flex items-center gap-1">
                          <DirectionIcon className="h-4 w-4 text-primary" />
                          {move.direction.replace("_", " ")}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          {move.quantity}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          {move.notes || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
