'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCreateGuest } from "@/hooks/useGuests"
import { useState } from "react"

interface Guest {
    id: number
    firstName: string
    lastName: string
    email: string
    phone: string
    nationality?: string | null
    idType?: string | null
    idNumber?: string | null
    passportNumber?: string | null
    dateOfBirth?: string | null
    address?: string | null
    city?: string | null
    country?: string | null
    occupation?: string | null
    employer?: string | null
    emergencyContactName?: string | null
    emergencyContactPhone?: string | null
    emergencyContactRelation?: string | null
    notes?: string | null
    createdAt: Date | null
    updatedAt: Date | null
}

interface GuestFormProps {
    guest?: Guest | null
    onSuccess?: (guest?: Guest) => void
    onCancel?: () => void
}

export function GuestForm({ guest, onSuccess, onCancel }: GuestFormProps) {
    const createGuestMutation = useCreateGuest()
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

        const data = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            idNumber: formData.idPassportNumber,
            passportNumber: formData.idPassportNumber,
            notes: formData.notes || undefined,
        }

        createGuestMutation.mutate(data, {
            onSuccess: (newGuest) => {
                onSuccess?.(newGuest)
            }
        })
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
                <Button 
                    type="submit" 
                    disabled={createGuestMutation.isPending} 
                    className="flex-1"
                >
                    {createGuestMutation.isPending ? "Creating..." : "Create Guest"}
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