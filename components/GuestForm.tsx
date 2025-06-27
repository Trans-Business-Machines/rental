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
        nationality: guest?.nationality || "",
        idType: guest?.idType || "National ID",
        idNumber: guest?.idNumber || "",
        passportNumber: guest?.passportNumber || "",
        dateOfBirth: guest?.dateOfBirth || "",
        address: guest?.address || "",
        city: guest?.city || "",
        country: guest?.country || "",
        occupation: guest?.occupation || "",
        employer: guest?.employer || "",
        emergencyContactName: guest?.emergencyContactName || "",
        emergencyContactPhone: guest?.emergencyContactPhone || "",
        emergencyContactRelation: guest?.emergencyContactRelation || "",
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
                nationality: formData.nationality,
                idType: formData.idType,
                idNumber: formData.idNumber || undefined,
                passportNumber: formData.passportNumber || undefined,
                dateOfBirth: formData.dateOfBirth,
                address: formData.address,
                city: formData.city,
                country: formData.country,
                occupation: formData.occupation || undefined,
                employer: formData.employer || undefined,
                emergencyContactName: formData.emergencyContactName,
                emergencyContactPhone: formData.emergencyContactPhone,
                emergencyContactRelation: formData.emergencyContactRelation,
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
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                phone: e.target.value,
                            })
                        }
                        placeholder="Phone number"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input
                        id="nationality"
                        value={formData.nationality}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                nationality: e.target.value,
                            })
                        }
                        placeholder="Nationality"
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                dateOfBirth: e.target.value,
                            })
                        }
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="idType">ID Type</Label>
                    <Select
                        value={formData.idType}
                        onValueChange={(value) =>
                            setFormData({
                                ...formData,
                                idType: value,
                            })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="National ID">National ID</SelectItem>
                            <SelectItem value="Passport">Passport</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="idNumber">
                        {formData.idType === "National ID" ? "ID Number" : "Passport Number"}
                    </Label>
                    <Input
                        id="idNumber"
                        value={formData.idType === "National ID" ? formData.idNumber : formData.passportNumber}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                [formData.idType === "National ID" ? "idNumber" : "passportNumber"]: e.target.value,
                            })
                        }
                        placeholder={formData.idType === "National ID" ? "ID Number" : "Passport Number"}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                country: e.target.value,
                            })
                        }
                        placeholder="Country"
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                city: e.target.value,
                            })
                        }
                        placeholder="City"
                        required
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="address">Address</Label>
                <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            address: e.target.value,
                        })
                    }
                    placeholder="Full address"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                        id="occupation"
                        value={formData.occupation}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                occupation: e.target.value,
                            })
                        }
                        placeholder="Occupation"
                    />
                </div>
                <div>
                    <Label htmlFor="employer">Employer</Label>
                    <Input
                        id="employer"
                        value={formData.employer}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                employer: e.target.value,
                            })
                        }
                        placeholder="Employer"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                    <Input
                        id="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                emergencyContactName: e.target.value,
                            })
                        }
                        placeholder="Emergency contact name"
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                    <Input
                        id="emergencyContactPhone"
                        value={formData.emergencyContactPhone}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                emergencyContactPhone: e.target.value,
                            })
                        }
                        placeholder="Emergency contact phone"
                        required
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="emergencyContactRelation">Relationship to Guest</Label>
                <Input
                    id="emergencyContactRelation"
                    value={formData.emergencyContactRelation}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            emergencyContactRelation: e.target.value,
                        })
                    }
                    placeholder="e.g., Spouse, Parent, Friend"
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