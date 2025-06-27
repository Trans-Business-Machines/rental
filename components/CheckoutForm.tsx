'use client'

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { createCheckoutReport, getBookingsForCheckout, getInventoryForUnit } from "@/lib/actions/checkout"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface Booking {
    id: number
    guest: {
        id: number
        firstName: string
        lastName: string
        email: string
    }
    property: {
        id: number
        name: string
    }
    unit: {
        id: number
        name: string
    }
    checkOutDate: Date
}

interface InventoryItem {
    id: number
    itemName: string
    category: string
    location: string
    condition: string
    status: string
}

interface CheckoutFormProps {
    onSuccess?: () => void
    onCancel?: () => void
}

export function CheckoutForm({ onSuccess, onCancel }: CheckoutFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [bookings, setBookings] = useState<Booking[]>([])
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
    const [formData, setFormData] = useState({
        checkoutDate: new Date().toISOString().split('T')[0],
        inspector: "",
        notes: "",
        depositDeduction: 0,
    })
    const [checkoutItems, setCheckoutItems] = useState<{
        [key: number]: {
            checked: boolean
            condition: string
            damageCost: number
            notes: string
        }
    }>({})

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const bookingsData = await getBookingsForCheckout()
                setBookings(bookingsData)
            } catch (error) {
                console.error("Error fetching bookings:", error)
                toast.error("Failed to load bookings")
            }
        }
        fetchBookings()
    }, [])

    useEffect(() => {
        const fetchInventory = async () => {
            if (selectedBooking) {
                try {
                    const inventoryData = await getInventoryForUnit(selectedBooking.unit.id)
                    setInventoryItems(inventoryData)
                    
                    // Initialize checkout items
                    const initialCheckoutItems: { [key: number]: any } = {}
                    inventoryData.forEach(item => {
                        initialCheckoutItems[item.id] = {
                            checked: false,
                            condition: "good",
                            damageCost: 0,
                            notes: "",
                        }
                    })
                    setCheckoutItems(initialCheckoutItems)
                } catch (error) {
                    console.error("Error fetching inventory:", error)
                    toast.error("Failed to load inventory")
                }
            } else {
                setInventoryItems([])
                setCheckoutItems({})
            }
        }
        fetchInventory()
    }, [selectedBooking])

    const handleBookingChange = (bookingId: string) => {
        const booking = bookings.find(b => b.id.toString() === bookingId)
        setSelectedBooking(booking || null)
    }

    const handleItemChange = (itemId: number, field: string, value: any) => {
        setCheckoutItems(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                [field]: value,
            }
        }))
    }

    const calculateTotalDamage = () => {
        return Object.values(checkoutItems).reduce((total, item) => {
            return total + (item.checked ? item.damageCost : 0)
        }, 0)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        if (!selectedBooking) {
            toast.error("Please select a booking")
            setIsLoading(false)
            return
        }

        try {
            const checkedItems = Object.entries(checkoutItems)
                .filter(([_, item]) => item.checked)
                .map(([itemId, item]) => ({
                    inventoryItemId: parseInt(itemId),
                    condition: item.condition,
                    damageCost: item.damageCost,
                    notes: item.notes || undefined,
                }))

            const data = {
                bookingId: selectedBooking.id,
                guestId: selectedBooking.guest.id,
                checkoutDate: new Date(formData.checkoutDate),
                inspector: formData.inspector,
                totalDamageCost: calculateTotalDamage(),
                depositDeduction: formData.depositDeduction,
                notes: formData.notes || undefined,
                checkoutItems: checkedItems,
            }

            await createCheckoutReport(data)
            toast.success("Checkout report created successfully")
            onSuccess?.()
        } catch (error) {
            toast.error("Failed to create checkout report")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const totalDamage = calculateTotalDamage()

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <Label htmlFor="booking">Guest & Booking</Label>
                    <Select onValueChange={handleBookingChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select guest booking" />
                        </SelectTrigger>
                        <SelectContent>
                            {bookings.map(booking => (
                                <SelectItem key={booking.id} value={booking.id.toString()}>
                                    {booking.guest.firstName} {booking.guest.lastName} - {booking.property.name} {booking.unit.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="checkout-date">Checkout Date</Label>
                    <Input
                        id="checkout-date"
                        type="date"
                        value={formData.checkoutDate}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                checkoutDate: e.target.value,
                            })
                        }
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="inspector">Inspector</Label>
                    <Input
                        id="inspector"
                        value={formData.inspector}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                inspector: e.target.value,
                            })
                        }
                        placeholder="Inspector name"
                        required
                    />
                </div>
            </div>

            {selectedBooking && inventoryItems.length > 0 && (
                <>
                    <div>
                        <h3 className="font-medium mb-4">Inventory Checklist - {selectedBooking.property.name} {selectedBooking.unit.name}</h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto border rounded-lg p-4">
                            {inventoryItems.map((item) => {
                                const itemData = checkoutItems[item.id] || { checked: false, condition: "good", damageCost: 0, notes: "" }
                                return (
                                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                checked={itemData.checked}
                                                onCheckedChange={(checked) =>
                                                    handleItemChange(item.id, "checked", checked)
                                                }
                                            />
                                            <div>
                                                <p className="font-medium">{item.itemName}</p>
                                                <p className="text-sm text-muted-foreground">{item.location} • {item.category}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Select
                                                value={itemData.condition}
                                                onValueChange={(value) =>
                                                    handleItemChange(item.id, "condition", value)
                                                }
                                            >
                                                <SelectTrigger className="w-24">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="good">Good</SelectItem>
                                                    <SelectItem value="damaged">Damaged</SelectItem>
                                                    <SelectItem value="missing">Missing</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                placeholder="Damage cost"
                                                type="number"
                                                className="w-24"
                                                value={itemData.damageCost}
                                                onChange={(e) =>
                                                    handleItemChange(item.id, "damageCost", parseInt(e.target.value) || 0)
                                                }
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="checkout-notes">Inspection Notes</Label>
                        <Textarea
                            id="checkout-notes"
                            value={formData.notes}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    notes: e.target.value,
                                })
                            }
                            placeholder="Overall condition notes, guest cooperation, etc..."
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="deposit-deduction">Deposit Deduction (KES)</Label>
                            <Input
                                id="deposit-deduction"
                                type="number"
                                value={formData.depositDeduction}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        depositDeduction: parseInt(e.target.value) || 0,
                                    })
                                }
                                placeholder="0"
                            />
                        </div>
                        <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                            <span className="font-medium">Total Damage Cost:</span>
                            <span className="text-lg font-bold">KES {totalDamage.toLocaleString()}</span>
                        </div>
                    </div>
                </>
            )}

            <div className="flex space-x-2">
                <Button type="submit" disabled={isLoading || !selectedBooking} className="flex-1">
                    {isLoading ? "Processing..." : "Complete Checkout"}
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