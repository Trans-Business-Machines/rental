import { PropertyCardActions } from "@/components/PropertyCardActions";
import { PropertyForm } from "@/components/PropertyForm";
import { PropertySearch } from "@/components/PropertySearch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { getProperties, searchProperties } from "@/lib/actions/properties";
import {
    Building2,
    DollarSign,
    Home,
    MapPin,
    Plus,
    Users,
} from "lucide-react";
import { Suspense } from "react";

interface PropertiesPageProps {
	searchParams: Promise<{ search?: string }>
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
	const { search } = await searchParams
	const searchQuery = search || ""
	
	const properties = searchQuery 
		? await searchProperties(searchQuery)
		: await getProperties()

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

	const getOccupancyRate = (occupied: number, total: number | null) => {
		if (!total || total === 0) return 0;
		return Math.round((occupied / total) * 100);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1>Properties</h1>
					<p className="text-muted-foreground">
						Manage your rental properties
					</p>
				</div>
				<Dialog>
					<DialogTrigger asChild>
						<Button>
							<Plus className="h-4 w-4 mr-2" />
							Add Property
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-md">
						<DialogHeader>
							<DialogTitle>Add New Property</DialogTitle>
						</DialogHeader>
						<PropertyForm />
					</DialogContent>
				</Dialog>
			</div>

			{/* Search and Filters */}
			<div className="flex items-center space-x-4">
				<Suspense fallback={<div>Loading search...</div>}>
					<PropertySearch />
				</Suspense>
			</div>

			{/* Properties Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{properties.map((property) => (
					<Card
						key={property.id}
						className="hover:shadow-lg transition-shadow p-0 pb-6"
					>
						<div className="relative h-48 w-full overflow-hidden rounded-t-lg">
							<img
								src={property.image}
								alt={property.name}
								className="object-cover w-full h-full"
							/>
						</div>
						<CardHeader>
							<div className="flex items-start justify-between">
								<div className="space-y-1">
									<CardTitle className="text-lg">
										{property.name}
									</CardTitle>
									<div className="flex items-center text-sm text-muted-foreground">
										<MapPin className="h-4 w-4 mr-1" />
										{property.address}
									</div>
								</div>
								<Badge
									variant={getStatusColor(property.status)}
								>
									{property.status}
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<p className="text-sm text-muted-foreground">
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

							<PropertyCardActions 
								property={property}
							/>
						</CardContent>
					</Card>
				))}
			</div>

			{properties.length === 0 && (
				<div className="text-center py-8">
					<Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
					<h3 className="text-lg font-medium">No properties found</h3>
					<p className="text-muted-foreground">
						{searchQuery ? "Try adjusting your search criteria" : "Get started by adding your first property"}
					</p>
				</div>
			)}
		</div>
	);
}