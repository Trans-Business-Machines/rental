"use client";

import { InventoryAssignmentDialog } from "@/components/InventoryAssignmentDialog";
import { InventoryEditDialog } from "@/components/InventoryEditDialog";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Eye, MoreVertical, Move } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface InventoryItem {
    id: number;
    category: string;
    itemName: string;
    description: string;
    quantity: number;
    purchasePrice?: number;
    currentValue?: number;
    supplier?: string | null;
    warrantyExpiry?: Date | null;
    status: string;
    assignableOnBooking?: boolean;
}

interface InventoryActionsProps {
    item: InventoryItem;
}

export function InventoryActions({ item }: InventoryActionsProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);

    const handleEditClick = () => {
        setDropdownOpen(false);
        setEditDialogOpen(true);
    };

    const handleAssignClick = () => {
        setDropdownOpen(false);
        setAssignDialogOpen(true);
    };

    return (
        <div>
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                        <Link href={`/inventory/${item.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                        </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={handleEditClick}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Item
                    </DropdownMenuItem>
                    
                    {item.assignableOnBooking !== false && (
                        <DropdownMenuItem onClick={handleAssignClick}>
                            <Move className="h-4 w-4 mr-2" />
                            Assign/Move
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <InventoryEditDialog 
                item={item} 
                open={editDialogOpen} 
                onOpenChange={setEditDialogOpen}
            />

            <InventoryAssignmentDialog
                preselectedItemId={item.id}
                open={assignDialogOpen}
                onOpenChange={setAssignDialogOpen}
            />
        </div>
    );
} 