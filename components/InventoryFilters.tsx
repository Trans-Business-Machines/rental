'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface InventoryFiltersProps {
    search?: string;
    category?: string;
    status?: string;
    property?: string;
    unit?: string;
    properties: Array<{ 
        id: number; 
        name: string; 
        units: Array<{ id: number; name: string }> 
    }>;
}

export function InventoryFilters({ search, category, status, property, unit, properties }: InventoryFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchValue, setSearchValue] = useState(search || '');

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value === 'all') {
                params.delete(name);
            } else {
                params.set(name, value);
            }
            return params.toString();
        },
        [searchParams]
    );

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const queryString = createQueryString('search', searchValue);
            router.push(`?${queryString}`);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchValue, createQueryString, router]);

    const handleSearchChange = (value: string) => {
        setSearchValue(value);
    };

    const handleCategoryChange = (value: string) => {
        const queryString = createQueryString('category', value);
        router.push(`?${queryString}`);
    };

    const handleStatusChange = (value: string) => {
        const queryString = createQueryString('status', value);
        router.push(`?${queryString}`);
    };

    const handlePropertyChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === 'all') {
            params.delete('property');
            params.delete('unit'); // Clear unit when property changes
        } else {
            params.set('property', value);
            params.delete('unit'); // Clear unit when property changes
        }
        router.push(`?${params.toString()}`);
    };

    const handleUnitChange = (value: string) => {
        const queryString = createQueryString('unit', value);
        router.push(`?${queryString}`);
    };

    // Get available units for selected property
    const selectedProperty = properties.find(p => p.name === property);
    const availableUnits = selectedProperty?.units || [];

    return (
        <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                    placeholder="Search inventory..."
                    value={searchValue}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                />
            </div>
            <Select value={category || 'all'} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-32">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Furniture">Furniture</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Cutlery">Cutlery</SelectItem>
                    <SelectItem value="Bathroom">Bathroom</SelectItem>
                    <SelectItem value="Lighting">Lighting</SelectItem>
                    <SelectItem value="Kitchen Accessories">Kitchen Accessories</SelectItem>
                    <SelectItem value="Bedroom Accessories">Bedroom Accessories</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
            </Select>
            <Select value={status || 'all'} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-32">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                    <SelectItem value="missing">Missing</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
            </Select>
            <Select value={property || 'all'} onValueChange={handlePropertyChange}>
                <SelectTrigger className="w-40">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    {properties.map(property => (
                        <SelectItem key={property.id} value={property.name}>
                            {property.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select 
                value={unit || 'all'} 
                onValueChange={handleUnitChange}
                disabled={!property || property === 'all'}
            >
                <SelectTrigger className="w-40">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Units</SelectItem>
                    {availableUnits.map(unit => (
                        <SelectItem key={unit.id} value={unit.name}>
                            {unit.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
} 