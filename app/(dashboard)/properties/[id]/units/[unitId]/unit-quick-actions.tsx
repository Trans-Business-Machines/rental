'use client'

import { BookingDialog } from "@/components/BookingDialog";
import { GuestDialog } from "@/components/GuestDialog";
import { InventoryDialog } from "@/components/InventoryDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UnitQuickActionsProps {
	unit: {
		id: number;
		name: string;
		status: string;
		propertyId: number;
	};
	property: {
		id: number;
		name: string;
	};
}

export function UnitQuickActions({ unit, property }: UnitQuickActionsProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">Quick Actions</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="space-y-2">
						<h3 className="font-medium text-sm">Book a Guest</h3>
						<p className="text-xs text-muted-foreground">
							Create a new booking for this unit
						</p>
						<BookingDialog 
							preselectedPropertyId={property.id}
							preselectedUnitId={unit.id}
						/>
					</div>
					
					<div className="space-y-2">
						<h3 className="font-medium text-sm">Add Inventory</h3>
						<p className="text-xs text-muted-foreground">
							Add new items to unit inventory
						</p>
						      <InventoryDialog />
					</div>
					
					<div className="space-y-2">
						<h3 className="font-medium text-sm">Add Guest</h3>
						<p className="text-xs text-muted-foreground">
							Register a new guest
						</p>
						<GuestDialog />
					</div>
				</div>
			</CardContent>
		</Card>
	);
} 