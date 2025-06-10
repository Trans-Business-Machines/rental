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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
	AlertTriangle,
	Archive,
	CheckCircle,
	Clock,
	DollarSign,
	Download,
	Edit,
	Eye,
	FileText,
	Plus,
	RefreshCw,
	Search,
	Send,
	XCircle,
} from "lucide-react";
import { useState } from "react";

const mockAgreements = [
	{
		id: 1,
		tenantName: "Sarah Johnson",
		tenantEmail: "sarah.j@email.com",
		property: "Sunset Apartments",
		unit: "Apartment 2A",
		startDate: "2024-06-01",
		endDate: "2025-05-31",
		monthlyRent: 1200,
		securityDeposit: 1200,
		status: "active",
		leaseType: "fixed-term",
		renewalOption: true,
		signedDate: "2024-05-15",
		lastUpdated: "2024-05-15",
		documents: ["lease-agreement.pdf", "move-in-checklist.pdf"],
		notes: "Excellent tenant, always pays on time",
	},
	{
		id: 2,
		tenantName: "Mike Wilson",
		tenantEmail: "mike.wilson@email.com",
		property: "Green Valley Condos",
		unit: "Condo 3B",
		startDate: "2024-03-01",
		endDate: "2025-02-28",
		monthlyRent: 1800,
		securityDeposit: 1800,
		status: "expiring-soon",
		leaseType: "fixed-term",
		renewalOption: true,
		signedDate: "2024-02-15",
		lastUpdated: "2024-02-15",
		documents: ["lease-agreement.pdf"],
		notes: "Lease expires in 8 months, send renewal notice soon",
	},
	{
		id: 3,
		tenantName: "Emma Davis",
		tenantEmail: "emma.davis@email.com",
		property: "Riverside Studios",
		unit: "Studio 1C",
		startDate: "2024-01-01",
		endDate: "2024-12-31",
		monthlyRent: 950,
		securityDeposit: 950,
		status: "pending-renewal",
		leaseType: "fixed-term",
		renewalOption: true,
		signedDate: "2023-12-15",
		lastUpdated: "2024-05-01",
		documents: ["lease-agreement.pdf", "renewal-notice.pdf"],
		notes: "Renewal offer sent, awaiting tenant response",
	},
	{
		id: 4,
		tenantName: "John Doe",
		tenantEmail: "john.doe@email.com",
		property: "Heritage Townhomes",
		unit: "Townhouse 4A",
		startDate: "2025-07-01",
		endDate: "2026-06-30",
		monthlyRent: 2200,
		securityDeposit: 2200,
		status: "pending-signature",
		leaseType: "fixed-term",
		renewalOption: false,
		signedDate: null,
		lastUpdated: "2025-06-01",
		documents: ["draft-lease.pdf"],
		notes: "New tenant, lease sent for signature",
	},
	{
		id: 5,
		tenantName: "Lisa Chen",
		tenantEmail: "lisa.chen@email.com",
		property: "Metro Lofts",
		unit: "Loft 2B",
		startDate: "2023-08-01",
		endDate: "2024-07-31",
		monthlyRent: 2500,
		securityDeposit: 2500,
		status: "expired",
		leaseType: "fixed-term",
		renewalOption: false,
		signedDate: "2023-07-15",
		lastUpdated: "2024-08-01",
		documents: ["lease-agreement.pdf", "move-out-inspection.pdf"],
		notes: "Tenant moved out, security deposit returned",
	},
	{
		id: 6,
		tenantName: "Robert Chen",
		tenantEmail: "robert.chen@email.com",
		property: "Parkside Apartments",
		unit: "Apartment 3A",
		startDate: "2024-04-01",
		endDate: null,
		monthlyRent: 1400,
		securityDeposit: 1400,
		status: "active",
		leaseType: "month-to-month",
		renewalOption: true,
		signedDate: "2024-03-20",
		lastUpdated: "2024-03-20",
		documents: ["lease-agreement.pdf"],
		notes: "Month-to-month tenant, reliable payment history",
	},
];

export function RentalAgreements() {
	const [agreements, setAgreements] = useState(mockAgreements);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [propertyFilter, setPropertyFilter] = useState("all");
	const [selectedTab, setSelectedTab] = useState("active");
	const [isCreateLeaseOpen, setIsCreateLeaseOpen] = useState(false);

	const filteredAgreements = agreements.filter((agreement) => {
		const matchesSearch =
			agreement.tenantName
				.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
			agreement.property
				.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
			agreement.unit.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesStatus =
			statusFilter === "all" || agreement.status === statusFilter;
		const matchesProperty =
			propertyFilter === "all" || agreement.property === propertyFilter;

		return matchesSearch && matchesStatus && matchesProperty;
	});

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "default";
			case "pending-signature":
				return "secondary";
			case "pending-renewal":
				return "secondary";
			case "expiring-soon":
				return "secondary";
			case "expired":
				return "destructive";
			case "terminated":
				return "destructive";
			default:
				return "secondary";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "active":
				return CheckCircle;
			case "pending-signature":
				return Clock;
			case "pending-renewal":
				return RefreshCw;
			case "expiring-soon":
				return AlertTriangle;
			case "expired":
				return XCircle;
			case "terminated":
				return XCircle;
			default:
				return Clock;
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString();
	};

	const getDaysUntilExpiry = (endDate: string) => {
		const today = new Date();
		const expiry = new Date(endDate);
		const diffTime = expiry.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	};

	const activeAgreements = agreements.filter((a) => a.status === "active");
	const pendingAgreements = agreements.filter((a) =>
		a.status.includes("pending")
	);
	const expiringAgreements = agreements.filter((a) => {
		if (!a.endDate) return false;
		const daysUntilExpiry = getDaysUntilExpiry(a.endDate);
		return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
	});
	const expiredAgreements = agreements.filter(
		(a) => a.status === "expired" || a.status === "terminated"
	);

	const totalRevenue = activeAgreements.reduce(
		(sum, agreement) => sum + agreement.monthlyRent,
		0
	);
	const averageRent = totalRevenue / activeAgreements.length || 0;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1>Rental Agreements</h1>
					<p className="text-muted-foreground">
						Manage lease agreements and contracts
					</p>
				</div>
				<div className="flex space-x-2">
					<Button variant="outline">
						<Download className="h-4 w-4 mr-2" />
						Export
					</Button>
					<Dialog
						open={isCreateLeaseOpen}
						onOpenChange={setIsCreateLeaseOpen}
					>
						<DialogTrigger asChild>
							<Button>
								<Plus className="h-4 w-4 mr-2" />
								Create Lease
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-2xl">
							<DialogHeader>
								<DialogTitle>
									Create New Lease Agreement
								</DialogTitle>
							</DialogHeader>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="tenant">Tenant</Label>
									<Select>
										<SelectTrigger>
											<SelectValue placeholder="Select tenant" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="new">
												New Tenant
											</SelectItem>
											<SelectItem value="existing">
												Existing Tenant
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor="property">
										Property & Unit
									</Label>
									<Select>
										<SelectTrigger>
											<SelectValue placeholder="Select unit" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="sunset-2a">
												Sunset Apartments - 2A
											</SelectItem>
											<SelectItem value="valley-3b">
												Green Valley - 3B
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor="start-date">
										Start Date
									</Label>
									<Input id="start-date" type="date" />
								</div>
								<div>
									<Label htmlFor="end-date">End Date</Label>
									<Input id="end-date" type="date" />
								</div>
								<div>
									<Label htmlFor="monthly-rent">
										Monthly Rent
									</Label>
									<Input
										id="monthly-rent"
										type="number"
										placeholder="0.00"
									/>
								</div>
								<div>
									<Label htmlFor="security-deposit">
										Security Deposit
									</Label>
									<Input
										id="security-deposit"
										type="number"
										placeholder="0.00"
									/>
								</div>
								<div>
									<Label htmlFor="lease-type">
										Lease Type
									</Label>
									<Select>
										<SelectTrigger>
											<SelectValue placeholder="Select type" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="fixed-term">
												Fixed Term
											</SelectItem>
											<SelectItem value="month-to-month">
												Month-to-Month
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor="renewal-option">
										Renewal Option
									</Label>
									<Select>
										<SelectTrigger>
											<SelectValue placeholder="Select option" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="yes">
												Yes
											</SelectItem>
											<SelectItem value="no">
												No
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="col-span-2">
									<Label htmlFor="notes">Notes</Label>
									<Textarea
										id="notes"
										placeholder="Additional lease terms or notes..."
									/>
								</div>
								<div className="col-span-2">
									<Button className="w-full">
										Create Lease Agreement
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			{/* Summary Stats */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Active Leases
						</CardTitle>
						<FileText className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{activeAgreements.length}
						</div>
						<p className="text-xs text-muted-foreground">
							{formatCurrency(totalRevenue)}/month revenue
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Expiring Soon
						</CardTitle>
						<AlertTriangle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{expiringAgreements.length}
						</div>
						<p className="text-xs text-muted-foreground">
							Within 90 days
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Pending Actions
						</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{pendingAgreements.length}
						</div>
						<p className="text-xs text-muted-foreground">
							Require attention
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Average Rent
						</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatCurrency(averageRent)}
						</div>
						<p className="text-xs text-muted-foreground">
							Per active lease
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Search and Filters */}
			<div className="flex items-center space-x-4">
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
					<Input
						placeholder="Search leases..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>
				<Select value={statusFilter} onValueChange={setStatusFilter}>
					<SelectTrigger className="w-40">
						<SelectValue placeholder="Status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Status</SelectItem>
						<SelectItem value="active">Active</SelectItem>
						<SelectItem value="pending-signature">
							Pending Signature
						</SelectItem>
						<SelectItem value="pending-renewal">
							Pending Renewal
						</SelectItem>
						<SelectItem value="expiring-soon">
							Expiring Soon
						</SelectItem>
						<SelectItem value="expired">Expired</SelectItem>
					</SelectContent>
				</Select>
				<Select
					value={propertyFilter}
					onValueChange={setPropertyFilter}
				>
					<SelectTrigger className="w-40">
						<SelectValue placeholder="Property" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Properties</SelectItem>
						<SelectItem value="Sunset Apartments">
							Sunset Apartments
						</SelectItem>
						<SelectItem value="Green Valley Condos">
							Green Valley Condos
						</SelectItem>
						<SelectItem value="Riverside Studios">
							Riverside Studios
						</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<Tabs value={selectedTab} onValueChange={setSelectedTab}>
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="active">
						Active ({activeAgreements.length})
					</TabsTrigger>
					<TabsTrigger value="pending">
						Pending ({pendingAgreements.length})
					</TabsTrigger>
					<TabsTrigger value="expiring">
						Expiring ({expiringAgreements.length})
					</TabsTrigger>
					<TabsTrigger value="expired">
						Expired ({expiredAgreements.length})
					</TabsTrigger>
				</TabsList>

				{/* Active Leases */}
				<TabsContent value="active" className="space-y-4">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{activeAgreements.map((agreement) => {
							const StatusIcon = getStatusIcon(agreement.status);
							const daysUntilExpiry = agreement.endDate
								? getDaysUntilExpiry(agreement.endDate)
								: null;

							return (
								<Card
									key={agreement.id}
									className="hover:shadow-lg transition-shadow"
								>
									<CardHeader>
										<div className="flex items-start justify-between">
											<div className="flex items-start space-x-3">
												<Avatar>
													<AvatarFallback>
														{agreement.tenantName
															.split(" ")
															.map((n) => n[0])
															.join("")}
													</AvatarFallback>
												</Avatar>
												<div className="space-y-1">
													<CardTitle className="text-lg">
														{agreement.tenantName}
													</CardTitle>
													<p className="text-sm text-muted-foreground">
														{agreement.unit}
													</p>
													<p className="text-sm text-muted-foreground">
														{agreement.property}
													</p>
												</div>
											</div>
											<Badge
												variant={getStatusColor(
													agreement.status
												)}
											>
												<StatusIcon className="h-3 w-3 mr-1" />
												{agreement.status.replace(
													"-",
													" "
												)}
											</Badge>
										</div>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="grid grid-cols-2 gap-4 text-sm">
											<div>
												<span className="text-muted-foreground">
													Monthly Rent
												</span>
												<p className="font-medium">
													{formatCurrency(
														agreement.monthlyRent
													)}
												</p>
											</div>
											<div>
												<span className="text-muted-foreground">
													Lease Type
												</span>
												<p className="font-medium capitalize">
													{agreement.leaseType.replace(
														"-",
														" "
													)}
												</p>
											</div>
											<div>
												<span className="text-muted-foreground">
													Start Date
												</span>
												<p className="font-medium">
													{formatDate(
														agreement.startDate
													)}
												</p>
											</div>
											<div>
												<span className="text-muted-foreground">
													End Date
												</span>
												<p className="font-medium">
													{agreement.endDate
														? formatDate(
																agreement.endDate
														  )
														: "Month-to-month"}
												</p>
											</div>
										</div>

										{daysUntilExpiry !== null &&
											daysUntilExpiry <= 90 && (
												<div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
													<div className="flex items-center space-x-2 text-sm">
														<AlertTriangle className="h-4 w-4 text-yellow-600" />
														<span className="text-yellow-800">
															Expires in{" "}
															{daysUntilExpiry}{" "}
															days
														</span>
													</div>
												</div>
											)}

										<div className="border-t pt-3">
											<div className="flex items-center justify-between text-sm mb-2">
												<span className="text-muted-foreground">
													Documents
												</span>
												<span className="font-medium">
													{agreement.documents.length}{" "}
													files
												</span>
											</div>
											{agreement.notes && (
												<p className="text-sm text-muted-foreground">
													{agreement.notes}
												</p>
											)}
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
											{daysUntilExpiry !== null &&
												daysUntilExpiry <= 90 && (
													<Button
														variant="outline"
														size="sm"
														className="flex-1"
													>
														<RefreshCw className="h-4 w-4 mr-2" />
														Renew
													</Button>
												)}
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				</TabsContent>

				{/* Pending Leases */}
				<TabsContent value="pending" className="space-y-4">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{pendingAgreements.map((agreement) => {
							const StatusIcon = getStatusIcon(agreement.status);

							return (
								<Card
									key={agreement.id}
									className="border-l-4 border-l-yellow-500"
								>
									<CardHeader>
										<div className="flex items-start justify-between">
											<div className="flex items-start space-x-3">
												<Avatar>
													<AvatarFallback>
														{agreement.tenantName
															.split(" ")
															.map((n) => n[0])
															.join("")}
													</AvatarFallback>
												</Avatar>
												<div className="space-y-1">
													<CardTitle className="text-lg">
														{agreement.tenantName}
													</CardTitle>
													<p className="text-sm text-muted-foreground">
														{agreement.unit}
													</p>
													<p className="text-sm text-muted-foreground">
														{agreement.property}
													</p>
												</div>
											</div>
											<Badge
												variant={getStatusColor(
													agreement.status
												)}
											>
												<StatusIcon className="h-3 w-3 mr-1" />
												{agreement.status.replace(
													"-",
													" "
												)}
											</Badge>
										</div>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="grid grid-cols-2 gap-4 text-sm">
											<div>
												<span className="text-muted-foreground">
													Monthly Rent
												</span>
												<p className="font-medium">
													{formatCurrency(
														agreement.monthlyRent
													)}
												</p>
											</div>
											<div>
												<span className="text-muted-foreground">
													Start Date
												</span>
												<p className="font-medium">
													{formatDate(
														agreement.startDate
													)}
												</p>
											</div>
										</div>

										<div className="border-t pt-3">
											<p className="text-sm text-muted-foreground">
												{agreement.notes}
											</p>
										</div>

										<div className="flex space-x-2">
											{agreement.status ===
												"pending-signature" && (
												<Button
													size="sm"
													className="flex-1"
												>
													<Send className="h-4 w-4 mr-2" />
													Send Reminder
												</Button>
											)}
											{agreement.status ===
												"pending-renewal" && (
												<Button
													size="sm"
													className="flex-1"
												>
													<RefreshCw className="h-4 w-4 mr-2" />
													Follow Up
												</Button>
											)}
											<Button
												variant="outline"
												size="sm"
												className="flex-1"
											>
												<Eye className="h-4 w-4 mr-2" />
												View
											</Button>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				</TabsContent>

				{/* Expiring Leases */}
				<TabsContent value="expiring" className="space-y-4">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{expiringAgreements.map((agreement) => {
							const daysUntilExpiry = getDaysUntilExpiry(
								agreement.endDate!
							);

							return (
								<Card
									key={agreement.id}
									className="border-l-4 border-l-orange-500"
								>
									<CardHeader>
										<div className="flex items-start justify-between">
											<div className="flex items-start space-x-3">
												<Avatar>
													<AvatarFallback>
														{agreement.tenantName
															.split(" ")
															.map((n) => n[0])
															.join("")}
													</AvatarFallback>
												</Avatar>
												<div className="space-y-1">
													<CardTitle className="text-lg">
														{agreement.tenantName}
													</CardTitle>
													<p className="text-sm text-muted-foreground">
														{agreement.unit}
													</p>
													<p className="text-sm text-muted-foreground">
														{agreement.property}
													</p>
												</div>
											</div>
											<Badge variant="secondary">
												<AlertTriangle className="h-3 w-3 mr-1" />
												{daysUntilExpiry} days left
											</Badge>
										</div>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
											<div className="flex items-center justify-between text-sm">
												<span className="text-orange-800">
													Expires
												</span>
												<span className="font-medium text-orange-800">
													{formatDate(
														agreement.endDate!
													)}
												</span>
											</div>
											<div className="flex items-center justify-between text-sm mt-1">
												<span className="text-orange-800">
													Current Rent
												</span>
												<span className="font-medium text-orange-800">
													{formatCurrency(
														agreement.monthlyRent
													)}
												</span>
											</div>
										</div>

										<div className="flex space-x-2">
											<Button
												size="sm"
												className="flex-1"
											>
												<RefreshCw className="h-4 w-4 mr-2" />
												Send Renewal
											</Button>
											<Button
												variant="outline"
												size="sm"
												className="flex-1"
											>
												<Eye className="h-4 w-4 mr-2" />
												View Details
											</Button>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				</TabsContent>

				{/* Expired Leases */}
				<TabsContent value="expired" className="space-y-4">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{expiredAgreements.map((agreement) => {
							const StatusIcon = getStatusIcon(agreement.status);

							return (
								<Card
									key={agreement.id}
									className="border-l-4 border-l-red-500"
								>
									<CardHeader>
										<div className="flex items-start justify-between">
											<div className="flex items-start space-x-3">
												<Avatar>
													<AvatarFallback>
														{agreement.tenantName
															.split(" ")
															.map((n) => n[0])
															.join("")}
													</AvatarFallback>
												</Avatar>
												<div className="space-y-1">
													<CardTitle className="text-lg">
														{agreement.tenantName}
													</CardTitle>
													<p className="text-sm text-muted-foreground">
														{agreement.unit}
													</p>
													<p className="text-sm text-muted-foreground">
														{agreement.property}
													</p>
												</div>
											</div>
											<Badge
												variant={getStatusColor(
													agreement.status
												)}
											>
												<StatusIcon className="h-3 w-3 mr-1" />
												{agreement.status}
											</Badge>
										</div>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="grid grid-cols-2 gap-4 text-sm">
											<div>
												<span className="text-muted-foreground">
													End Date
												</span>
												<p className="font-medium">
													{formatDate(
														agreement.endDate!
													)}
												</p>
											</div>
											<div>
												<span className="text-muted-foreground">
													Final Rent
												</span>
												<p className="font-medium">
													{formatCurrency(
														agreement.monthlyRent
													)}
												</p>
											</div>
										</div>

										<div className="border-t pt-3">
											<p className="text-sm text-muted-foreground">
												{agreement.notes}
											</p>
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
												<Archive className="h-4 w-4 mr-2" />
												Archive
											</Button>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				</TabsContent>
			</Tabs>

			{filteredAgreements.length === 0 && (
				<div className="text-center py-8">
					<FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
					<h3 className="text-lg font-medium">No agreements found</h3>
					<p className="text-muted-foreground">
						Try adjusting your search criteria
					</p>
				</div>
			)}
		</div>
	);
}
