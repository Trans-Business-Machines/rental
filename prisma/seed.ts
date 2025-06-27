import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
	// Create amenities first
	const amenities = await Promise.all([
		prisma.amenity.create({
			data: {
				name: "Swimming Pool",
				description: "Outdoor swimming pool with lounge area",
				icon: "Pool",
			},
		}),
		prisma.amenity.create({
			data: {
				name: "Fitness Center",
				description: "24/7 access to modern fitness equipment",
				icon: "Dumbbell",
			},
		}),
		prisma.amenity.create({
			data: {
				name: "Parking",
				description: "Covered parking available for all residents",
				icon: "Car",
			},
		}),
		prisma.amenity.create({
			data: {
				name: "Garden",
				description: "Beautiful communal garden space",
				icon: "Flower",
			},
		}),
		prisma.amenity.create({
			data: {
				name: "Bike Storage",
				description: "Secure bike storage facility",
				icon: "Bike",
			},
		}),
		prisma.amenity.create({
			data: {
				name: "Concierge",
				description: "24/7 concierge service",
				icon: "User",
			},
		}),
		prisma.amenity.create({
			data: {
				name: "Rooftop Terrace",
				description: "Exclusive rooftop terrace with city views",
				icon: "Sun",
			},
		}),
		prisma.amenity.create({
			data: {
				name: "Security",
				description: "24/7 security and surveillance",
				icon: "Shield",
			},
		}),
	]);

	// Create properties
	const property1 = await prisma.property.create({
		data: {
			name: "Sunset Apartments",
			address: "123 Main Street, Downtown",
			type: "apartment",
			units: 12,
			occupied: 11,
			rent: 1200,
			status: "active",
			description: "Modern apartment complex with amenities",
			image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=60",
			amenities: {
				connect: [
					{ id: amenities[0].id }, // Swimming Pool
					{ id: amenities[1].id }, // Fitness Center
					{ id: amenities[2].id }, // Parking
				],
			},
		},
	});

	const property2 = await prisma.property.create({
		data: {
			name: "Garden View Studios",
			address: "456 Oak Avenue, Midtown",
			type: "studio",
			units: 8,
			occupied: 7,
			rent: 950,
			status: "active",
			description: "Cozy studio apartments with garden views",
			image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=60",
			amenities: {
				connect: [
					{ id: amenities[3].id }, // Garden
					{ id: amenities[4].id }, // Bike Storage
				],
			},
		},
	});

	const property3 = await prisma.property.create({
		data: {
			name: "Executive Condos",
			address: "789 Pine Street, Uptown",
			type: "condo",
			units: 6,
			occupied: 6,
			rent: 2500,
			status: "active",
			description: "Luxury condominiums for executives",
			image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=60",
			amenities: {
				connect: [
					{ id: amenities[5].id }, // Concierge
					{ id: amenities[6].id }, // Rooftop Terrace
					{ id: amenities[7].id }, // Security
				],
			},
		},
	});

	const property4 = await prisma.property.create({
		data: {
			name: "Student Housing Complex",
			address: "321 University Drive, Campus",
			type: "apartment",
			units: 20,
			occupied: 18,
			rent: 800,
			status: "active",
			description: "Affordable housing near university",
			image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=60",
			amenities: {
				connect: [
					{ id: amenities[1].id }, // Fitness Center
					{ id: amenities[2].id }, // Parking
				],
			},
		},
	});

	// Create tenants
	await Promise.all([
		prisma.tenant.create({
			data: {
				name: "John Doe",
				email: "john@example.com",
				phone: "555-0123",
				unitNumber: "101",
				leaseStart: "2024-01-01",
				leaseEnd: "2024-12-31",
				rent: 1200,
				status: "active",
				propertyId: property1.id,
			},
		}),
		prisma.tenant.create({
			data: {
				name: "Jane Smith",
				email: "jane@example.com",
				phone: "555-0124",
				unitNumber: "102",
				leaseStart: "2024-02-01",
				leaseEnd: "2025-01-31",
				rent: 1200,
				status: "active",
				propertyId: property1.id,
			},
		}),
		prisma.tenant.create({
			data: {
				name: "Mike Johnson",
				email: "mike@example.com",
				phone: "555-0125",
				unitNumber: "201",
				leaseStart: "2024-01-15",
				leaseEnd: "2024-12-14",
				rent: 950,
				status: "active",
				propertyId: property2.id,
			},
		}),
		prisma.tenant.create({
			data: {
				name: "Sarah Wilson",
				email: "sarah@example.com",
				phone: "555-0126",
				unitNumber: "301",
				leaseStart: "2024-03-01",
				leaseEnd: "2025-02-28",
				rent: 2500,
				status: "active",
				propertyId: property3.id,
			},
		}),
		prisma.tenant.create({
			data: {
				name: "Alex Brown",
				email: "alex@example.com",
				phone: "555-0127",
				unitNumber: "401",
				leaseStart: "2024-01-01",
				leaseEnd: "2024-12-31",
				rent: 800,
				status: "active",
				propertyId: property4.id,
			},
		}),
	]);

	console.log("Database seeded successfully!");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
