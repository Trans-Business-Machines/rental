"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  createInventoryItem,
  updateInventoryItem,
} from "@/lib/actions/inventory";
import { useState } from "react";
import { toast } from "sonner";
import type { InventoryItem } from "@/lib/types/types";

interface InventoryFormProps {
  item?: InventoryItem;
  onSuccess?: () => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

export function InventoryForm({
  item,
  onSuccess,
  onCancel,
  isEditing = false,
}: InventoryFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: item?.category || "",
    itemName: item?.itemName || "",
    description: item?.description || "",
    quantity: item?.quantity || 1,
    purchasePrice: item?.purchasePrice || 0,
    currentValue: item?.currentValue || 0,
    supplier: item?.supplier || "",
    warrantyExpiry: item?.warrantyExpiry
      ? new Date(item.warrantyExpiry).toISOString().split("T")[0]
      : "",
    assignableOnBooking: item?.assignableOnBooking ?? true,
  });

  // No need to fetch properties since inventory items are now templates

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        purchasePrice: formData.purchasePrice || undefined,
        currentValue: formData.currentValue || undefined,
        supplier: formData.supplier || undefined,
        warrantyExpiry: formData.warrantyExpiry
          ? new Date(formData.warrantyExpiry)
          : undefined,
        status: item?.status || "active",
      };

      if (item && isEditing) {
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

  const handleInputChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="item-name">Item Name *</Label>
          <Input
            id="item-name"
            value={formData.itemName}
            onChange={(e) => handleInputChange("itemName", e.target.value)}
            placeholder="e.g., Plates, Laptops, Sofas"
            disabled={isEditing}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleInputChange("category", value)}
            disabled={isEditing}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Furniture">Furniture</SelectItem>
              <SelectItem value="Electronics">Electronics</SelectItem>
              <SelectItem value="Cutlery">Cutlery</SelectItem>
              <SelectItem value="Bathroom">Bathroom</SelectItem>
              <SelectItem value="Lighting">Lighting</SelectItem>
              <SelectItem value="Kitchen Accessories">
                Kitchen Accessories
              </SelectItem>
              <SelectItem value="Bedroom Accessories">
                Bedroom Accessories
              </SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Detailed description of the item"
            disabled={isEditing}
          />
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            min="0"
            value={formData.quantity}
            onChange={(e) =>
              handleInputChange("quantity", parseInt(e.target.value) || 0)
            }
            placeholder="Available quantity"
            disabled={isEditing}
            required
          />
        </div>

        <div className="col-span-2 space-y-3">
          <div className="flex items-center space-x-3">
            <Switch
              id="assignable-on-booking"
              checked={formData.assignableOnBooking}
              onCheckedChange={(checked) =>
                handleInputChange("assignableOnBooking", checked)
              }
              disabled={isEditing}
            />
            <div className="space-y-1">
              <Label
                htmlFor="assignable-on-booking"
                className="text-sm font-medium"
              >
                Can be assigned to guests
              </Label>
              <p className="text-xs text-muted-foreground">
                {formData.assignableOnBooking
                  ? "This item can be given to guests during check-in and returned at checkout"
                  : "This item is fixed in the room and cannot be assigned to guests"}
              </p>
            </div>
          </div>
        </div>

        {/* Show these fields only when editing */}
        {item && isEditing && (
          <>
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier (optional)</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => handleInputChange("supplier", e.target.value)}
                placeholder="Supplier name (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase-price">Purchase Price (KES)</Label>
              <Input
                id="purchase-price"
                type="number"
                value={formData.purchasePrice}
                onChange={(e) =>
                  handleInputChange(
                    "purchasePrice",
                    parseInt(e.target.value) || 1
                  )
                }
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current-value">Current Value (KES)</Label>
              <Input
                id="current-value"
                type="number"
                value={formData.currentValue}
                onChange={(e) =>
                  handleInputChange(
                    "currentValue",
                    parseInt(e.target.value) || 1
                  )
                }
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="warranty-expiry">Warranty Expiry</Label>
              <Input
                id="warranty-expiry"
                type="date"
                value={formData.warrantyExpiry}
                onChange={(e) =>
                  handleInputChange("warrantyExpiry", e.target.value)
                }
              />
            </div>
          </>
        )}
      </div>

      <div className="flex flex-row justify-end gap-2 pt-3">
        <Button
          type="submit"
          className="cursor-pointer w-1/3"
          disabled={loading}
        >
          {loading ? "Saving..." : item ? "Update Item" : "Add Item"}
        </Button>
        <Button
          type="button"
          className="w-1/4 bg-chart-5 hover:bg-chart-5 cursor-pointer"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
