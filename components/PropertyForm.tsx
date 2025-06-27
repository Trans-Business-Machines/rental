'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createProperty, updateProperty } from "@/lib/actions/properties"
import { useState } from "react"
import { toast } from "sonner"

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

interface PropertyFormProps {
    property?: Property | null
    onSuccess?: () => void
    onCancel?: () => void
}

export function PropertyForm({ property, onSuccess, onCancel }: PropertyFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: property?.name || "",
        address: property?.address || "",
        type: property?.type || "",
        totalUnits: property?.totalUnits?.toString() || "",
        rent: property?.rent?.toString() || "",
        description: property?.description || "",
        image: property?.image || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=60",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const data = {
                name: formData.name,
                address: formData.address,
                type: formData.type,
                totalUnits: formData.totalUnits ? parseInt(formData.totalUnits) : undefined,
                rent: parseInt(formData.rent),
                description: formData.description,
                image: formData.image,
            }

            if (property) {
                await updateProperty(property.id, data)
                toast.success("Property updated successfully")
            } else {
                await createProperty(data)
                toast.success("Property created successfully")
            }

            onSuccess?.()
        } catch (error) {
            toast.error("Failed to save property")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="name" className="mb-1.5 block">
                    Property Name
                </Label>
                <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            name: e.target.value,
                        })
                    }
                    placeholder="Enter property name"
                    required
                />
            </div>
            <div>
                <Label htmlFor="address" className="mb-1.5 block">
                    Address
                </Label>
                <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            address: e.target.value,
                        })
                    }
                    placeholder="Enter full address"
                    required
                />
            </div>
            <div>
                <Label htmlFor="type" className="mb-1.5 block">
                    Property Type
                </Label>
                <Select
                    value={formData.type}
                    onValueChange={(value) =>
                        setFormData({
                            ...formData,
                            type: value,
                        })
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="condo">Condo</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="totalUnits" className="mb-1.5 block">
                        Number of Units
                    </Label>
                    <Input
                        id="totalUnits"
                        type="number"
                        value={formData.totalUnits}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                totalUnits: e.target.value,
                            })
                        }
                        placeholder="0"
                    />
                </div>
                <div>
                    <Label htmlFor="rent" className="mb-1.5 block">
                        Base Rent ($)
                    </Label>
                    <Input
                        id="rent"
                        type="number"
                        value={formData.rent}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                rent: e.target.value,
                            })
                        }
                        placeholder="0"
                        required
                    />
                </div>
            </div>
            <div>
                <Label htmlFor="image" className="mb-1.5 block">
                    Image URL
                </Label>
                <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            image: e.target.value,
                        })
                    }
                    placeholder="Enter image URL"
                    required
                />
            </div>
            <div>
                <Label htmlFor="description" className="mb-1.5 block">
                    Description
                </Label>
                <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            description: e.target.value,
                        })
                    }
                    placeholder="Enter property description"
                    required
                />
            </div>
            <div className="flex space-x-2">
                <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? "Saving..." : property ? "Update Property" : "Create Property"}
                </Button>
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    )
} 