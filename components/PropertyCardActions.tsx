"use client";

import { Button } from "@/components/ui/button";
import { Edit, Eye } from "lucide-react";
import Link from "next/link";

interface Property {
  id: number;
  name: string;
  address: string;
  type: string;
  totalUnits: number | null;
  occupied: number;
  rent: number;
  status: string;
  description: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
  tenants: any[];
  amenities: any[];
}

interface PropertyCardActionsProps {
  property: Property;
}

export function PropertyCardActions({ property }: PropertyCardActionsProps) {
  return (
    <div className="flex space-x-2">
      <Button
        variant="default"
        className="flex-1 gap-2 bg-chart-1 hover:bg-chart-1/90"
        asChild
        size="sm"
      >
        <Link href={`/properties/${property.id}`}>
          <Eye className="h-4 w-4 mr-2" />
          View
        </Link>
      </Button>
      <Button
        variant="default"
        className="flex-1 gap-2 bg-chart-3 hover:bg-chart-3/90"
        asChild
        size="sm"
      >
        <Link href={`/properties/${property.id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Link>
      </Button>
    </div>
  );
}
