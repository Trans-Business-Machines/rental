import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPropertyById } from "@/lib/actions/properties";
import { getUnitsByProperty } from "@/lib/actions/units";
import { ArrowLeft, Building2, DollarSign, Edit, Home, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PropertyPageProps {
	params: Promise<{ id: string }>
}

export default async function PropertyPage({ params }: PropertyPageProps) {
	const { id } = await params
	const propertyId = parseInt(id)

	if (isNaN(propertyId)) {
		notFound()
	}

	const property = await getPropertyById(propertyId)
	const units = await getUnitsByProperty(propertyId)

	if (!property) {
		notFound()
	}

	const getStatusColor = (status: string) => {
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

	const getUnitStatusColor = (status: string) => {
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

	const getOccupancyRate = (occupied: number, total: number | null) => {
		if (!total || total === 0) return 0;
		return Math.round((occupied / total) * 100);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<Link href="/properties">
						<Button variant="ghost" size="sm">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Properties
						</Button>
					</Link>
					<div>
						<h1>{property.name}</h1>
						<p className="text-muted-foreground">
							Property Details
						</p>
					</div>
				</div>
				<Link href={`/properties/${property.id}/edit`}>
					<Button>
						<Edit className="h-4 w-4 mr-2" />
						Edit Property
					</Button>
				</Link>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Property Details */}
				<div className="lg:col-span-2 space-y-6">
					<Card className="pt-0">
						<div className="relative h-64 w-full overflow-hidden rounded-t-lg">
							<img
								src={property.image}
								alt={property.name}
								className="object-cover w-full h-full"
							/>
						</div>
						<CardHeader>
							<div className="flex items-start justify-between">
								<div className="space-y-1">
									<CardTitle className="text-xl">
										{property.name}
									</CardTitle>
									<div className="flex items-center text-sm text-muted-foreground">
										<MapPin className="h-4 w-4 mr-1" />
										{property.address}
									</div>
								</div>
								<Badge variant={getStatusColor(property.status)}>
									{property.status}
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<p className="text-muted-foreground">
								{property.description}
							</p>

							<div className="grid grid-cols-2 gap-4 text-sm">
								<div className="flex items-center">
									<Home className="h-4 w-4 mr-2 text-muted-foreground" />
									<span className="capitalize">
										{property.type}
									</span>
								</div>
								<div className="flex items-center">
									<DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
									<span>${property.rent}/month</span>
								</div>
							</div>

							<div className="space-y-2">
								<div className="flex items-center justify-between text-sm">
									<span className="flex items-center">
										<Users className="h-4 w-4 mr-2 text-muted-foreground" />
										Occupancy
									</span>
									<span>
										{property.occupied}/{property.totalUnits || 0} (
										{getOccupancyRate(
											property.occupied,
											property.totalUnits
										)}
										%)
									</span>
								</div>
								<div className="w-full bg-secondary rounded-full h-2">
									<div
										className="bg-primary h-2 rounded-full"
										style={{
											width: `${getOccupancyRate(
												property.occupied,
												property.totalUnits
											)}%`,
										}}
									/>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Units List */}
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold">Units</h2>
						<Badge variant="outline">{units.length} units</Badge>
					</div>

					{units.length === 0 ? (
						<Card>
							<CardContent className="text-center py-8">
								<Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
								<p className="text-sm text-muted-foreground">No units added yet</p>
							</CardContent>
						</Card>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Rent</TableHead>
									<TableHead>Status</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{units.map((unit) => (
									<TableRow key={unit.id} className="hover:bg-gray-50 transition">
										<TableCell>
											<Link href={`/properties/${property.id}/units/${unit.id}`} className="text-blue-600 hover:underline">
												{unit.name}
											</Link>
										</TableCell>
										<TableCell className="capitalize">{unit.type}</TableCell>
										<TableCell>${unit.rent}</TableCell>
										<TableCell>
											<Badge variant={getUnitStatusColor(unit.status)}>{unit.status}</Badge>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</div>
			</div>
		</div>
	);
} 