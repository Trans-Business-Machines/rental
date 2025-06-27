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
			totalUnits: 12,
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
			totalUnits: 8,
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
			totalUnits: 6,
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
			totalUnits: 20,
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

	// Create units for properties
	const units = await Promise.all([
		// Units for Sunset Apartments
		prisma.unit.create({
			data: {
				name: "Apartment 1A",
				propertyId: property1.id,
				type: "apartment",
				status: "occupied",
				rent: 1200,
			},
		}),
		prisma.unit.create({
			data: {
				name: "Apartment 2A",
				propertyId: property1.id,
				type: "apartment",
				status: "occupied",
				rent: 1200,
			},
		}),
		prisma.unit.create({
			data: {
				name: "Apartment 3A",
				propertyId: property1.id,
				type: "apartment",
				status: "available",
				rent: 1200,
			},
		}),
		// Units for Garden View Studios
		prisma.unit.create({
			data: {
				name: "Studio 1A",
				propertyId: property2.id,
				type: "studio",
				status: "occupied",
				rent: 950,
			},
		}),
		prisma.unit.create({
			data: {
				name: "Studio 2A",
				propertyId: property2.id,
				type: "studio",
				status: "occupied",
				rent: 950,
			},
		}),
		// Units for Executive Condos
		prisma.unit.create({
			data: {
				name: "Condo 1A",
				propertyId: property3.id,
				type: "condo",
				status: "occupied",
				rent: 2500,
			},
		}),
		prisma.unit.create({
			data: {
				name: "Condo 2A",
				propertyId: property3.id,
				type: "condo",
				status: "occupied",
				rent: 2500,
			},
		}),
	]);

	// Create inventory items
	await Promise.all([
		prisma.inventoryItem.create({
			data: {
				propertyId: property1.id,
				unitId: units[0].id, // Apartment 1A
				category: "Furniture",
				itemName: "Queen Bed",
				description: "Comfortable queen-size bed with mattress",
				quantity: 1,
				condition: "Good",
				purchaseDate: new Date("2023-01-15"),
				purchasePrice: 80000,
				currentValue: 60000,
				location: "Bedroom",
				serialNumber: "QB-001",
				supplier: "Furniture World",
				status: "active",
			},
		}),
		prisma.inventoryItem.create({
			data: {
				propertyId: property1.id,
				unitId: units[0].id, // Apartment 1A
				category: "Electronics",
				itemName: "Smart TV",
				description: "55-inch 4K Smart TV",
				quantity: 1,
				condition: "Excellent",
				purchaseDate: new Date("2023-02-10"),
				purchasePrice: 120000,
				currentValue: 100000,
				location: "Living Room",
				serialNumber: "TV-001",
				supplier: "Electronics Plus",
				status: "active",
			},
		}),
		prisma.inventoryItem.create({
			data: {
				propertyId: property1.id,
				unitId: units[1].id, // Apartment 2A
				category: "Appliances",
				itemName: "Refrigerator",
				description: "Side-by-side refrigerator with ice maker",
				quantity: 1,
				condition: "Good",
				purchaseDate: new Date("2023-01-20"),
				purchasePrice: 150000,
				currentValue: 120000,
				location: "Kitchen",
				serialNumber: "FRIDGE-001",
				supplier: "Appliance Store",
				status: "active",
			},
		}),
		prisma.inventoryItem.create({
			data: {
				propertyId: property2.id,
				unitId: units[3].id, // Studio 1A
				category: "Furniture",
				itemName: "Sofa Bed",
				description: "Convertible sofa bed for studio apartment",
				quantity: 1,
				condition: "Fair",
				purchaseDate: new Date("2022-12-05"),
				purchasePrice: 60000,
				currentValue: 40000,
				location: "Living Area",
				serialNumber: "SOFA-001",
				supplier: "Studio Furniture",
				status: "active",
			},
		}),
		prisma.inventoryItem.create({
			data: {
				propertyId: property3.id,
				unitId: units[5].id, // Condo 1A
				category: "Electronics",
				itemName: "Washing Machine",
				description: "Front-loading washing machine",
				quantity: 1,
				condition: "Excellent",
				purchaseDate: new Date("2023-03-15"),
				purchasePrice: 80000,
				currentValue: 70000,
				location: "Laundry Room",
				serialNumber: "WM-001",
				supplier: "Home Appliances",
				status: "active",
			},
		}),
	]);

	// Create guests
	await Promise.all([
		prisma.guest.create({
			data: {
				firstName: "John",
				lastName: "Doe",
				email: "john.doe@example.com",
				phone: "+254700123456",
				nationality: "Kenyan",
				idType: "National ID",
				idNumber: "12345678",
				dateOfBirth: "1990-05-15",
				address: "123 Main Street, Nairobi",
				city: "Nairobi",
				country: "Kenya",
				occupation: "Software Engineer",
				employer: "Tech Corp",
				emergencyContactName: "Jane Doe",
				emergencyContactPhone: "+254700123457",
				emergencyContactRelation: "Spouse",
				verificationStatus: "verified",
				notes: "Regular guest, prefers quiet rooms",
			},
		}),
		prisma.guest.create({
			data: {
				firstName: "Sarah",
				lastName: "Mitchell",
				email: "sarah.mitchell@example.com",
				phone: "+254700123458",
				nationality: "American",
				idType: "Passport",
				passportNumber: "US123456789",
				dateOfBirth: "1985-08-22",
				address: "456 Oak Avenue, New York",
				city: "New York",
				country: "USA",
				occupation: "Marketing Manager",
				employer: "Global Marketing",
				emergencyContactName: "Mike Mitchell",
				emergencyContactPhone: "+254700123459",
				emergencyContactRelation: "Husband",
				verificationStatus: "verified",
				notes: "Business traveler, needs early check-in",
			},
		}),
		prisma.guest.create({
			data: {
				firstName: "James",
				lastName: "Kimani",
				email: "james.kimani@example.com",
				phone: "+254700123460",
				nationality: "Kenyan",
				idType: "National ID",
				idNumber: "87654321",
				dateOfBirth: "1992-12-10",
				address: "789 Pine Street, Mombasa",
				city: "Mombasa",
				country: "Kenya",
				occupation: "Tour Guide",
				employer: "Safari Tours",
				emergencyContactName: "Mary Kimani",
				emergencyContactPhone: "+254700123461",
				emergencyContactRelation: "Mother",
				verificationStatus: "pending",
				notes: "New guest, first time staying",
			},
		}),
		prisma.guest.create({
			data: {
				firstName: "Emma",
				lastName: "Wilson",
				email: "emma.wilson@example.com",
				phone: "+254700123462",
				nationality: "British",
				idType: "Passport",
				passportNumber: "GB987654321",
				dateOfBirth: "1988-03-18",
				address: "321 University Drive, London",
				city: "London",
				country: "UK",
				occupation: "Teacher",
				employer: "International School",
				emergencyContactName: "David Wilson",
				emergencyContactPhone: "+254700123463",
				emergencyContactRelation: "Brother",
				verificationStatus: "verified",
				notes: "Long-term guest, extended stay",
			},
		}),
	]);

	// Create bookings
	await Promise.all([
		prisma.booking.create({
			data: {
				guestId: 1, // John Doe
				propertyId: property1.id, // Sunset Apartments
				unitId: units[0].id, // Apartment 1A
				checkInDate: new Date("2024-01-15"),
				checkOutDate: new Date("2024-01-20"),
				numberOfGuests: 2,
				totalAmount: 6000,
				source: "direct",
				purpose: "business",
				specialRequests: "Early check-in preferred",
				status: "confirmed",
			},
		}),
		prisma.booking.create({
			data: {
				guestId: 2, // Sarah Mitchell
				propertyId: property2.id, // Garden View Studios
				unitId: units[3].id, // Studio 1A
				checkInDate: new Date("2024-02-01"),
				checkOutDate: new Date("2024-02-05"),
				numberOfGuests: 1,
				totalAmount: 3800,
				source: "airbnb",
				purpose: "tourism",
				specialRequests: "Late check-out if possible",
				status: "confirmed",
			},
		}),
		prisma.booking.create({
			data: {
				guestId: 3, // James Kimani
				propertyId: property1.id, // Sunset Apartments
				unitId: units[1].id, // Apartment 2A
				checkInDate: new Date("2024-02-10"),
				checkOutDate: new Date("2024-02-15"),
				numberOfGuests: 3,
				totalAmount: 7500,
				source: "booking",
				purpose: "family",
				specialRequests: "Extra towels needed",
				status: "pending",
			},
		}),
		prisma.booking.create({
			data: {
				guestId: 4, // Emma Wilson
				propertyId: property3.id, // Executive Condos
				unitId: units[5].id, // Condo 2A
				checkInDate: new Date("2024-01-25"),
				checkOutDate: new Date("2024-02-25"),
				numberOfGuests: 1,
				totalAmount: 50000,
				source: "direct",
				purpose: "business",
				specialRequests: "Long-term stay, monthly cleaning service",
				status: "confirmed",
			},
		}),
	]);

	// Create checkout reports
	const checkoutReport1 = await prisma.checkoutReport.create({
		data: {
			bookingId: 1, // John Doe's booking
			guestId: 1,
			checkoutDate: new Date("2024-01-20"),
			inspector: "John Inspector",
			totalDamageCost: 15000,
			depositDeduction: 10000,
			status: "completed",
			notes: "Guest was cooperative during inspection. Minor damage to sofa armrest.",
		},
	});

	const checkoutReport2 = await prisma.checkoutReport.create({
		data: {
			bookingId: 2, // Sarah Mitchell's booking
			guestId: 2,
			checkoutDate: new Date("2024-02-05"),
			inspector: "Jane Inspector",
			totalDamageCost: 0,
			depositDeduction: 0,
			status: "completed",
			notes: "Unit in excellent condition. No damages found.",
		},
	});

	// Create checkout items (damage tracking)
	await Promise.all([
		prisma.checkoutItem.create({
			data: {
				checkoutReportId: checkoutReport1.id,
				inventoryItemId: 1, // Queen Bed
				condition: "good",
				damageCost: 0,
				notes: "No damage",
			},
		}),
		prisma.checkoutItem.create({
			data: {
				checkoutReportId: checkoutReport1.id,
				inventoryItemId: 2, // Smart TV
				condition: "damaged",
				damageCost: 15000,
				notes: "Cracked screen, needs replacement",
			},
		}),
		prisma.checkoutItem.create({
			data: {
				checkoutReportId: checkoutReport2.id,
				inventoryItemId: 4, // Sofa Bed
				condition: "good",
				damageCost: 0,
				notes: "No damage",
			},
		}),
	]);

	// Update some inventory items to reflect damage status
	await prisma.inventoryItem.update({
		where: { id: 2 }, // Smart TV
		data: {
			status: "damaged",
			lastInspected: new Date("2024-01-20"),
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
