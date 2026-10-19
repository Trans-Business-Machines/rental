"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertTriangle } from "lucide-react";
import { createInventoryAssignment } from "@/lib/actions/inventory";
import { useRefreshInventoryLists } from "@/hooks/useInventory";
import { InfoBanner } from "@/components/InfoBanner";
import { unitKeys } from "@/hooks/useUnitDetails";

interface AssignableItem {
  id: string;
  propertyId: number;
  itemName: string;
  category: string;
  unitOfMeasure: string;
  availableQuantity: number;
  expectsReturn: boolean;
  property: { id: number; name: string };
}

interface UnitOption {
  id: number;
  propertyId: number;
  name: string;
  propertyName: string;
  displayName: string;
}

interface InventoryAssignmentFormProps {
  items: AssignableItem[];
  units: UnitOption[];
  preselectedUnitId?: number;
  preselectedPropertyId?: number;
  preselectedItemId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/** Serial numbers only make sense for individually identifiable assets. */
const SERIAL_CATEGORIES = new Set(["electronics", "furniture"]);

function formatQty(value: number) {
  return Number(value.toFixed(2)).toLocaleString();
}

export function InventoryAssignmentForm({
  items,
  units,
  preselectedUnitId,
  preselectedPropertyId,
  onSuccess,
  onCancel,
  preselectedItemId,
}: InventoryAssignmentFormProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const refreshInventoryLists = useRefreshInventoryLists();

  const [unitId, setUnitId] = useState(
    preselectedUnitId ? String(preselectedUnitId) : "",
  );
  const [itemId, setItemId] = useState(preselectedItemId || "");
  const [quantity, setQuantity] = useState("1");
  const [serialNumber, setSerialNumber] = useState("");
  const [notes, setNotes] = useState("");

  /**
   * Opened from a specific item (its row menu or detail page): the item
   * is fixed, and only units at that item's property are offered.
   */
  const lockedItem = preselectedItemId
    ? items.find((i) => i.id === preselectedItemId)
    : undefined;

  const unitOptions = useMemo(
    () =>
      lockedItem
        ? units.filter((u) => u.propertyId === lockedItem.propertyId)
        : units,
    [units, lockedItem],
  );

  const selectedUnit = unitOptions.find((u) => u.id === Number(unitId));

  /**
   * The unit determines the property, and an item can only be assigned
   * within its own property's store. Filtering here means the invalid
   * combination is never offered rather than rejected after the fact.
   */
  const availableItems = useMemo(() => {
    if (lockedItem) return [lockedItem];
    if (!selectedUnit) return [];
    return items.filter((i) => i.propertyId === selectedUnit.propertyId);
  }, [items, selectedUnit, lockedItem]);

  const selectedItem = availableItems.find((i) => i.id === itemId);

  const parsedQty = Number(quantity);
  const validQty = quantity !== "" && !Number.isNaN(parsedQty) && parsedQty > 0;
  const exceedsStock =
    validQty && selectedItem
      ? parsedQty > selectedItem.availableQuantity
      : false;

  // Whole units for pieces/pairs/sets; fractions for kg and litres.
  const isCountable =
    selectedItem &&
    [
      "pieces",
      "pairs",
      "sets",
      "sachets",
      "packets",
      "bottles",
      "rolls",
    ].includes(selectedItem.unitOfMeasure);

  const showSerial =
    selectedItem &&
    SERIAL_CATEGORIES.has(selectedItem.category) &&
    parsedQty === 1;

  /** Changing the unit can invalidate the chosen item's property. */
  const handleUnitChange = (value: string) => {
    setUnitId(value);
    const nextUnit = units.find((u) => u.id === Number(value));
    if (
      selectedItem &&
      nextUnit &&
      selectedItem.propertyId !== nextUnit.propertyId
    ) {
      setItemId("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!unitId) {
      toast.error("Select a unit.", {
        description: "Items are assigned to a specific unit.",
      });
      return;
    }

    if (!itemId) {
      toast.error("Select an item.", {
        description: "Only items stocked at this unit's property are listed.",
      });
      return;
    }

    if (!validQty) {
      toast.error("Enter a quantity greater than zero.");
      return;
    }

    setLoading(true);

    // One call with a quantity — the old version looped N create calls
    // in Promise.all, which could half-succeed and leave stock wrong.
    const result = await createInventoryAssignment({
      inventoryItemId: itemId,
      unitId: Number(unitId),
      quantity: parsedQty,
      serialNumber: showSerial && serialNumber ? serialNumber : undefined,
      notes: notes.trim() || undefined,
    });

    setLoading(false);

    if (!result.success) {
      toast.error(result.message, { description: result.nextStep });
      return;
    }

    if (preselectedUnitId && preselectedPropertyId) {
      await queryClient.invalidateQueries({
        queryKey: unitKeys.details(
          preselectedUnitId.toString(),
          preselectedPropertyId.toString(),
        ),
      });
    }

    toast.success(result.message);
    refreshInventoryLists();
    onSuccess?.();
  };

  // Group units under their property so the list stays readable.
  const unitsByProperty = useMemo(() => {
    const map = new Map<string, UnitOption[]>();
    for (const unit of unitOptions) {
      const list = map.get(unit.propertyName) ?? [];
      list.push(unit);
      map.set(unit.propertyName, list);
    }
    return Array.from(map.entries());
  }, [unitOptions]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="assign-unit">Unit *</Label>
        <Select
          value={unitId}
          onValueChange={handleUnitChange}
          disabled={Boolean(preselectedUnitId) || loading}
        >
          <SelectTrigger id="assign-unit" className="w-full">
            <SelectValue placeholder="Select a unit" />
          </SelectTrigger>
          <SelectContent>
            {unitsByProperty.map(([propertyName, propertyUnits]) => (
              <SelectGroup key={propertyName}>
                <SelectLabel>{propertyName}</SelectLabel>
                {propertyUnits.map((unit) => (
                  <SelectItem key={unit.id} value={String(unit.id)}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="assign-item">Item *</Label>
        <Select
          value={itemId}
          onValueChange={setItemId}
          disabled={Boolean(lockedItem) || !selectedUnit || loading}
        >
          <SelectTrigger id="assign-item" className="w-full">
            <SelectValue
              placeholder={
                selectedUnit ? "Select an item" : "Choose a unit first"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {availableItems.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.itemName} ({formatQty(item.availableQuantity)}{" "}
                {item.unitOfMeasure} in store)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {preselectedItemId && !lockedItem && (
          <p className="text-xs text-muted-foreground">
            This item has no stock in store to assign. Restock it first.
          </p>
        )}

        {!preselectedItemId && selectedUnit && availableItems.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Nothing in stock at {selectedUnit.propertyName}. Restock an item
            first, or check that it isn&apos;t a laundry, housekeeping or office supply, since those are
            tracked with usage logs rather than assignments.
          </p>
        )}
      </div>

      {selectedItem && (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="assign-qty">
                Quantity * ({selectedItem.unitOfMeasure})
              </Label>
              <span className="text-xs text-muted-foreground">
                {formatQty(selectedItem.availableQuantity)}{" "}
                {selectedItem.unitOfMeasure} available
              </span>
            </div>
            <Input
              id="assign-qty"
              type="number"
              min={isCountable ? "1" : "0.01"}
              step={isCountable ? "1" : "0.01"}
              max={selectedItem.availableQuantity}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={loading}
              required
            />
            {exceedsStock && (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertTriangle className="h-3.5 w-3.5" />
                Only {formatQty(selectedItem.availableQuantity)}{" "}
                {selectedItem.unitOfMeasure} in store.
              </p>
            )}
          </div>

          {/* Consumables never come back — say so before it's committed */}
          {!selectedItem.expectsReturn && (
            <InfoBanner>
              {selectedItem.itemName} is a kitchen consumable. It will be marked
              as consumed on assignment and won&apos;t appear in the outstanding
              list or be returnable.
            </InfoBanner>
          )}

          {showSerial && (
            <div className="space-y-2">
              <Label htmlFor="assign-serial">Serial number</Label>
              <Input
                id="assign-serial"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="e.g. SN-4471"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Worth recording for warranty claims and repair history.
              </p>
            </div>
          )}
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="assign-notes">Notes</Label>
        <Textarea
          id="assign-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional"
          rows={2}
          disabled={loading}
        />
      </div>

      <div className="flex justify-end gap-2 pt-1">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="flex-0"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={loading || !selectedItem || !validQty || exceedsStock}
          className="flex-1"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Assign
        </Button>
      </div>
    </form>
  );
}
