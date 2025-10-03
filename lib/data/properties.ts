import { Wifi, Car, Dumbbell, Waves, Coffee } from "lucide-react"

interface Amenity {
    icon: React.ComponentType<{ className?: string }>
    label: string
}

export interface Property {
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
}

interface Tenant {
    id: string | number
    name: string,
    phone: string,
    email: string,
    leaseStart: Date
}


export interface Unit {
    id: string | number,
    name: string,
    propertyId: string,
    status: "available" | "occupied" | "maintenance",
    type: string,
    rent: number,
    bedrooms: number,
    bathrooms: number,
    maxGuests: number,
    images: string[],
    tenant?: Tenant
}


export const mockProperty: Property = {
    id: 1,
    name: "Luxcity Apartments",
    units: 12,
    address: "Upperhill Mara rd",
    status: "active",
    description: "Experience Life extra ordinary not just ordinary",
    rent: 300,
    type: "Apartment",
    bathrooms: "1",
    bedrooms: "2",
    maxGuests: 4,
    amenities: [
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
    ],
    images: [
        "/front_view.png",
        "/gym.png",
        "/lounge.jpg",
        "/parking.png",
        "/rooftop_pool.jpg"
    ]
}

export const mockUnits: Unit[] = [
    {
        id: "1",
        name: "Apartment 2.1",
        propertyId: "1",
        status: "available",
        type: "Villa",
        rent: 1500,
        bedrooms: 2,
        bathrooms: 1,
        maxGuests: 2,
        images: [
            "/room_interior.jpg",
            "/gym.png",
            "/lounge.jpg",
            "/rooftop_pool.jpg",
        ],
    },
    {
        id: "2",
        name: "Apartment 2.2",
        propertyId: "1",
        status: "maintenance",
        type: "Villa",
        rent: 1500,
        bedrooms: 2,
        bathrooms: 1,
        maxGuests: 2,
        images: [
            "/room_interior.jpg",
            "/gym.png",
            "/lounge.jpg",
            "/rooftop_pool.jpg",
        ],
    },
    {
        id: "3",
        name: "Apartment 2.3",
        propertyId: "1",
        status: "occupied",
        type: "Villa",
        rent: 1500,
        bedrooms: 2,
        bathrooms: 1,
        maxGuests: 2,
        images: [
            "/room_interior.jpg",
            "/gym.png",
            "/lounge.jpg",
            "/rooftop_pool.jpg",
        ],
        tenant: {
            id: "1",
            name: "John Doe",
            email: "john@gmail.com",
            phone: "0712345678",
            leaseStart: new Date(2025, 6, 21)
        }
    },
    {
        id: "4",
        name: "Apartment 2.4",
        propertyId: "1",
        status: "available",
        type: "Villa",
        rent: 1500,
        bedrooms: 2,
        bathrooms: 1,
        maxGuests: 2,
        images: [
            "/room_interior.jpg",
            "/gym.png",
            "/lounge.jpg",
            "/rooftop_pool.jpg",
        ],
    }
]

