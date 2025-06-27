"use client";

import { InventoryForm } from "@/components/InventoryForm";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Edit } from "lucide-react";
import { useState } from "react";

interface InventoryItem {
    id: number;
    propertyId: number;
    unitId: number;
    category: string;
    itemName: string;
    description: string;
    quantity: number;
    condition: string;
    purchaseDate: Date;
    purchasePrice: number;
    currentValue: number;
    location: string;
    serialNumber?: string | null;
    supplier?: string | null;
    warrantyExpiry?: Date | null;
    status: string;
    notes?: string | null;
    property: { id: number; name: string };
    unit: { id: number; name: string };
}

interface InventoryEditDialogProps {
    item: InventoryItem;
    children?: React.ReactNode;
}

export function InventoryEditDialog({ item, children }: InventoryEditDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(true)}
            >
                {children || (
                    <>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </>
                )}
            </Button>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Inventory Item</DialogTitle>
                </DialogHeader>
                <InventoryForm
                    item={item}
                    onSuccess={() => setOpen(false)}
                    onCancel={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
} 