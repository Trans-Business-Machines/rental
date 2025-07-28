"use client";

import { InventoryForm } from "@/components/InventoryForm";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface InventoryItem {
    id: number;
    propertyId: number;
    unitId: number | null;
    category: string;
    itemName: string;
    description: string;
    quantity: number;
    condition: string;
    purchaseDate: Date;
    purchasePrice?: number;
    currentValue?: number;
    location: string;
    serialNumber?: string | null;
    supplier?: string | null;
    warrantyExpiry?: Date | null;
    status: string;
    notes?: string | null;
    property: { id: number; name: string };
    unit: { id: number; name: string } | null;
}

interface InventoryEditDialogProps {
    item: InventoryItem;
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function InventoryEditDialog({ item, children, open, onOpenChange }: InventoryEditDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    
    const isControlled = open !== undefined;
    const dialogOpen = isControlled ? open : internalOpen;
    const setDialogOpen = isControlled ? (onOpenChange || (() => {})) : setInternalOpen;

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            {children && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Inventory Item</DialogTitle>
                </DialogHeader>
                <InventoryForm
                    item={item}
                    onSuccess={() => setDialogOpen(false)}
                    onCancel={() => setDialogOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
} 