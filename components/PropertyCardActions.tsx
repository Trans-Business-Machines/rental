'use client'

import { PropertyForm } from "@/components/PropertyForm"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Edit, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface Property {
    id: number
    name: string
    address: string
    type: string
    totalUnits?: number
    occupied: number
    rent: number
    status: string
    description: string
    image: string
    createdAt: Date
    updatedAt: Date
}

interface PropertyCardActionsProps {
    property: Property
}

export function PropertyCardActions({ property }: PropertyCardActionsProps) {
    const router = useRouter()
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

    return (
        <>
            <div className="flex space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/properties/${property.id}`)}
                >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setIsEditDialogOpen(true)}
                >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                </Button>
            </div>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Property</DialogTitle>
                    </DialogHeader>
                    <PropertyForm 
                        property={property}
                        onSuccess={() => setIsEditDialogOpen(false)}
                        onCancel={() => setIsEditDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </>
    )
} 