"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useQueryClient } from "@tanstack/react-query";
import { unitKeys } from "@/hooks/useUnitDetails";
import {
  createInventoryAssignment,
  getAllUnitsForAssignment,
  getInventoryItemsWithAvailability,
} from "@/lib/actions/inventory";
import { ChevronDown, Package, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface InventoryAssignmentFormProps {
  preselectedUnitId?: number;
  preselectedPropertyId?: number;
  preselectedItemId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface InventoryItem {
  id: number;
  itemName: string;
  category: string;
  availableQuantity: number;
  isAvailable: boolean;
}

interface Unit {
  id: number;
  propertyId: number;
  name: string;
  propertyName: string;
  displayName: string;
  value: string;
}

interface AssignmentDetail {
  id: string;
  serialNumber: string;
  notes: string;
}

export function InventoryAssignmentForm({
  preselectedItemId,
  preselectedUnitId,
  preselectedPropertyId,
  onSuccess,
  onCancel,
}: InventoryAssignmentFormProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [formData, setFormData] = useState({
    inventoryItemId: preselectedItemId || "",
    unitId: preselectedUnitId?.toString() || "",
    propertyId: preselectedPropertyId?.toString() || "",
    quantity: 1,
  });
  const [assignmentDetails, setAssignmentDetails] = useState<
    AssignmentDetail[]
  >([]);

  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsData, unitsData] = await Promise.all([
          getInventoryItemsWithAvailability(),
          getAllUnitsForAssignment(),
        ]);

        // Filter only available items (quantity > 0)
        const availableItems = itemsData.filter(
          (item: any) => item.isAvailable
        );
        setItems(availableItems);
        setUnits(unitsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      }
    };
    fetchData();
  }, []);

  const handleUnitChange = (value: string) => {
    const [propertyId, unitId] = value.split("-").map(Number);
    setFormData((prev) => ({
      ...prev,
      unitId: unitId.toString(),
      propertyId: propertyId.toString(),
    }));
  };

  const handleQuantityChange = (quantity: number) => {
    setFormData((prev) => ({ ...prev, quantity }));
    // Auto-expand details if quantity > 1
    if (quantity > 1) {
      setIsDetailsExpanded(true);
    }
  };

  const generateAssignmentDetails = () => {
    const details: AssignmentDetail[] = [];
    for (let i = 0; i < formData.quantity; i++) {
      details.push({
        id: `assignment-${i + 1}`,
        serialNumber: "",
        notes: "",
      });
    }
    setAssignmentDetails(details);
    setIsDetailsExpanded(true);
  };

  const updateAssignmentDetail = (
    id: string,
    field: keyof AssignmentDetail,
    value: string
  ) => {
    setAssignmentDetails((prev) =>
      prev.map((detail) =>
        detail.id === id ? { ...detail, [field]: value } : detail
      )
    );
  };

  const removeAssignmentDetail = (id: string) => {
    setAssignmentDetails((prev) => prev.filter((detail) => detail.id !== id));
    setFormData((prev) => ({ ...prev, quantity: prev.quantity - 1 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.inventoryItemId || !formData.unitId) {
        toast.error("Please select an inventory item and unit");
        return;
      }

      if (formData.quantity <= 0) {
        toast.error("Quantity must be greater than 0");
        return;
      }

      // Create assignments based on quantity
      const promises = [];
      for (let i = 0; i < formData.quantity; i++) {
        const detail = assignmentDetails[i];
        promises.push(
          createInventoryAssignment({
            inventoryItemId: Number(formData.inventoryItemId),
            unitId: Number(formData.unitId),
            propertyId: Number(formData.propertyId),
            serialNumber: detail?.serialNumber || undefined,
            notes: detail?.notes || undefined,
          })
        );
      }

      await Promise.all(promises);

      if (preselectedUnitId && preselectedPropertyId) {
        await queryClient.invalidateQueries({
          queryKey: unitKeys.details(
            preselectedUnitId.toString(),
            preselectedPropertyId.toString()
          ),
        });
      }

      const itemName = selectedItem?.itemName || "items";
      toast.success(`${formData.quantity} ${itemName} assigned successfully`);
      onSuccess?.();
    } catch (error) {
      console.error("Error creating assignments:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create assignments"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const selectedItem = items.find(
    (item) => item.id === Number(formData.inventoryItemId)
  );
  const maxQuantity = selectedItem?.availableQuantity || 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Assignment Info - 2 Column Layout */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2 col-span-2">
          <Label htmlFor="inventory-item">Inventory Item *</Label>
          <Select
            value={formData.inventoryItemId.toString()}
            onValueChange={(value) =>
              handleInputChange("inventoryItemId", value)
            }
            disabled={!!preselectedItemId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select item" />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item.id} value={item.id.toString()}>
                  <div className="flex justify-between items-center w-full">
                    <span className="truncate">{item.itemName}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {item.availableQuantity}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="unit">Unit *</Label>
          <Select
            value={
              formData.unitId ? `${formData.propertyId}-${formData.unitId}` : ""
            }
            onValueChange={handleUnitChange}
          >
            <SelectTrigger className="w-full" disabled={!!preselectedUnitId}>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit.id} value={unit.value}>
                  {unit.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quantity Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="quantity">Quantity *</Label>
          {selectedItem && (
            <span className="text-sm text-muted-foreground">
              Available: {selectedItem.availableQuantity}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            id="quantity"
            type="number"
            min="1"
            max={maxQuantity}
            value={formData.quantity}
            onChange={(e) =>
              handleQuantityChange(parseInt(e.target.value) || 1)
            }
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={generateAssignmentDetails}
            disabled={formData.quantity <= 0}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Generate Details
          </Button>
        </div>
      </div>

      {/* Assignment Details - Expandable Card */}
      {(formData.quantity > 1 || assignmentDetails.length > 0) && (
        <Collapsible
          open={isDetailsExpanded}
          onOpenChange={setIsDetailsExpanded}
        >
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Assignment Details ({assignmentDetails.length})
                  </CardTitle>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                {assignmentDetails.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <p className="text-sm">
                      Click &quot;Generate Details&quot; to add serial numbers
                      and notes
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assignmentDetails.map((detail, index) => (
                      <Card key={detail.id} className="p-3 bg-muted/30">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-medium">
                            Item #{index + 1}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAssignmentDetail(detail.id)}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Serial Number
                            </Label>
                            <Input
                              value={detail.serialNumber}
                              onChange={(e) =>
                                updateAssignmentDetail(
                                  detail.id,
                                  "serialNumber",
                                  e.target.value
                                )
                              }
                              placeholder="Optional"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Notes
                            </Label>
                            <Input
                              value={detail.notes}
                              onChange={(e) =>
                                updateAssignmentDetail(
                                  detail.id,
                                  "notes",
                                  e.target.value
                                )
                              }
                              placeholder="Optional"
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      <Separator />

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading
            ? "Assigning..."
            : `Assign ${formData.quantity} Item${formData.quantity !== 1 ? "s" : ""}`}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
