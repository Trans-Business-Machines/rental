export interface Tenant {
	id: number;
	name: string;
	email: string;
	phone: string;
	unitNumber: string;
	leaseStart: string;
	leaseEnd: string;
	rent: number;
	status: "active" | "pending" | "inactive";
}

export interface Amenity {
	id: number;
	name: string;
	description: string;
	icon: string;
}

export interface Property {
	id: number;
	name: string;
	address: string;
	type: string;
	units: number;
	occupied: number;
	rent: number;
	status: string;
	description: string;
	image: string;
	tenants: Tenant[];
	amenities: Amenity[];
}

export const mockProperties: Property[] = [
	{
		id: 1,
		name: "Sunset Apartments",
		address: "123 Main Street, Downtown",
		type: "apartment",
		units: 12,
		occupied: 11,
		rent: 1200,
		status: "active",
		description: "Modern apartment complex with amenities",
		image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=60",
		tenants: [
			{
				id: 1,
				name: "John Doe",
				email: "john@example.com",
				phone: "555-0123",
				unitNumber: "101",
				leaseStart: "2024-01-01",
				leaseEnd: "2024-12-31",
				rent: 1200,
				status: "active",
			},
			{
				id: 2,
				name: "Jane Smith",
				email: "jane@example.com",
				phone: "555-0124",
				unitNumber: "102",
				leaseStart: "2024-02-01",
				leaseEnd: "2025-01-31",
				rent: 1200,
				status: "active",
			},
		],
		amenities: [
			{
				id: 1,
				name: "Swimming Pool",
				description: "Outdoor swimming pool with lounge area",
				icon: "Pool",
			},
			{
				id: 2,
				name: "Fitness Center",
				description: "24/7 access to modern fitness equipment",
				icon: "Dumbbell",
			},
			{
				id: 3,
				name: "Parking",
				description: "Covered parking available for all residents",
				icon: "Car",
			},
		],
	},
	{
		id: 2,
		name: "Garden View Studios",
		address: "456 Oak Avenue, Midtown",
		type: "studio",
		units: 8,
		occupied: 7,
		rent: 950,
		status: "active",
		description: "Cozy studio apartments with garden views",
		image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=60",
		tenants: [
			{
				id: 3,
				name: "Mike Johnson",
				email: "mike@example.com",
				phone: "555-0125",
				unitNumber: "201",
				leaseStart: "2024-01-15",
				leaseEnd: "2024-12-14",
				rent: 950,
				status: "active",
			},
		],
		amenities: [
			{
				id: 1,
				name: "Garden",
				description: "Beautiful communal garden space",
				icon: "Flower",
			},
			{
				id: 2,
				name: "Bike Storage",
				description: "Secure bike storage facility",
				icon: "Bike",
			},
		],
	},
	{
		id: 3,
		name: "Executive Condos",
		address: "789 Pine Street, Uptown",
		type: "condo",
		units: 6,
		occupied: 6,
		rent: 2500,
		status: "active",
		description: "Luxury condominiums for executives",
		image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=60",
		tenants: [
			{
				id: 4,
				name: "Sarah Wilson",
				email: "sarah@example.com",
				phone: "555-0126",
				unitNumber: "301",
				leaseStart: "2024-03-01",
				leaseEnd: "2025-02-28",
				rent: 2500,
				status: "active",
			},
		],
		amenities: [
			{
				id: 1,
				name: "Concierge",
				description: "24/7 concierge service",
				icon: "User",
			},
			{
				id: 2,
				name: "Rooftop Terrace",
				description: "Exclusive rooftop terrace with city views",
				icon: "Sun",
			},
			{
				id: 3,
				name: "Security",
				description: "24/7 security and surveillance",
				icon: "Shield",
			},
		],
	},
	{
		id: 4,
		name: "Student Housing Complex",
		address: "321 University Drive, Campus",
		type: "apartment",
		units: 20,
		occupied: 18,
		rent: 800,
		status: "active",
		description: "Affordable housing near university",
		image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=60",
		tenants: [
			{
				id: 5,
				name: "Alex Brown",
				email: "alex@example.com",
				phone: "555-0127",
				unitNumber: "401",
				leaseStart: "2024-01-01",
				leaseEnd: "2024-12-31",
				rent: 800,
				status: "active",
			},
		],
		amenities: [
			{
				id: 1,
				name: "Study Rooms",
				description: "Quiet study rooms with high-speed internet",
				icon: "Book",
			},
			{
				id: 2,
				name: "Laundry",
				description: "On-site laundry facilities",
				icon: "WashingMachine",
			},
			{
				id: 3,
				name: "Common Room",
				description: "Large common room for socializing",
				icon: "Users",
			},
		],
	},
];
