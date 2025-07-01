"use client";

import { InventoryForm } from "@/components/InventoryForm";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";

interface InventoryDialogProps {
    children?: React.ReactNode;
    initialPropertyId?: number;
    initialUnitId?: number;
}

export function InventoryDialog({ children, initialPropertyId, initialUnitId }: InventoryDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add Inventory Item</DialogTitle>
                </DialogHeader>
                <InventoryForm
                    initialPropertyId={initialPropertyId}
                    initialUnitId={initialUnitId}
                    onSuccess={() => setOpen(false)}
                    onCancel={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
} 