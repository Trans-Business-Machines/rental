'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createGuest } from "@/lib/actions/guests"
import { useState } from "react"
import { toast } from "sonner"

interface Guest {
    id: number
    firstName: string
    lastName: string
    email: string
    phone: string
    nationality: string
    idType: string
    idNumber?: string
    passportNumber?: string
    dateOfBirth: string
    address: string
    city: string
    country: string
    occupation?: string
    employer?: string
    emergencyContactName: string
    emergencyContactPhone: string
    emergencyContactRelation: string
    notes?: string
    createdAt: Date
    updatedAt: Date
}

interface GuestFormProps {
    guest?: Guest | null
    onSuccess?: () => void
    onCancel?: () => void
}

export function GuestForm({ guest, onSuccess, onCancel }: GuestFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        firstName: guest?.firstName || "",
        lastName: guest?.lastName || "",
        email: guest?.email || "",
        phone: guest?.phone || "",
        idPassportNumber: guest?.idNumber || guest?.passportNumber || "",
        notes: guest?.notes || "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const data = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                idNumber: formData.idPassportNumber,
                passportNumber: formData.idPassportNumber,
                notes: formData.notes || undefined,
            }

            await createGuest(data)
            toast.success("Guest created successfully")
            onSuccess?.()
        } catch (error) {
            toast.error("Failed to create guest")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                firstName: e.target.value,
                            })
                        }
                        placeholder="First name"
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                lastName: e.target.value,
                            })
                        }
                        placeholder="Last name"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                email: e.target.value,
                            })
                        }
                        placeholder="Email address"
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="phone">Mobile No.</Label>
                    <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                phone: e.target.value,
                            })
                        }
                        placeholder="Mobile number"
                        required
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="idPassportNumber">ID/Passport Number</Label>
                <Input
                    id="idPassportNumber"
                    value={formData.idPassportNumber}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            idPassportNumber: e.target.value,
                        })
                    }
                    placeholder="ID or Passport Number"
                    required
                />
            </div>

            <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            notes: e.target.value,
                        })
                    }
                    placeholder="Additional notes about the guest"
                    rows={3}
                />
            </div>

            <div className="flex space-x-2">
                <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? "Creating..." : "Create Guest"}
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