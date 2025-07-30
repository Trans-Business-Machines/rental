"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import { InventoryAssignmentForm } from "./InventoryAssignmentForm";

interface InventoryAssignmentDialogProps {
	preselectedItemId?: number;
	trigger?: React.ReactNode;
	onSuccess?: () => void;
}

export function InventoryAssignmentDialog({ preselectedItemId, trigger, onSuccess }: InventoryAssignmentDialogProps) {
	const [open, setOpen] = useState(false);

	const handleSuccess = () => {
		setOpen(false);
		onSuccess?.();
	};

	const handleCancel = () => {
		setOpen(false);
	};

	const defaultTrigger = (
		<Button size="sm" className="gap-2">
			<Plus className="h-4 w-4" />
			Assign to Unit
		</Button>
	);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || defaultTrigger}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Assign Inventory Item</DialogTitle>
					<DialogDescription>
						Assign an inventory item from the store to a specific unit. This will reduce the store quantity and create an assignment record.
					</DialogDescription>
				</DialogHeader>
				<InventoryAssignmentForm
					preselectedItemId={preselectedItemId}
					onSuccess={handleSuccess}
					onCancel={handleCancel}
				/>
			</DialogContent>
		</Dialog>
	);
}