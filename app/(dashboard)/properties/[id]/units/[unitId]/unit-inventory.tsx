'use client'

import { InventoryDialog } from "@/components/InventoryDialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

interface InventoryItem {
	id: number;
	category: string;
	itemName: string;
	description: string;
	quantity: number;
	condition: string;
	purchasePrice?: number;
	currentValue?: number;
	location: string;
	status: string;
	lastInspected: Date;
}

interface UnitInventoryProps {
	unit: {
		id: number;
		name: string;
		propertyId: number;
	};
	inventory: InventoryItem[];
}

export function UnitInventory({ unit, inventory }: UnitInventoryProps) {
	const getConditionColor = (condition: string) => {
		switch (condition.toLowerCase()) {
			case "excellent":
				return "default";
			case "good":
				return "secondary";
			case "fair":
				return "outline";
			case "poor":
				return "destructive";
			default:
				return "default";
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "default";
			case "damaged":
				return "destructive";
			case "missing":
				return "secondary";
			case "maintenance":
				return "outline";
			default:
				return "default";
		}
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="text-lg">Inventory</CardTitle>
					<div className="flex items-center space-x-2">
						<Badge variant="outline">{inventory.length} items</Badge>
						<InventoryDialog 
							preselectedPropertyId={unit.propertyId}
							preselectedUnitId={unit.id}
						/>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{inventory.length === 0 ? (
					<div className="text-center py-8">
						<Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
						<p className="text-sm text-muted-foreground">No inventory items yet</p>
						<p className="text-xs text-muted-foreground mt-1">
							Add items to track what&apos;s in this unit
						</p>
					</div>
				) : (
					<div className="space-y-3">
						{inventory.map((item) => (
							<Card key={item.id} className="p-4">
								<div className="flex items-start justify-between">
									<div className="space-y-1 flex-1">
										<div className="flex items-center space-x-2">
											<h3 className="font-medium">{item.itemName}</h3>
											<Badge variant={getConditionColor(item.condition)}>
												{item.condition}
											</Badge>
											<Badge variant={getStatusColor(item.status)}>
												{item.status}
											</Badge>
										</div>
										<p className="text-sm text-muted-foreground">
											{item.description}
										</p>
										<div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
											<div>
												<span className="font-medium">Category:</span> {item.category}
											</div>
											<div>
												<span className="font-medium">Location:</span> {item.location}
											</div>
											<div>
												<span className="font-medium">Quantity:</span> {item.quantity}
											</div>
											<div>
												<span className="font-medium">Value:</span> $
												{item.currentValue || item.purchasePrice || 0}
											</div>
										</div>
									</div>
								</div>
							</Card>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
} 