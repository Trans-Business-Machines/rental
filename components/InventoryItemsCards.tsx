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

function InventoryItemsCards({ items }: InventoryItemsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const Icon = getItemIcon(item.category.toLowerCase());

        return (
          <Card
            key={item.id}
            className="group gap-4 pb-0 rounded-md border-border hover:shadow-lg transition-all duration-200 "
          >
            <CardHeader className="flex items-center justify-between">
              <header className="flex gap-2">
                {/* Icon container */}
                <div className="p-5 bg-primary/10 flex-shrink-0 rounded-sm">
                  <Icon className="size-5 text-primary" />
                </div>

                {/* Item Name and category */}
                <div className="flex justify-center flex-col gap-0">
                  <p className="font-semibold capitalize text-gray-900 text-base m-0 p-0">
                    {item.itemName}
                  </p>
                  <p className="text-sm text-gray-500 m-0 p-0">
                    {item.category}
                  </p>
                </div>
              </header>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "self-start  opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer",
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
            <CardContent className="space-y-4 px-0">
              <div className="pl-6">
                <Badge
                  className={cn(
                    "capitalize text-sm font-medium border-0",
                    item.status === "active" && "bg-green-100 text-green-700 ",
                    item.status === "discontinued" && "bg-red-100 text-red-700"
                  )}
                >
                  {item.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2  gap-3 border-t border-border">
                <div className="text-center py-4 border-r border-border">
                  <p className="text-xl md:text-2xl bg-chart-2/10 rounded-lg py-2 px-6 shadow inline-block  font-bold text-chart-2">
                    {item.availableQuantity || 0}
                  </p>
                  <p className="text-sm text-gray-600 text-center mt-1">
                    Available
                  </p>
                </div>
                <div className="text-center py-4">
                  <p className="text-xl md:text-2xl bg-chart-1/10 rounded-lg py-2 px-6 shadow inline-block font-bold text-chart-1">
                    {item.assignedQuantity || 0}
                  </p>
                  <p className="text-sm text-gray-600 text-center mt-1">
                    Assigned
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export { InventoryItemsCards };
