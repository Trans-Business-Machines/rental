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
import { format } from "date-fns";
import Link from "next/link";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Footer } from "@/components/Footer";

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

interface InventoryDetailsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page: string }>;
}

export default async function InventoryDetailsPage({
  params,
  searchParams,
}: InventoryDetailsPageProps) {
  const { id } = await params;
  const { page = 1 } = await searchParams;

  const itemId = Number(id);
  const currentPage = Number(page);

  if (isNaN(itemId) || isNaN(currentPage)) return notFound();

  const item = await getInventoryItemById(itemId);
  if (!item) return notFound();

  const { movements, hasNext, hasPrev, totalPages } =
    await getInventoryMovementsForItem(itemId, currentPage);

  return (
    <section className="space-y-6">
      {/* Header and Navigation */}
      <header className="flex items-center gap-2">
        <div>
          <Button variant="default" asChild>
            <Link href="/inventory">
              <ArrowLeft className="size-4 flex items-center gap-2" />
              <span className="">Back to Inventory</span>
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <Card className="shadow-lg border border-gray-300 bg-gradient-to-tr from-muted/50 to-white">
        <CardContent className="flex items-center gap-6 py-4 md:py-5">
          <article className="flex-1">
            <div className="flex flex-col justify-center gap-2 mb-2">
              <h1 className="text-3xl capitalize font-bold tracking-tight">
                {item.itemName}
              </h1>

              <div className="space-x-2">
                <Badge
                  variant={getStatusColor(item.status)}
                  className="capitalize"
                >
                  {item.status}
                </Badge>
                <Badge variant="outline">Quantity: {item.quantity}</Badge>
              </div>
            </div>

            <div className="text-muted-foreground text-lg my-4">
              {item.description}
            </div>
          </article>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="text-xs text-center text-muted-foreground">
              Category
            </div>
            <div className="font-medium">{item.category}</div>
          </div>
        </Card>
        <Card className="p-4 flex text-center items-center gap-3">
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
            <div className="text-xs text-center text-muted-foreground">
              Current Value
            </div>
            <div className="font-medium">
              {item.currentValue
                ? `KES ${item.currentValue?.toLocaleString()}`
                : "Not specified"}
            </div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <User className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="text-xs text-center text-muted-foreground">
              Supplier
            </div>
            <div className="font-medium">
              {item.supplier || "Not specified"}
            </div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <UtensilsCrossed className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="text-xs text-center text-muted-foreground">
              Status
            </div>
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
              <Table className="min-w-full text-sm border rounded-lg overflow-hidden">
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead className="text-left p-3 font-semibold">
                      Date
                    </TableHead>
                    <TableHead className="text-left p-3 font-semibold">
                      By
                    </TableHead>
                    <TableHead className="text-left p-3 font-semibold">
                      From
                    </TableHead>
                    <TableHead className="text-left p-3 font-semibold">
                      To
                    </TableHead>
                    <TableHead className="text-left p-3 font-semibold">
                      Direction
                    </TableHead>
                    <TableHead className="text-left p-3 font-semibold">
                      Quantity
                    </TableHead>
                    <TableHead className="text-left p-3 font-semibold">
                      Notes
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((move: any, idx: number) => {
                    const DirectionIcon =
                      move.direction === "to_unit" ? ArrowRightLeft : Archive;
                    return (
                      <TableRow
                        key={move.id}
                        className={idx % 2 === 0 ? "bg-white" : "bg-muted/50"}
                      >
                        <TableCell className="p-3 whitespace-nowrap">
                          {format(new Date(move.movedAt), "dd/MM/yyyy hh:mm a")}
                        </TableCell>
                        <TableCell className="p-3 whitespace-nowrap flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {move.movedBy}
                        </TableCell>
                        <TableCell className="p-3 whitespace-nowrap">
                          {move.fromUnit?.name || (
                            <span className="italic text-gray-400">Store</span>
                          )}
                        </TableCell>
                        <TableCell className="p-3 whitespace-nowrap">
                          {move.toUnit?.name || (
                            <span className="italic text-gray-400">Store</span>
                          )}
                        </TableCell>
                        <TableCell className="p-3 whitespace-nowrap flex items-center gap-1">
                          <DirectionIcon className="h-4 w-4 text-primary" />
                          {move.direction.replace("_", " ")}
                        </TableCell>
                        <TableCell className="p-3 whitespace-nowrap">
                          {move.quantity}
                        </TableCell>
                        <TableCell className="p-3 whitespace-nowrap">
                          {move.notes || "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Footer
        currentPage={currentPage}
        hasNext={hasNext}
        hasPrev={hasPrev}
        totalPages={totalPages}
      />
    </section>
  );
}
