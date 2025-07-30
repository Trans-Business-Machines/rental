"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface Property {
    id: number;
    name: string;
}

interface InventoryItem {
    id: number;
    itemName: string;
    category: string;
}

interface AssignmentFiltersProps {
    properties: Property[];
    inventoryItems: InventoryItem[];
}

export function AssignmentFilters({ properties, inventoryItems }: AssignmentFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const updateSearchParams = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === 'all' || !value) {
            params.delete(key);
        } else {
            params.set(key, value);
        }
        router.replace(`?${params.toString()}`, { scroll: false });
    }, [router, searchParams]);

    const clearFilters = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('assignmentProperty');
        params.delete('assignmentItem');
        params.delete('assignmentStatus');
        router.replace(`?${params.toString()}`, { scroll: false });
    }, [router, searchParams]);

    const hasActiveFilters = searchParams.get('assignmentProperty') || 
                             searchParams.get('assignmentItem') || 
                             searchParams.get('assignmentStatus');

    return (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center py-4 border-b">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Property Filter */}
                <div className="min-w-[200px]">
                    <Select 
                        value={searchParams.get('assignmentProperty') || 'all'} 
                        onValueChange={(value) => updateSearchParams('assignmentProperty', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All Properties" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Properties</SelectItem>
                            {properties.map((property) => (
                                <SelectItem key={property.id} value={property.id.toString()}>
                                    {property.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Inventory Item Filter */}
                <div className="min-w-[200px]">
                    <Select 
                        value={searchParams.get('assignmentItem') || 'all'} 
                        onValueChange={(value) => updateSearchParams('assignmentItem', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All Items" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Items</SelectItem>
                            {inventoryItems.map((item) => (
                                <SelectItem key={item.id} value={item.id.toString()}>
                                    {item.itemName} ({item.category})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Status Filter */}
                <div className="min-w-[150px]">
                    <Select 
                        value={searchParams.get('assignmentStatus') || 'all'} 
                        onValueChange={(value) => updateSearchParams('assignmentStatus', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="returned">Returned</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearFilters}
                    className="flex items-center gap-2"
                >
                    <X className="h-4 w-4" />
                    Clear Filters
                </Button>
            )}
        </div>
    );
}