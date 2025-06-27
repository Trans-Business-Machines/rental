'use client'

import { CheckoutForm } from "@/components/CheckoutForm"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ClipboardList } from "lucide-react"
import { useState } from "react"

export function CheckoutDialog() {
    const [open, setOpen] = useState(false)

    const handleSuccess = () => {
        setOpen(false)
    }

    const handleCancel = () => {
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Guest Checkout
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Guest Checkout Inspection</DialogTitle>
                </DialogHeader>
                <CheckoutForm onSuccess={handleSuccess} onCancel={handleCancel} />
            </DialogContent>
        </Dialog>
    )
} 