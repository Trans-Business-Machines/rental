import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBookingsByUnit } from "@/lib/actions/bookings";
import { getInventoryByUnit } from "@/lib/actions/inventory";
import { getPropertyById } from "@/lib/actions/properties";
import { getUnitById } from "@/lib/actions/units";
import { ArrowLeft, Bed, Building2, Calendar, DollarSign, Edit, Home, MapPin } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UnitBookings } from "./unit-bookings";
import { UnitInventory } from "./unit-inventory";
import { UnitQuickActions } from "./unit-quick-actions";

interface UnitPageProps {
	params: Promise<{ id: string; unitId: string }>
}

export default async function UnitPage({ params }: UnitPageProps) {
	const { id, unitId } = await params
	const propertyId = parseInt(id)
	const unitIdNum = parseInt(unitId)

	if (isNaN(propertyId) || isNaN(unitIdNum)) {
		notFound()
	}

	const [property, unit, inventory, bookings] = await Promise.all([
		getPropertyById(propertyId),
		getUnitById(unitIdNum),
		getInventoryByUnit(unitIdNum),
		getBookingsByUnit(unitIdNum)
	])

	if (!property || !unit || unit.propertyId !== propertyId) {
		notFound()
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case "available":
				return "default";
			case "occupied":
				return "secondary";
			case "maintenance":
				return "destructive";
			default:
				return "default";
		}
	};

	const getPropertyStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "default";
			case "maintenance":
				return "destructive";
			case "vacant":
				return "secondary";
			default:
				return "default";
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<Link href={`/properties/${property.id}`}>
						<Button variant="ghost" size="sm">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Property
						</Button>
					</Link>
					<div>
						<h1 className="text-2xl font-bold">{unit.name}</h1>
						<p className="text-muted-foreground">
							{property.name} • Unit Details
						</p>
					</div>
				</div>
				<Link href={`/properties/${property.id}/units/${unit.id}/edit`}>
					<Button>
						<Edit className="h-4 w-4 mr-2" />
						Edit Unit
					</Button>
				</Link>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Unit Details */}
				<div className="lg:col-span-2 space-y-6">
					<Card>
						<CardHeader>
							<div className="flex items-start justify-between">
								<div className="space-y-1">
									<CardTitle className="text-xl">
										{unit.name}
									</CardTitle>
									<div className="flex items-center text-sm text-muted-foreground">
										<Building2 className="h-4 w-4 mr-1" />
										{property.name}
									</div>
									<div className="flex items-center text-sm text-muted-foreground">
										<MapPin className="h-4 w-4 mr-1" />
										{property.address}
									</div>
								</div>
								<Badge variant={getStatusColor(unit.status)}>
									{unit.status}
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div className="flex items-center">
									<Home className="h-4 w-4 mr-2 text-muted-foreground" />
									<span className="capitalize">
										{unit.type}
									</span>
								</div>
								<div className="flex items-center">
									<Bed className="h-4 w-4 mr-2 text-muted-foreground" />
									<span>{unit.bedrooms} bedroom{unit.bedrooms !== 1 ? 's' : ''}</span>
								</div>
								<div className="flex items-center">
									<DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
									<span>${unit.rent}/month</span>
								</div>
								<div className="flex items-center">
									<Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
									<span>Created {new Date(unit.createdAt).toLocaleDateString()}</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Quick Actions */}
					<UnitQuickActions unit={unit} property={property} />

					{/* Inventory */}
					<UnitInventory unit={unit} inventory={inventory as any} />

					{/* Recent Bookings */}
					<UnitBookings unit={unit} bookings={bookings} />
				</div>

				{/* Property Info Sidebar */}
				<div className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Property Info</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Property Status</span>
								<Badge variant={getPropertyStatusColor(property.status)}>
									{property.status}
								</Badge>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Total Units</span>
								<span className="text-sm">{property.totalUnits || 0}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Occupied</span>
								<span className="text-sm">{property.occupied}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Property Rent</span>
								<span className="text-sm">${property.rent}/month</span>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Quick Stats</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Inventory Items</span>
								<span className="text-sm">{inventory.length}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Total Bookings</span>
								<span className="text-sm">{bookings.length}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Active Bookings</span>
								<span className="text-sm">
									{bookings.filter((b: any) => ['confirmed', 'checked-in'].includes(b.status)).length}
								</span>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
} 