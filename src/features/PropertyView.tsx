import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockProperties } from "@/data/properties";
import {
	Building2,
	Calendar,
	DollarSign,
	Home,
	Mail,
	MapPin,
	Phone,
	Users,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

export function PropertyView() {
	const { id } = useParams();
	const navigate = useNavigate();
	const property = useMemo(
		() => mockProperties.find((p) => p.id === Number(id)),
		[id]
	);

	if (!property) {
		return (
			<div className="text-center py-8">
				<Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
				<h3 className="text-lg font-medium">Property not found</h3>
				<Button
					variant="outline"
					className="mt-4"
					onClick={() => navigate("/properties")}
				>
					Back to Properties
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1>{property.name}</h1>
					<p className="text-muted-foreground">
						Property Details and Management
					</p>
				</div>
				<Button
					variant="outline"
					onClick={() => navigate("/properties")}
				>
					Back to Properties
				</Button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Property Overview */}
				<Card className="lg:col-span-2 pt-0">
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
								<CardTitle className="text-2xl">
									{property.name}
								</CardTitle>
								<div className="flex items-center text-muted-foreground">
									<MapPin className="h-4 w-4 mr-1" />
									{property.address}
								</div>
							</div>
							<Badge variant="default">{property.status}</Badge>
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						<p className="text-muted-foreground">
							{property.description}
						</p>

						<div className="grid grid-cols-2 gap-4">
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
							<div className="flex items-center">
								<Users className="h-4 w-4 mr-2 text-muted-foreground" />
								<span>
									{property.occupied}/{property.units} Units
								</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Amenities */}
				<Card>
					<CardHeader>
						<CardTitle>Amenities</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{property.amenities.map((amenity) => (
								<div
									key={amenity.id}
									className="flex items-start space-x-3"
								>
									<div className="bg-primary/10 p-2 rounded-lg">
										<Building2 className="h-4 w-4 text-primary" />
									</div>
									<div>
										<h4 className="font-medium">
											{amenity.name}
										</h4>
										<p className="text-sm text-muted-foreground">
											{amenity.description}
										</p>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Tenants */}
			<>
				<h2 className="text-xl font-semibold">Current Tenants</h2>
				<div className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{property.tenants.map((tenant) => (
							<Card key={tenant.id}>
								<CardContent className="pt-6">
									<div className="space-y-4">
										<div>
											<h4 className="font-medium">
												{tenant.name}
											</h4>
											<p className="text-sm text-muted-foreground">
												Unit {tenant.unitNumber}
											</p>
										</div>
										<div className="space-y-2">
											<div className="flex items-center text-sm">
												<Mail className="h-4 w-4 mr-2 text-muted-foreground" />
												{tenant.email}
											</div>
											<div className="flex items-center text-sm">
												<Phone className="h-4 w-4 mr-2 text-muted-foreground" />
												{tenant.phone}
											</div>
											<div className="flex items-center text-sm">
												<DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
												${tenant.rent}/month
											</div>
											<div className="flex items-center text-sm">
												<Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
												{tenant.leaseStart} -{" "}
												{tenant.leaseEnd}
											</div>
										</div>
										<Badge
											variant={
												tenant.status === "active"
													? "default"
													: "secondary"
											}
										>
											{tenant.status}
										</Badge>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</>
		</div>
	);
}
