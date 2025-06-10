import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
	Calendar,
	DollarSign,
	Edit,
	Eye,
	Mail,
	MapPin,
	Phone,
	Plus,
	Search,
	Users,
} from "lucide-react";
import { useState } from "react";

const mockTenants = [
	{
		id: 1,
		name: "John Doe",
		email: "john.doe@email.com",
		phone: "(555) 123-4567",
		unit: "Apartment 2A",
		property: "Sunset Apartments",
		rentAmount: 1200,
		leaseStart: "2024-01-15",
		leaseEnd: "2025-01-14",
		status: "active",
		paymentStatus: "current",
	},
	{
		id: 2,
		name: "Sarah Johnson",
		email: "sarah.j@email.com",
		phone: "(555) 234-5678",
		unit: "Studio 3C",
		property: "Garden View Studios",
		rentAmount: 950,
		leaseStart: "2024-03-01",
		leaseEnd: "2025-02-28",
		status: "active",
		paymentStatus: "current",
	},
	{
		id: 3,
		name: "Mike Wilson",
		email: "mike.wilson@email.com",
		phone: "(555) 345-6789",
		unit: "Apartment 4A",
		property: "Sunset Apartments",
		rentAmount: 1200,
		leaseStart: "2023-12-01",
		leaseEnd: "2024-11-30",
		status: "active",
		paymentStatus: "overdue",
	},
	{
		id: 4,
		name: "Emma Davis",
		email: "emma.davis@email.com",
		phone: "(555) 456-7890",
		unit: "Apartment 2B",
		property: "Sunset Apartments",
		rentAmount: 1200,
		leaseStart: "2024-02-15",
		leaseEnd: "2025-02-14",
		status: "active",
		paymentStatus: "current",
	},
	{
		id: 5,
		name: "Robert Chen",
		email: "robert.chen@email.com",
		phone: "(555) 567-8901",
		unit: "Condo 1A",
		property: "Executive Condos",
		rentAmount: 2500,
		leaseStart: "2024-04-01",
		leaseEnd: "2025-03-31",
		status: "active",
		paymentStatus: "current",
	},
];

export function Tenants() {
	const [tenants, setTenants] = useState(mockTenants);
	const [searchQuery, setSearchQuery] = useState("");
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		unit: "",
		property: "",
		rentAmount: "",
		leaseStart: "",
		leaseEnd: "",
	});

	const filteredTenants = tenants.filter(
		(tenant) =>
			tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			tenant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
			tenant.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
			tenant.property.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleAddTenant = () => {
		const newTenant = {
			id: tenants.length + 1,
			name: formData.name,
			email: formData.email,
			phone: formData.phone,
			unit: formData.unit,
			property: formData.property,
			rentAmount: parseInt(formData.rentAmount),
			leaseStart: formData.leaseStart,
			leaseEnd: formData.leaseEnd,
			status: "active",
			paymentStatus: "current",
		};

		setTenants([...tenants, newTenant]);
		setIsAddDialogOpen(false);
		setFormData({
			name: "",
			email: "",
			phone: "",
			unit: "",
			property: "",
			rentAmount: "",
			leaseStart: "",
			leaseEnd: "",
		});
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "default";
			case "inactive":
				return "secondary";
			case "terminated":
				return "destructive";
			default:
				return "default";
		}
	};

	const getPaymentStatusColor = (status: string) => {
		switch (status) {
			case "current":
				return "default";
			case "overdue":
				return "destructive";
			case "late":
				return "secondary";
			default:
				return "default";
		}
	};

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase();
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString();
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1>Tenants</h1>
					<p className="text-muted-foreground">
						Manage your tenants and lease information
					</p>
				</div>
				<Dialog
					open={isAddDialogOpen}
					onOpenChange={setIsAddDialogOpen}
				>
					<DialogTrigger asChild>
						<Button>
							<Plus className="h-4 w-4 mr-2" />
							Add Tenant
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-md">
						<DialogHeader>
							<DialogTitle>Add New Tenant</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							<div>
								<Label htmlFor="name">Full Name</Label>
								<Input
									id="name"
									value={formData.name}
									onChange={(e) =>
										setFormData({
											...formData,
											name: e.target.value,
										})
									}
									placeholder="Enter tenant name"
								/>
							</div>
							<div>
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									value={formData.email}
									onChange={(e) =>
										setFormData({
											...formData,
											email: e.target.value,
										})
									}
									placeholder="Enter email address"
								/>
							</div>
							<div>
								<Label htmlFor="phone">Phone</Label>
								<Input
									id="phone"
									value={formData.phone}
									onChange={(e) =>
										setFormData({
											...formData,
											phone: e.target.value,
										})
									}
									placeholder="(555) 123-4567"
								/>
							</div>
							<div>
								<Label htmlFor="unit">Unit</Label>
								<Input
									id="unit"
									value={formData.unit}
									onChange={(e) =>
										setFormData({
											...formData,
											unit: e.target.value,
										})
									}
									placeholder="e.g., Apartment 2A"
								/>
							</div>
							<div>
								<Label htmlFor="property">Property</Label>
								<Input
									id="property"
									value={formData.property}
									onChange={(e) =>
										setFormData({
											...formData,
											property: e.target.value,
										})
									}
									placeholder="Property name"
								/>
							</div>
							<div>
								<Label htmlFor="rentAmount">
									Monthly Rent ($)
								</Label>
								<Input
									id="rentAmount"
									type="number"
									value={formData.rentAmount}
									onChange={(e) =>
										setFormData({
											...formData,
											rentAmount: e.target.value,
										})
									}
									placeholder="0"
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="leaseStart">
										Lease Start
									</Label>
									<Input
										id="leaseStart"
										type="date"
										value={formData.leaseStart}
										onChange={(e) =>
											setFormData({
												...formData,
												leaseStart: e.target.value,
											})
										}
									/>
								</div>
								<div>
									<Label htmlFor="leaseEnd">Lease End</Label>
									<Input
										id="leaseEnd"
										type="date"
										value={formData.leaseEnd}
										onChange={(e) =>
											setFormData({
												...formData,
												leaseEnd: e.target.value,
											})
										}
									/>
								</div>
							</div>
							<Button
								onClick={handleAddTenant}
								className="w-full"
							>
								Add Tenant
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			{/* Search */}
			<div className="flex items-center space-x-4">
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
					<Input
						placeholder="Search tenants..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>
			</div>

			{/* Tenants Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{filteredTenants.map((tenant) => (
					<Card
						key={tenant.id}
						className="hover:shadow-lg transition-shadow"
					>
						<CardHeader>
							<div className="flex items-start space-x-4">
								<Avatar>
									<AvatarFallback>
										{getInitials(tenant.name)}
									</AvatarFallback>
								</Avatar>
								<div className="flex-1 space-y-1">
									<CardTitle className="text-lg">
										{tenant.name}
									</CardTitle>
									<div className="flex space-x-2">
										<Badge
											variant={getStatusColor(
												tenant.status
											)}
										>
											{tenant.status}
										</Badge>
										<Badge
											variant={getPaymentStatusColor(
												tenant.paymentStatus
											)}
										>
											{tenant.paymentStatus}
										</Badge>
									</div>
								</div>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2 text-sm">
								<div className="flex items-center">
									<Mail className="h-4 w-4 mr-2 text-muted-foreground" />
									<span className="text-muted-foreground">
										{tenant.email}
									</span>
								</div>
								<div className="flex items-center">
									<Phone className="h-4 w-4 mr-2 text-muted-foreground" />
									<span className="text-muted-foreground">
										{tenant.phone}
									</span>
								</div>
								<div className="flex items-center">
									<MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
									<span className="text-muted-foreground">
										{tenant.unit}, {tenant.property}
									</span>
								</div>
							</div>

							<div className="border-t pt-4 space-y-2">
								<div className="flex items-center justify-between text-sm">
									<span className="flex items-center text-muted-foreground">
										<DollarSign className="h-4 w-4 mr-1" />
										Monthly Rent
									</span>
									<span className="font-medium">
										${tenant.rentAmount}
									</span>
								</div>
								<div className="flex items-center justify-between text-sm">
									<span className="flex items-center text-muted-foreground">
										<Calendar className="h-4 w-4 mr-1" />
										Lease Period
									</span>
									<span className="text-right">
										{formatDate(tenant.leaseStart)} -{" "}
										{formatDate(tenant.leaseEnd)}
									</span>
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

			{filteredTenants.length === 0 && (
				<div className="text-center py-8">
					<Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
					<h3 className="text-lg font-medium">No tenants found</h3>
					<p className="text-muted-foreground">
						Try adjusting your search criteria
					</p>
				</div>
			)}
		</div>
	);
}
