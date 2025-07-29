"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createInventoryItem, updateInventoryItem } from "@/lib/actions/inventory";
import { getAllPropertiesWithUnits } from "@/lib/actions/properties";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface InventoryItem {
    id: number;
    propertyId: number | null;
    unitId: number | null;
    category: string;
    itemName: string;
    description: string;
    quantity: number;
    condition: string;
    purchaseDate: Date;
    purchasePrice?: number;
    currentValue?: number;
    location: string;
    serialNumber?: string | null;
    supplier?: string | null;
    warrantyExpiry?: Date | null;
    status: string;
    notes?: string | null;
    property: { id: number; name: string } | null;
    unit: { id: number; name: string } | null;
}

interface InventoryFormProps {
    item?: InventoryItem;
    onSuccess?: () => void;
    onCancel?: () => void;
    preselectedPropertyId?: number;
    preselectedUnitId?: number;
}

export function InventoryForm({ item, onSuccess, onCancel, preselectedPropertyId, preselectedUnitId }: InventoryFormProps) {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        propertyId: item?.propertyId || preselectedPropertyId || null,
        unitId: typeof item?.unitId === 'undefined' ? (typeof preselectedUnitId === 'undefined' ? null : preselectedUnitId) : item.unitId,
        category: item?.category || "",
        itemName: item?.itemName || "",
        description: item?.description || "",
        quantity: item?.quantity || 1,
        notes: item?.notes || "",
    });

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const props = await getAllPropertiesWithUnits();
                setProperties(props);
            } catch (error) {
                console.error("Error fetching properties:", error);
            }
        };
        fetchProperties();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Set default values for optional fields
            const submitData = {
                ...formData,
                // Default values for hidden fields
                condition: item?.condition || "Good",
                purchaseDate: item?.purchaseDate ? new Date(item.purchaseDate) : new Date(),
                purchasePrice: item?.purchasePrice || 0,
                currentValue: item?.currentValue || 0,
                location: item?.location || "General",
                serialNumber: item?.serialNumber || "",
                supplier: item?.supplier || "",
                warrantyExpiry: item?.warrantyExpiry ? new Date(item.warrantyExpiry) : undefined,
                status: item?.status || "active",
            };

            if (item) {
                // Update existing item
                await updateInventoryItem(item.id, submitData);
                toast.success("Inventory item updated successfully");
            } else {
                // Create new item
                await createInventoryItem(submitData);
                toast.success("Inventory item created successfully");
            }
            onSuccess?.();
        } catch (error) {
            console.error("Error saving inventory item:", error);
            toast.error("Failed to save inventory item");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="property-unit">Property & Unit *</Label>
                    <Select
                        value={formData.propertyId === null ? `store` : `${formData.propertyId}-${formData.unitId}`}
                        onValueChange={(value) => {
                            if (value === 'store') {
                                setFormData(prev => ({ ...prev, propertyId: null, unitId: null }));
                            } else {
                                const [propertyId, unitId] = value.split('-').map(Number);
                                setFormData(prev => ({ ...prev, propertyId, unitId }));
                            }
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select unit or store" className="max-w-[200px] overflow-hidden text-ellipsis"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="store">Store (Unassigned)</SelectItem>
                            {properties.map(property =>
                                property.units.map((unit: any) => (
                                    <SelectItem key={unit.id} value={`${property.id}-${unit.id}`}>
                                        {property.name} - {unit.name}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>
                
                <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                        value={formData.category}
                        onValueChange={(value) => handleInputChange("category", value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Furniture">Furniture</SelectItem>
                            <SelectItem value="Electronics">Electronics</SelectItem>
                            <SelectItem value="Appliances">Appliances</SelectItem>
                            <SelectItem value="Bathroom">Bathroom</SelectItem>
                            <SelectItem value="Lighting">Lighting</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                <div>
                    <Label htmlFor="item-name">Item Name *</Label>
                    <Input
                        id="item-name"
                        value={formData.itemName}
                        onChange={(e) => handleInputChange("itemName", e.target.value)}
                        placeholder="e.g., Sofa Set"
                        required
                    />
                </div>
                
                <div>
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => handleInputChange("quantity", parseInt(e.target.value))}
                        placeholder="1"
                        required
                        disabled={!!item} // Disable when editing existing item
                        className={item ? "bg-muted cursor-not-allowed" : ""} // Visual indication when disabled
                    />
                </div>
                
                <div className="col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        placeholder="Detailed description of the item (optional)"
                    />
                </div>
                
                <div className="col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        placeholder="Additional notes (optional)..."
                        rows={3}
                    />
                </div>
            </div>
            
            <div className="flex space-x-2">
                <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "Saving..." : (item ? "Update Item" : "Add Item")}
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </form>
    );
} 