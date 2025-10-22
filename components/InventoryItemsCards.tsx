import { Card, CardHeader, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { InventoryActions } from "./InventoryActions";
import type { InvetoryItem } from "@/lib/types/types";

interface InventoryItemsProps {
  items: InvetoryItem[];
}

function InventoryItemsCards({ items }: InventoryItemsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        return (
          <Card
            key={item.id}
            className="group gap-4 rounded-md border-border hover:shadow-lg transition-all duration-200 "
          >
            <CardHeader className="flex items-center justify-between">
              <header className="flex gap-2">
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
              <InventoryActions item={item} />
            </CardHeader>
            <CardContent className="space-y-4 px-0">
              <div className="pl-4">
                <Badge
                  className={cn(
                    "capitalize rounded-full text-sm font-medium border-0 px-4 py-2",
                    item.status === "active" && "bg-green-100 text-green-700 ",
                    item.status === "discontinued" && "bg-red-100 text-red-700"
                  )}
                >
                  {item.status}
                </Badge>
              </div>
              <div className="px-4 grid grid-cols-2 gap-3 ">
                <Button
                  size="sm"
                  className="bg-chart-1  hover:bg-chart-1 text-white"
                >
                  {item.availableQuantity || 0} <span>Available</span>
                </Button>

                <Button
                  size="sm"
                  className="bg-chart-3 hover:bg-chart-3 text-white"
                >
                  {item.assignedQuantity || 0} <span>Assigned</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export { InventoryItemsCards };
