"use client"
import { Button } from "@/components/ui/button";
import { useRoles } from "@/hooks/useRoles";
import { softDeleteProperty } from "@/lib/actions/properties";
import { Property } from "@/prisma/generated/client";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface PropertyDeleteButtonProps {
	property: Property
}

export function PropertyDeleteButton({ property }: PropertyDeleteButtonProps) {
	const { has } = useRoles()
	const isAdmin = has("admin")
    const router = useRouter()

	if (!isAdmin) {
		return null
    }
    
    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${property.name}"? This action cannot be undone.`)) {
            return
        }
        try {
            await softDeleteProperty(property.id)
            toast.success("Property deleted successfully")
            router.push("/properties")
            router.refresh()
        } catch (error) {
            console.error("Error deleting property:", error)
            toast.error("Failed to delete property")
        }
        
    }

	return <Button variant="outline" size="sm" onClick={handleDelete}>
		<Trash2 className="h-4 w-4 mr-2" />
		Delete Property
	</Button>
}