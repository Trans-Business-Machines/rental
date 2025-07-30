'use client'

import { InventoryAssignmentDialog } from "@/components/InventoryAssignmentDialog";
import { InventoryDialog } from "@/components/InventoryDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { returnInventoryAssignment } from "@/lib/actions/inventory";
import { ArrowLeft, Package, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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

interface Assignment {
	id: number;
	serialNumber?: string;
	notes?: string;
	isActive: boolean;
	assignedAt: Date;
	returnedAt?: Date;
	inventoryItem: {
		id: number;
		itemName: string;
		category: string;
	};
}

interface UnitInventoryProps {
	unit: {
		id: number;
		name: string;
		propertyId: number;
	};
	inventory: InventoryItem[];
	assignments?: Assignment[];
}

export function UnitInventory({  inventory, assignments = [] }: UnitInventoryProps) {
	const [returningIds, setReturningIds] = useState<Set<number>>(new Set());

	const handleReturn = async (assignmentId: number) => {
		setReturningIds(prev => new Set(prev).add(assignmentId));
		
		try {
			await returnInventoryAssignment(assignmentId, "Returned from unit interface");
			toast.success("Item returned successfully");
			// The page should refresh to show updated data
			window.location.reload();
		} catch (error) {
			console.error("Error returning assignment:", error);
			toast.error(error instanceof Error ? error.message : "Failed to return item");
		} finally {
			setReturningIds(prev => {
				const next = new Set(prev);
				next.delete(assignmentId);
				return next;
			});
		}
	};

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

	const activeAssignments = assignments.filter(a => a.isActive);
	const totalItems = inventory.length + activeAssignments.length;

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-lg">Inventory & Assignments</CardTitle>
						<p className="text-sm text-muted-foreground">
							{inventory.length} stored items • {activeAssignments.length} assigned items
						</p>
					</div>
					<div className="flex items-center space-x-2">
						<Badge variant="outline">{totalItems} total</Badge>
						<InventoryAssignmentDialog
							trigger={
								<Button size="sm" variant="outline" className="gap-2">
									<Plus className="h-4 w-4" />
									Assign Item
								</Button>
							}
						/>
						<InventoryDialog />
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{totalItems === 0 ? (
					<div className="text-center py-8">
						<Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
						<p className="text-sm text-muted-foreground">No inventory items yet</p>
						<p className="text-xs text-muted-foreground mt-1">
							Add items or assign items to track what&apos;s in this unit
						</p>
					</div>
				) : (
					<div className="space-y-6">
						{/* Assigned Items Section */}
						{activeAssignments.length > 0 && (
							<div>
								<div className="flex items-center gap-2 mb-3">
									<Package className="h-4 w-4 text-blue-600" />
									<h3 className="font-medium text-blue-600">Assigned Items ({activeAssignments.length})</h3>
								</div>
								<div className="space-y-3">
									{activeAssignments.map((assignment) => (
										<Card key={assignment.id} className="p-4 border-blue-200">
											<div className="flex items-start justify-between">
												<div className="space-y-1 flex-1">
													<div className="flex items-center space-x-2">
														<h3 className="font-medium">{assignment.inventoryItem.itemName}</h3>
														<Badge variant="default" className="bg-blue-100 text-blue-800">
															Assigned
														</Badge>
														{assignment.serialNumber && (
															<Badge variant="outline">
																{assignment.serialNumber}
															</Badge>
														)}
													</div>
													<p className="text-sm text-muted-foreground">
														{assignment.inventoryItem.category}
													</p>
													<div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
														<div>
															<span className="font-medium">Assigned:</span>{' '}
															{new Date(assignment.assignedAt).toLocaleDateString()}
														</div>
														{assignment.notes && (
															<div>
																<span className="font-medium">Notes:</span> {assignment.notes}
															</div>
														)}
													</div>
												</div>
												<Button
													size="sm"
													variant="outline"
													onClick={() => handleReturn(assignment.id)}
													disabled={returningIds.has(assignment.id)}
													className="gap-2"
												>
													<ArrowLeft className="h-4 w-4" />
													{returningIds.has(assignment.id) ? "Returning..." : "Return"}
												</Button>
											</div>
										</Card>
									))}
								</div>
							</div>
						)}

						{/* Stored Items Section */}
						{inventory.length > 0 && (
							<div>
								<div className="flex items-center gap-2 mb-3">
									<Package className="h-4 w-4 text-muted-foreground" />
									<h3 className="font-medium">Stored Items ({inventory.length})</h3>
								</div>
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
							</div>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
} 