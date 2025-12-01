import { Wifi, Car, Dumbbell, Waves, Coffee } from "lucide-react"

/* interface Amenity {
    icon: React.ComponentType<{ className?: string }>
    label: string
} */

/* export interface Property {
    id: number,
    name: string,
    address: string,
    status: string,
    images: string[],
    description: string,
    rent: string | number,
    type: string,
    bathrooms: string,
    units: number | string,
    bedrooms: string,
    maxGuests: number
    amenities: Amenity[]
} */

/* interface Tenant {
    id: string | number
    name: string,
    phone: string,
    email: string,
    leaseStart: Date
}
 */







export const amenities = [
    {
        icon: Wifi,
        label: "High speed wifi"
    }, {
        icon: Car,
        label: "Underground Parking",
    }, {

        icon: Dumbbell,
        label: "Fitness center"
    }, {

        icon: Waves,
        label: "Rooftop pool"
    },
    {

        icon: Coffee,
        label: "Common lounge"
    }
]

export const propertyImages = [
    "/front_view.png",
    "/gym.png",
    "/lounge.jpg",
    "/parking.png",
    "/rooftop_pool.jpg"
]

