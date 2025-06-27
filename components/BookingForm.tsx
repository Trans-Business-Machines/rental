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
import { createBooking } from "@/lib/actions/bookings"
import { getGuests } from "@/lib/actions/guests"
import { getAllPropertiesWithUnits } from "@/lib/actions/properties"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface Guest {
    id: number
    firstName: string
    lastName: string
    email: string
    phone: string
}

interface Property {
    id: number
    name: string
    units: {
        id: number
        name: string
    }[]
}

interface BookingFormProps {
    onSuccess?: () => void
    onCancel?: () => void
}

export function BookingForm({ onSuccess, onCancel }: BookingFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [guests, setGuests] = useState<Guest[]>([])
    const [properties, setProperties] = useState<Property[]>([])
    const [formData, setFormData] = useState({
        guestId: "",
        propertyId: "",
        unitId: "",
        checkInDate: "",
        checkOutDate: "",
        numberOfGuests: "1",
        totalAmount: "",
        source: "",
        purpose: "",
        specialRequests: "",
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [guestsData, propertiesData] = await Promise.all([
                    getGuests(),
                    getAllPropertiesWithUnits(),
                ])
                setGuests(guestsData)
                setProperties(propertiesData)
            } catch (error) {
                console.error("Error fetching data:", error)
                toast.error("Failed to load form data")
            }
        }
        fetchData()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const data = {
                guestId: parseInt(formData.guestId),
                propertyId: parseInt(formData.propertyId),
                unitId: parseInt(formData.unitId),
                checkInDate: new Date(formData.checkInDate),
                checkOutDate: new Date(formData.checkOutDate),
                numberOfGuests: parseInt(formData.numberOfGuests),
                totalAmount: parseInt(formData.totalAmount),
                source: formData.source,
                purpose: formData.purpose,
                specialRequests: formData.specialRequests || undefined,
            }

            await createBooking(data)
            toast.success("Booking created successfully")
            onSuccess?.()
        } catch (error) {
            toast.error("Failed to create booking")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const selectedProperty = properties.find(p => p.id.toString() === formData.propertyId)
    const availableUnits = selectedProperty?.units || []

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="guestId">Guest</Label>
                    <Select
                        value={formData.guestId}
                        onValueChange={(value) =>
                            setFormData({
                                ...formData,
                                guestId: value,
                            })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select guest" />
                        </SelectTrigger>
                        <SelectContent>
                            {guests.map(guest => (
                                <SelectItem key={guest.id} value={guest.id.toString()}>
                                    {guest.firstName} {guest.lastName} - {guest.email}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="propertyId">Property</Label>
                    <Select
                        value={formData.propertyId}
                        onValueChange={(value) =>
                            setFormData({
                                ...formData,
                                propertyId: value,
                                unitId: "", // Reset unit when property changes
                            })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select property" />
                        </SelectTrigger>
                        <SelectContent>
                            {properties.map(property => (
                                <SelectItem key={property.id} value={property.id.toString()}>
                                    {property.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="unitId">Unit</Label>
                    <Select
                        value={formData.unitId}
                        onValueChange={(value) =>
                            setFormData({
                                ...formData,
                                unitId: value,
                            })
                        }
                        disabled={!formData.propertyId}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableUnits.map(unit => (
                                <SelectItem key={unit.id} value={unit.id.toString()}>
                                    {unit.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="numberOfGuests">Number of Guests</Label>
                    <Input
                        id="numberOfGuests"
                        type="number"
                        min="1"
                        value={formData.numberOfGuests}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                numberOfGuests: e.target.value,
                            })
                        }
                        placeholder="1"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="checkInDate">Check-in Date</Label>
                    <Input
                        id="checkInDate"
                        type="date"
                        value={formData.checkInDate}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                checkInDate: e.target.value,
                            })
                        }
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="checkOutDate">Check-out Date</Label>
                    <Input
                        id="checkOutDate"
                        type="date"
                        value={formData.checkOutDate}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                checkOutDate: e.target.value,
                            })
                        }
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="totalAmount">Total Amount (KES)</Label>
                    <Input
                        id="totalAmount"
                        type="number"
                        value={formData.totalAmount}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                totalAmount: e.target.value,
                            })
                        }
                        placeholder="0"
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="source">Booking Source</Label>
                    <Select
                        value={formData.source}
                        onValueChange={(value) =>
                            setFormData({
                                ...formData,
                                source: value,
                            })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="direct">Direct</SelectItem>
                            <SelectItem value="airbnb">Airbnb</SelectItem>
                            <SelectItem value="booking">Booking.com</SelectItem>
                            <SelectItem value="phone">Phone</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div>
                <Label htmlFor="purpose">Purpose of Visit</Label>
                <Select
                    value={formData.purpose}
                    onValueChange={(value) =>
                        setFormData({
                            ...formData,
                            purpose: value,
                        })
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="tourism">Tourism</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="family">Family</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label htmlFor="specialRequests">Special Requests</Label>
                <Textarea
                    id="specialRequests"
                    value={formData.specialRequests}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            specialRequests: e.target.value,
                        })
                    }
                    placeholder="Any special requests..."
                    rows={3}
                />
            </div>

            <div className="flex space-x-2">
                <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? "Creating..." : "Create Booking"}
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