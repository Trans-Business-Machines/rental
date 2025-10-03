import { Card, CardHeader, CardContent } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  MoreVertical,
  Move,
  Eye,
  SquarePen,
  Sofa,
  Zap,
  UtensilsCrossed,
  Bath,
  Lamp,
  ChefHat,
  BedDouble,
  Package,
} from "lucide-react";
import type { InvetoryItem } from "@/lib/types/types";
import { cn } from "@/lib/utils";

interface InventoryItemsProps {
  items: InvetoryItem[];
}

const getItemIcon = (category: string) => {
  switch (category) {
    case "furniture":
      return Sofa;
    case "electronics":
      return Zap;
    case "cutlery":
      return UtensilsCrossed;
    case "bathroom":
      return Bath;
    case "lighting":
      return Lamp;
    case "kitchen accessories":
      return ChefHat;
    case "bedroom accessories":
      return BedDouble;
    default:
      return Package;
  }
};

function InventoryItems({ items }: InventoryItemsProps) {
  return items.length > 0 ? (
    <div className="grid gap-4  md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const Icon = getItemIcon(item.category.toLowerCase());

        return (
          <Card
            key={item.id}
            className="group bg-card shadow-sm hover:shadow-lg transition-all duration-200 border-border"
          >
            <CardHeader className="pb-4 flex items-center justify-between">
              <div className="flex gap-3 items-center">
                <div className="p-5 bg-primary/10 flex-shrink-0 rounded-lg">
                  <Icon className="size-5 text-primary" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="capitalize font-semibold text-primary text-base">
                    {item.itemName}
                  </p>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="capitalize text-xs font-normal"
                    >
                      {item.category}
                    </Badge>
                    <Badge
                      className={cn(
                        "capitalize text-xs font-normal",
                        item.status === "active" && "bg-primary",
                        item.status === "discontinued" && "bg-chart-5"
                      )}
                    >
                      {item.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "size-5 self-start opacity-40 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer",
                      "data-[state=open]:opacity-100"
                    )}
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem className="hover:bg-primary/30 focus:bg-primary/30">
                    <Eye className="size-4 text-muted-foreground" />
                    <span className="capitalize">view details</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-primary/30 focus:bg-primary/30">
                    <SquarePen className="size-4 text-muted-foreground" />
                    <span className="capitalize">Edit Item</span>
                  </DropdownMenuItem>
                  {item.assignableOnBooking && (
                    <DropdownMenuItem className="hover:bg-primary/30 focus:bg-primary/30">
                      <Move className="size-4 text-muted-foreground" />
                      <span className="capitalize">assign/move</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-lg font-semibold text-green-700">
                    {item.availableQuantity || 0}
                  </p>
                  <p className="text-xs text-green-600">Available</p>
                </div>
                <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-lg font-semibold text-blue-700">
                    {item.assignedQuantity || 0}
                  </p>
                  <p className="text-xs text-blue-600">Assigned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  ) : (
    <div className="text-center py-8">
      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium">No inventory items found</h3>
      <p className="text-muted-foreground">
        Get started by adding your first inventory item
      </p>
    </div>
  );
}

export { InventoryItems };
