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
import { createUnit, deleteUnit, getUnitsByProperty, updateUnit } from "@/lib/actions/units"
import { Plus, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface Unit {
    id?: number
    name: string
    type: string
    rent: number
    status: string
}

interface Property {
    id: number
    name: string
    address: string
    type: string
    totalUnits: number | null
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
    onCancel?: () => void
}

export function PropertyForm({ property, onCancel }: PropertyFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [existingUnits, setExistingUnits] = useState<Unit[]>([])
    const [formData, setFormData] = useState({
        name: property?.name || "",
        address: property?.address || "",
        type: property?.type || "",
        totalUnits: property?.totalUnits?.toString() || "",
        rent: property?.rent?.toString() || "",
        description: property?.description || "",
        image: property?.image || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=60",
    })
    const [units, setUnits] = useState<Unit[]>([])

    // Load existing units when editing a property
    useEffect(() => {
        if (property?.id) {
            loadExistingUnits()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [property?.id, ])

    const loadExistingUnits = async () => {
        if (!property?.id) return
        try {
            const existingUnitsData = await getUnitsByProperty(property.id)
            setExistingUnits(existingUnitsData)
            
            // Initialize units array with existing units
            const initialUnits = existingUnitsData.map(unit => ({
                id: unit.id,
                name: unit.name,
                type: unit.type,
                rent: unit.rent,
                status: unit.status
            }))
            setUnits(initialUnits)
        } catch (error) {
            console.error("Error loading existing units:", error)
        }
    }

    const addUnit = () => {
        const newUnit: Unit = {
            name: "",
            type: formData.type || "apartment",
            rent: parseInt(formData.rent) || 0,
            status: "available"
        }
        setUnits([...units, newUnit])
    }

    const removeUnit = (index: number) => {
        const updatedUnits = units.filter((_, i) => i !== index)
        setUnits(updatedUnits)
    }

    const updateUnitForm = (index: number, field: keyof Unit, value: string | number) => {
        const updatedUnits = [...units]
        updatedUnits[index] = { ...updatedUnits[index], [field]: value }
        setUnits(updatedUnits)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const data = {
                name: formData.name,
                address: formData.address,
                type: formData.type,
                totalUnits: formData.totalUnits ? parseInt(formData.totalUnits) : null,
                rent: parseInt(formData.rent),
                description: formData.description,
                image: formData.image,
            }

            let propertyId: number

            if (property) {
                const updatedProperty = await updateProperty(property.id, data)
                propertyId = updatedProperty.id
                
                // Delete existing units that are no longer in the form
                const unitsToDelete = existingUnits.filter(existingUnit => 
                    !units.some(unit => unit.id === existingUnit.id)
                )
                
                for (const unitToDelete of unitsToDelete) {
                    if (unitToDelete.id) {
                        await deleteUnit(unitToDelete.id)
                    }
                }
            } else {
                const newProperty = await createProperty(data)
                propertyId = newProperty.id
            }

            // Create or update units
            for (const unit of units) {
                if (unit.id) {
                    // Update existing unit
                    await updateUnit(unit.id, {
                        name: unit.name,
                        type: unit.type,
                        rent: unit.rent,
                        status: unit.status,
                        propertyId
                    })
                } else {
                    // Create new unit
                    await createUnit({
                        name: unit.name,
                        type: unit.type,
                        rent: unit.rent,
                        status: unit.status,
                        propertyId
                    })
                }
            }

            toast.success(property ? "Property updated successfully" : "Property created successfully")
            
            // Navigate back to properties page
            router.push("/properties")
            router.refresh()
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

            {/* Units Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Units</Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addUnit}
                        className="flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add Unit
                    </Button>
                </div>
                
                {units.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                        No units added yet. Click &quot;Add Unit&quot; to get started.
                    </div>
                )}

                {units.map((unit, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Unit {index + 1}</Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeUnit(index)}
                                className="h-6 w-6 p-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor={`unit-name-${index}`} className="text-xs">
                                    Unit Name
                                </Label>
                                <Input
                                    id={`unit-name-${index}`}
                                    value={unit.name}
                                    onChange={(e) => updateUnitForm(index, 'name', e.target.value)}
                                    placeholder="e.g., Apartment 2A, Studio 1C"
                                    className="text-sm"
                                />
                            </div>
                            <div>
                                <Label htmlFor={`unit-type-${index}`} className="text-xs">
                                    Unit Type
                                </Label>
                                <Select
                                    value={unit.type}
                                    onValueChange={(value) => updateUnitForm(index, 'type', value)}
                                >
                                    <SelectTrigger className="text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="apartment">Apartment</SelectItem>
                                        <SelectItem value="studio">Studio</SelectItem>
                                        <SelectItem value="condo">Condo</SelectItem>
                                        <SelectItem value="house">House</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor={`unit-rent-${index}`} className="text-xs">
                                    Rent ($)
                                </Label>
                                <Input
                                    id={`unit-rent-${index}`}
                                    type="number"
                                    value={unit.rent}
                                    onChange={(e) => updateUnitForm(index, 'rent', parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                    className="text-sm"
                                />
                            </div>
                            <div>
                                <Label htmlFor={`unit-status-${index}`} className="text-xs">
                                    Status
                                </Label>
                                <Select
                                    value={unit.status}
                                    onValueChange={(value) => updateUnitForm(index, 'status', value)}
                                >
                                    <SelectTrigger className="text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="available">Available</SelectItem>
                                        <SelectItem value="occupied">Occupied</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                ))}
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