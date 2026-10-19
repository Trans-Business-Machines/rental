"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Info } from "lucide-react";
import {
  createInventoryItem,
  updateInventoryItem,
} from "@/lib/actions/inventory";
import type {
  InventoryCategory,
  UnitOfMeasure,
} from "@/prisma/generated/client";

/* ------------------------------------------------------------------ *
 * OPTIONS
 *
 * Category drives behaviour everywhere else in the system, so the
 * helper text spells out what each one means operationally.
 * ------------------------------------------------------------------ */

const CATEGORY_OPTIONS: {
  value: InventoryCategory;
  label: string;
  hint: string;
  defaultUom: UnitOfMeasure;
}[] = [
  {
    value: "electronics",
    label: "Electronics",
    hint: "Assigned to units and expected back. Issues can be reported.",
    defaultUom: "pieces",
  },
  {
    value: "furniture",
    label: "Furniture",
    hint: "Assigned to units and expected back. Issues can be reported.",
    defaultUom: "pieces",
  },
  {
    value: "bedroom",
    label: "Bedroom items",
    hint: "Assigned to units and expected back. Issues can be reported.",
    defaultUom: "pieces",
  },
  {
    value: "cutlery",
    label: "Cutlery",
    hint: "Assigned to units and expected back. Issues can be reported.",
    defaultUom: "pieces",
  },
  {
    value: "linens",
    label: "Linens",
    hint: "Assigned to units and expected back. Issues can be reported.",
    defaultUom: "pieces",
  },
  {
    value: "kitchen_consumables",
    label: "Kitchen consumables",
    hint: "Assigned to units and consumed there, never returned.",
    defaultUom: "sachets",
  },
  {
    value: "laundry",
    label: "Laundry commodities",
    hint: "Used centrally by housekeeping. Tracked with usage logs, not assignments.",
    defaultUom: "kg",
  },
];

const UOM_OPTIONS: { value: UnitOfMeasure; label: string }[] = [
  { value: "pieces", label: "Pieces" },
  { value: "pairs", label: "Pairs" },
  { value: "sets", label: "Sets" },
  { value: "kg", label: "Kilograms (kg)" },
  { value: "litres", label: "Litres" },
  { value: "sachets", label: "Sachets" },
  { value: "packets", label: "Packets" },
  { value: "bottles", label: "Bottles" },
  { value: "rolls", label: "Rolls" },
];

/* ------------------------------------------------------------------ */

export interface InventoryFormItem {
  id: string;
  propertyId: number;
  category: InventoryCategory;
  itemName: string;
  description: string | null;
  unitOfMeasure: UnitOfMeasure;
  restockAt: number;
  unitCost: number | null;
}

interface PropertyOption {
  id: number;
  name: string;
}

interface InventoryFormProps {
  properties: PropertyOption[];
  item?: InventoryFormItem;
  /**
   * True when the item already has restock, assignment, issue or usage
   * history. Category and unit of measure are frozen at that point —
   * the server rejects the change too, this just prevents the attempt.
   */
  hasHistory?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function InventoryForm({
  properties,
  item,
  hasHistory = false,
  onSuccess,
  onCancel,
}: InventoryFormProps) {
  const isEditing = Boolean(item);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    propertyId: item?.propertyId ? String(item.propertyId) : "",
    category: (item?.category ?? "") as InventoryCategory | "",
    itemName: item?.itemName ?? "",
    description: item?.description ?? "",
    unitOfMeasure: (item?.unitOfMeasure ?? "pieces") as UnitOfMeasure,
    openingQuantity: "",
    restockAt: item?.restockAt != null ? String(item.restockAt) : "0",
    unitCost: item?.unitCost != null ? String(item.unitCost) : "",
  });

  const selectedCategory = CATEGORY_OPTIONS.find(
    (c) => c.value === form.category,
  );

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  /** Picking a category suggests a sensible unit, but doesn't force it. */
  const handleCategoryChange = (value: string) => {
    const category = value as InventoryCategory;
    const match = CATEGORY_OPTIONS.find((c) => c.value === category);
    setForm((prev) => ({
      ...prev,
      category,
      unitOfMeasure: isEditing
        ? prev.unitOfMeasure
        : (match?.defaultUom ?? "pieces"),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.itemName.trim()) {
      toast.error("An item name is required.", {
        description: "Enter a name such as “Bath towels”.",
      });
      return;
    }

    if (!isEditing && !form.propertyId) {
      toast.error("Select a property.", {
        description: "Each property keeps its own inventory store.",
      });
      return;
    }

    if (!form.category) {
      toast.error("Select a category.", {
        description: "The category decides how this item is tracked.",
      });
      return;
    }

    setLoading(true);

    const result = isEditing
      ? await updateInventoryItem(item!.id, {
          itemName: form.itemName,
          description: form.description || undefined,
          restockAt: Number(form.restockAt) || 0,
          unitCost: form.unitCost ? Number(form.unitCost) : undefined,
          ...(hasHistory
            ? {}
            : {
                category: form.category as InventoryCategory,
                unitOfMeasure: form.unitOfMeasure,
              }),
        })
      : await createInventoryItem({
          propertyId: Number(form.propertyId),
          category: form.category as InventoryCategory,
          itemName: form.itemName,
          description: form.description || undefined,
          unitOfMeasure: form.unitOfMeasure,
          restockAt: Number(form.restockAt) || 0,
          unitCost: form.unitCost ? Number(form.unitCost) : undefined,
          openingQuantity: Number(form.openingQuantity) || 0,
        });

    setLoading(false);

    if (!result.success) {
      // message = what went wrong, nextStep = what to do about it
      toast.error(result.message, { description: result.nextStep });
      return;
    }

    toast.success(result.message);
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Property — locked after creation, since the store is property-scoped */}
        <div className="space-y-2">
          <Label htmlFor="property">Property *</Label>
          <Select
            value={form.propertyId}
            onValueChange={(v) => set("propertyId", v)}
            disabled={isEditing || loading}
          >
            <SelectTrigger id="property" className="w-full">
              <SelectValue placeholder="Select a property" />
            </SelectTrigger>
            <SelectContent>
              {properties.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isEditing && (
            <p className="text-xs text-muted-foreground">
              Items can&apos;t move between property stores.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="item-name">Item name *</Label>
          <Input
            id="item-name"
            value={form.itemName}
            onChange={(e) => set("itemName", e.target.value)}
            placeholder='e.g. Bath towels, Sugar, Samsung 43" TV'
            disabled={loading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={form.category}
            onValueChange={handleCategoryChange}
            disabled={hasHistory || loading}
          >
            <SelectTrigger id="category" className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="uom">Unit of measure *</Label>
          <Select
            value={form.unitOfMeasure}
            onValueChange={(v) => set("unitOfMeasure", v as UnitOfMeasure)}
            disabled={hasHistory || loading}
          >
            <SelectTrigger id="uom" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {UOM_OPTIONS.map((u) => (
                <SelectItem key={u.value} value={u.value}>
                  {u.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category behaviour, so nobody has to guess why Assign is missing */}
      {selectedCategory && (
        <div className="flex gap-2 rounded-md border border-blue-700 bg-blue-500/10 p-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
          <p className="text-xs text-blue-600">
            {selectedCategory.hint}
          </p>
        </div>
      )}

      {hasHistory && (
        <p className="text-xs text-muted-foreground">
          Category and unit of measure are locked because this item already has
          stock history changing them would reinterpret every past record.
          Create a separate item if you need different settings.
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Optional detail, brand, size, model . . ."
          rows={2}
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {!isEditing && (
          <div className="space-y-2">
            <Label htmlFor="opening">Opening stock</Label>
            <Input
              id="opening"
              type="number"
              min="0"
              step="0.01"
              value={form.openingQuantity}
              onChange={(e) => set("openingQuantity", e.target.value)}
              placeholder="0"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Recorded as the first stock receipt.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="restock-at">Restock threshold</Label>
          <Input
            id="restock-at"
            type="number"
            min="0"
            step="0.01"
            value={form.restockAt}
            onChange={(e) => set("restockAt", e.target.value)}
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            Flagged low at or below this level
            {form.unitOfMeasure ? ` (${form.unitOfMeasure})` : ""}.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit-cost">Unit cost (KES)</Label>
          <Input
            id="unit-cost"
            type="number"
            min="0"
            value={form.unitCost}
            onChange={(e) => set("unitCost", e.target.value)}
            placeholder="0"
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            Current replacement cost.
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
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
        <Button type="submit" disabled={loading} className="flex-1 cursor-pointer">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Save changes" : "Add item"}
        </Button>
      </div>
    </form>
  );
}
