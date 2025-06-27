'use client'

import { PropertyForm } from "@/components/PropertyForm"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface Property {
    id: number
    name: string
    address: string
    type: string
    units: number
    rent: number
    description: string
    image: string
}

interface PropertyEditDialogProps {
    property: Property | null
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function PropertyEditDialog({ property, isOpen, onOpenChange }: PropertyEditDialogProps) {
    const handleSuccess = () => {
        onOpenChange(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Property</DialogTitle>
                </DialogHeader>
                <PropertyForm 
                    property={property} 
                    onSuccess={handleSuccess}
                    onCancel={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    )
} 