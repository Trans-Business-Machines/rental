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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
	Building2,
	DollarSign,
	Edit,
	Eye,
	Home,
	MapPin,
	Plus,
	Search,
	Users,
} from "lucide-react";
import { useState } from "react";

const mockProperties = [
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
	},
];

export function Properties() {
	const [properties, setProperties] = useState(mockProperties);
	const [searchQuery, setSearchQuery] = useState("");
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [selectedProperty, setSelectedProperty] = useState<any>(null);
	const [formData, setFormData] = useState({
		name: "",
		address: "",
		type: "",
		units: "",
		rent: "",
		description: "",
		image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=60",
	});

	const filteredProperties = properties.filter(
		(property) =>
			property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			property.address.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleAddProperty = () => {
		const newProperty = {
			id: properties.length + 1,
			name: formData.name,
			address: formData.address,
			type: formData.type,
			units: parseInt(formData.units),
			occupied: 0,
			rent: parseInt(formData.rent),
			status: "active",
			description: formData.description,
			image: formData.image,
		};

		setProperties([...properties, newProperty]);
		setIsAddDialogOpen(false);
		setFormData({
			name: "",
			address: "",
			type: "",
			units: "",
			rent: "",
			description: "",
			image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=60",
		});
	};

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

	const getOccupancyRate = (occupied: number, total: number) => {
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
				<Dialog
					open={isAddDialogOpen}
					onOpenChange={setIsAddDialogOpen}
				>
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
						<div className="space-y-6">
							<div className="space-y-4">
								<div>
									<Label
										htmlFor="name"
										className="mb-1.5 block"
									>
										Property Name
									</Label>
									<Input
										id="name"
										value={formData.name}
										onChange={(e) =>
											setFormData({
												...formData,
												name: e.target.value,
											})
										}
										placeholder="Enter property name"
									/>
								</div>
								<div>
									<Label
										htmlFor="address"
										className="mb-1.5 block"
									>
										Address
									</Label>
									<Input
										id="address"
										value={formData.address}
										onChange={(e) =>
											setFormData({
												...formData,
												address: e.target.value,
											})
										}
										placeholder="Enter full address"
									/>
								</div>
								<div>
									<Label
										htmlFor="type"
										className="mb-1.5 block"
									>
										Property Type
									</Label>
									<Select
										value={formData.type}
										onValueChange={(value) =>
											setFormData({
												...formData,
												type: value,
											})
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select type" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="apartment">
												Apartment
											</SelectItem>
											<SelectItem value="studio">
												Studio
											</SelectItem>
											<SelectItem value="condo">
												Condo
											</SelectItem>
											<SelectItem value="house">
												House
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label
											htmlFor="units"
											className="mb-1.5 block"
										>
											Number of Units
										</Label>
										<Input
											id="units"
											type="number"
											value={formData.units}
											onChange={(e) =>
												setFormData({
													...formData,
													units: e.target.value,
												})
											}
											placeholder="0"
										/>
									</div>
									<div>
										<Label
											htmlFor="rent"
											className="mb-1.5 block"
										>
											Base Rent ($)
										</Label>
										<Input
											id="rent"
											type="number"
											value={formData.rent}
											onChange={(e) =>
												setFormData({
													...formData,
													rent: e.target.value,
												})
											}
											placeholder="0"
										/>
									</div>
								</div>
								<div>
									<Label
										htmlFor="image"
										className="mb-1.5 block"
									>
										Image URL
									</Label>
									<Input
										id="image"
										value={formData.image}
										onChange={(e) =>
											setFormData({
												...formData,
												image: e.target.value,
											})
										}
										placeholder="Enter image URL"
									/>
								</div>
								<div>
									<Label
										htmlFor="description"
										className="mb-1.5 block"
									>
										Description
									</Label>
									<Textarea
										id="description"
										value={formData.description}
										onChange={(e) =>
											setFormData({
												...formData,
												description: e.target.value,
											})
										}
										placeholder="Property description..."
										className="min-h-[100px]"
									/>
								</div>
							</div>
							<Button
								onClick={handleAddProperty}
								className="w-full"
							>
								Add Property
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			{/* Search and Filters */}
			<div className="flex items-center space-x-4">
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
					<Input
						placeholder="Search properties..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>
			</div>

			{/* Properties Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{filteredProperties.map((property) => (
					<Card
						key={property.id}
						className="hover:shadow-lg transition-shadow p-0"
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
										{property.occupied}/{property.units} (
										{getOccupancyRate(
											property.occupied,
											property.units
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
												property.units
											)}%`,
										}}
									/>
								</div>
							</div>

							<div className="flex space-x-2">
								<Button
									variant="outline"
									size="sm"
									className="flex-1"
								>
									<Eye className="h-4 w-4 mr-2" />
									View
								</Button>
								<Button
									variant="outline"
									size="sm"
									className="flex-1"
								>
									<Edit className="h-4 w-4 mr-2" />
									Edit
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{filteredProperties.length === 0 && (
				<div className="text-center py-8">
					<Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
					<h3 className="text-lg font-medium">No properties found</h3>
					<p className="text-muted-foreground">
						Try adjusting your search criteria
					</p>
				</div>
			)}
		</div>
	);
}
