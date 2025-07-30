"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createInventoryAssignment, getAllUnitsForAssignment, getInventoryItemsWithAvailability } from "@/lib/actions/inventory";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface InventoryAssignmentFormProps {
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

export function InventoryAssignmentForm({ preselectedItemId, onSuccess, onCancel }: InventoryAssignmentFormProps) {
	const [items, setItems] = useState<InventoryItem[]>([]);
	const [units, setUnits] = useState<Unit[]>([]);
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		inventoryItemId: preselectedItemId || "",
		unitId: "",
		propertyId: "",
		serialNumber: "",
		notes: "",
	});

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [itemsData, unitsData] = await Promise.all([
					getInventoryItemsWithAvailability(),
					getAllUnitsForAssignment(),
				]);
				
				// Filter only available items (quantity > 0)
				const availableItems = itemsData.filter((item: any) => item.isAvailable);
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
		const [propertyId, unitId] = value.split('-').map(Number);
		setFormData(prev => ({
			...prev,
			unitId: unitId.toString(),
			propertyId: propertyId.toString(),
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			if (!formData.inventoryItemId || !formData.unitId) {
				toast.error("Please select an inventory item and unit");
				return;
			}

			await createInventoryAssignment({
				inventoryItemId: Number(formData.inventoryItemId),
				unitId: Number(formData.unitId),
				propertyId: Number(formData.propertyId),
				serialNumber: formData.serialNumber || undefined,
				notes: formData.notes || undefined,
			});

			toast.success("Inventory item assigned successfully");
			onSuccess?.();
		} catch (error) {
			console.error("Error creating assignment:", error);
			toast.error(error instanceof Error ? error.message : "Failed to create assignment");
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (field: string, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const selectedItem = items.find(item => item.id === Number(formData.inventoryItemId));

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="grid grid-cols-1 gap-4">
				<div className="space-y-2">
					<Label htmlFor="inventory-item">Inventory Item *</Label>
					<Select
						value={formData.inventoryItemId.toString()}
						onValueChange={(value) => handleInputChange("inventoryItemId", value)}
						disabled={!!preselectedItemId}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select inventory item" />
						</SelectTrigger>
						<SelectContent>
							{items.map((item) => (
								<SelectItem key={item.id} value={item.id.toString()}>
									<div className="flex justify-between items-center w-full">
										<span>{item.itemName} ({item.category})</span>
										<span className="text-sm text-muted-foreground ml-2">
											Qty: {item.availableQuantity}
										</span>
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{selectedItem && (
						<div className="text-sm text-muted-foreground">
							Available quantity: {selectedItem.availableQuantity}
						</div>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="unit">Unit *</Label>
					<Select
						value={formData.unitId ? `${formData.propertyId}-${formData.unitId}` : ""}
						onValueChange={handleUnitChange}
					>
						<SelectTrigger>
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

				<div className="space-y-2">
					<Label htmlFor="serial-number">Serial Number</Label>
					<Input
						id="serial-number"
						value={formData.serialNumber}
						onChange={(e) => handleInputChange("serialNumber", e.target.value)}
						placeholder="Optional serial number or identifier"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="notes">Notes</Label>
					<Textarea
						id="notes"
						value={formData.notes}
						onChange={(e) => handleInputChange("notes", e.target.value)}
						placeholder="Optional notes about this assignment..."
						rows={3}
					/>
				</div>
			</div>

			<div className="flex space-x-2">
				<Button type="submit" className="flex-1" disabled={loading}>
					{loading ? "Assigning..." : "Create Assignment"}
				</Button>
				<Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
					Cancel
				</Button>
			</div>
		</form>
	);
}