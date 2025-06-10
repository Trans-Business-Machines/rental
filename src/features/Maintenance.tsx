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
import { Textarea } from "@/components/ui/textarea";
import {
	Activity,
	AlertTriangle,
	Calendar,
	CheckCircle,
	Clock,
	DollarSign,
	Edit,
	Eye,
	MapPin,
	MessageSquare,
	Phone,
	Plus,
	Search,
	User,
	Wrench,
	XCircle,
} from "lucide-react";
import { useState } from "react";

const mockMaintenanceRequests = [
	{
		id: 1,
		title: "Leaking Kitchen Faucet",
		description:
			"Kitchen faucet has been dripping for several days. Water is pooling under the sink.",
		tenant: "Sarah Johnson",
		tenantPhone: "+1 (555) 123-4567",
		tenantEmail: "sarah.j@email.com",
		property: "Sunset Apartments",
		unit: "Apartment 2A",
		category: "Plumbing",
		priority: "medium",
		status: "pending",
		reportedDate: "2025-06-08",
		scheduledDate: null,
		completedDate: null,
		assignedTo: null,
		estimatedCost: 150,
		actualCost: null,
		notes: "Tenant reports constant dripping, affecting water bill",
	},
	{
		id: 2,
		title: "Broken Air Conditioning",
		description:
			"AC unit stopped working completely. No cold air and making strange noises.",
		tenant: "Mike Wilson",
		tenantPhone: "+1 (555) 234-5678",
		tenantEmail: "mike.wilson@email.com",
		property: "Green Valley Condos",
		unit: "Condo 3B",
		category: "HVAC",
		priority: "high",
		status: "in-progress",
		reportedDate: "2025-06-07",
		scheduledDate: "2025-06-10",
		completedDate: null,
		assignedTo: "Mike Rodriguez - HVAC Specialist",
		estimatedCost: 450,
		actualCost: null,
		notes: "Scheduled for Monday morning. Tenant working from home, needs early appointment.",
	},
	{
		id: 3,
		title: "Flickering Bathroom Lights",
		description:
			"Bathroom lights flicker intermittently. Sometimes they stay off for minutes.",
		tenant: "Emma Davis",
		tenantPhone: "+1 (555) 345-6789",
		tenantEmail: "emma.davis@email.com",
		property: "Riverside Studios",
		unit: "Studio 1C",
		category: "Electrical",
		priority: "high",
		status: "pending",
		reportedDate: "2025-06-08",
		scheduledDate: null,
		completedDate: null,
		assignedTo: null,
		estimatedCost: 200,
		actualCost: null,
		notes: "Potential electrical hazard - prioritize scheduling",
	},
	{
		id: 4,
		title: "Clogged Garbage Disposal",
		description:
			"Kitchen garbage disposal is completely blocked and making grinding sounds.",
		tenant: "John Doe",
		tenantPhone: "+1 (555) 456-7890",
		tenantEmail: "john.doe@email.com",
		property: "Heritage Townhomes",
		unit: "Townhouse 4A",
		category: "Plumbing",
		priority: "low",
		status: "completed",
		reportedDate: "2025-06-05",
		scheduledDate: "2025-06-06",
		completedDate: "2025-06-06",
		assignedTo: "Dave Thompson - Maintenance",
		estimatedCost: 100,
		actualCost: 85,
		notes: "Fixed by removing obstruction and cleaning unit. Advised tenant on proper usage.",
	},
	{
		id: 5,
		title: "Dishwasher Not Draining",
		description:
			"Dishwasher fills with water but does not drain properly after cycle.",
		tenant: "Lisa Chen",
		tenantPhone: "+1 (555) 567-8901",
		tenantEmail: "lisa.chen@email.com",
		property: "Metro Lofts",
		unit: "Loft 2B",
		category: "Appliance",
		priority: "medium",
		status: "scheduled",
		reportedDate: "2025-06-07",
		scheduledDate: "2025-06-11",
		completedDate: null,
		assignedTo: "Sarah Williams - Appliance Repair",
		estimatedCost: 180,
		actualCost: null,
		notes: "Scheduled for Tuesday afternoon. May need replacement drain hose.",
	},
	{
		id: 6,
		title: "Window Won't Close Properly",
		description:
			"Living room window is stuck half-open. Handle seems loose and window won't lock.",
		tenant: "Robert Chen",
		tenantPhone: "+1 (555) 678-9012",
		tenantEmail: "robert.chen@email.com",
		property: "Parkside Apartments",
		unit: "Apartment 3A",
		category: "General",
		priority: "medium",
		status: "cancelled",
		reportedDate: "2025-06-04",
		scheduledDate: null,
		completedDate: null,
		assignedTo: null,
		estimatedCost: 75,
		actualCost: 0,
		notes: "Tenant resolved issue themselves by adjusting window track.",
	},
	{
		id: 7,
		title: "Smoke Detector Chirping",
		description:
			"Bedroom smoke detector beeps every few minutes. Battery may need replacement.",
		tenant: "Anna Taylor",
		tenantPhone: "+1 (555) 789-0123",
		tenantEmail: "anna.taylor@email.com",
		property: "Sunset Apartments",
		unit: "Apartment 1B",
		category: "Safety",
		priority: "urgent",
		status: "in-progress",
		reportedDate: "2025-06-09",
		scheduledDate: "2025-06-09",
		completedDate: null,
		assignedTo: "Dave Thompson - Maintenance",
		estimatedCost: 25,
		actualCost: null,
		notes: "Emergency maintenance - safety issue. Technician dispatched immediately.",
	},
];

export function Maintenance() {
	const [requests] = useState(mockMaintenanceRequests);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [priorityFilter, setPriorityFilter] = useState("all");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);

	const filteredRequests = requests.filter((request) => {
		const matchesSearch =
			request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			request.tenant.toLowerCase().includes(searchQuery.toLowerCase()) ||
			request.property
				.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
			request.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
			request.category.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesStatus =
			statusFilter === "all" || request.status === statusFilter;
		const matchesPriority =
			priorityFilter === "all" || request.priority === priorityFilter;
		const matchesCategory =
			categoryFilter === "all" || request.category === categoryFilter;

		return (
			matchesSearch && matchesStatus && matchesPriority && matchesCategory
		);
	});

	const getStatusColor = (status: string) => {
		switch (status) {
			case "pending":
				return "secondary";
			case "scheduled":
				return "default";
			case "in-progress":
				return "default";
			case "completed":
				return "default";
			case "cancelled":
				return "destructive";
			default:
				return "secondary";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "pending":
				return Clock;
			case "scheduled":
				return Calendar;
			case "in-progress":
				return Activity;
			case "completed":
				return CheckCircle;
			case "cancelled":
				return XCircle;
			default:
				return Clock;
		}
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "low":
				return "secondary";
			case "medium":
				return "default";
			case "high":
				return "secondary";
			case "urgent":
				return "destructive";
			default:
				return "secondary";
		}
	};

	const formatCurrency = (amount: number | null) => {
		if (amount === null) return "-";
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	const formatDate = (dateString: string | null) => {
		if (!dateString) return "-";
		return new Date(dateString).toLocaleDateString();
	};

	// Statistics
	const totalRequests = requests.length;
	const pendingRequests = requests.filter(
		(r) => r.status === "pending"
	).length;
	const inProgressRequests = requests.filter(
		(r) => r.status === "in-progress" || r.status === "scheduled"
	).length;
	const completedRequests = requests.filter(
		(r) => r.status === "completed"
	).length;
	const urgentRequests = requests.filter(
		(r) => r.priority === "urgent" && r.status !== "completed"
	).length;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1>Maintenance Requests</h1>
					<p className="text-muted-foreground">
						Manage property maintenance requests and work orders
					</p>
				</div>
				<Dialog
					open={isAddRequestOpen}
					onOpenChange={setIsAddRequestOpen}
				>
					<DialogTrigger asChild>
						<Button>
							<Plus className="h-4 w-4 mr-2" />
							Add Request
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>
								Create Maintenance Request
							</DialogTitle>
						</DialogHeader>
						<div className="grid grid-cols-2 gap-4">
							<div className="col-span-2">
								<Label htmlFor="title">Title</Label>
								<Input
									id="title"
									placeholder="Brief description of the issue"
								/>
							</div>
							<div>
								<Label htmlFor="tenant">Tenant</Label>
								<Select>
									<SelectTrigger>
										<SelectValue placeholder="Select tenant" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="sarah">
											Sarah Johnson - Apt 2A
										</SelectItem>
										<SelectItem value="mike">
											Mike Wilson - Condo 3B
										</SelectItem>
										<SelectItem value="emma">
											Emma Davis - Studio 1C
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor="category">Category</Label>
								<Select>
									<SelectTrigger>
										<SelectValue placeholder="Select category" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="plumbing">
											Plumbing
										</SelectItem>
										<SelectItem value="electrical">
											Electrical
										</SelectItem>
										<SelectItem value="hvac">
											HVAC
										</SelectItem>
										<SelectItem value="appliance">
											Appliance
										</SelectItem>
										<SelectItem value="safety">
											Safety
										</SelectItem>
										<SelectItem value="general">
											General
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor="priority">Priority</Label>
								<Select>
									<SelectTrigger>
										<SelectValue placeholder="Select priority" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="low">Low</SelectItem>
										<SelectItem value="medium">
											Medium
										</SelectItem>
										<SelectItem value="high">
											High
										</SelectItem>
										<SelectItem value="urgent">
											Urgent
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor="estimated-cost">
									Estimated Cost
								</Label>
								<Input
									id="estimated-cost"
									type="number"
									placeholder="0.00"
								/>
							</div>
							<div className="col-span-2">
								<Label htmlFor="description">Description</Label>
								<Textarea
									id="description"
									placeholder="Detailed description of the maintenance issue..."
								/>
							</div>
							<div className="col-span-2">
								<Label htmlFor="notes">Notes</Label>
								<Textarea
									id="notes"
									placeholder="Additional notes or special instructions..."
								/>
							</div>
							<div className="col-span-2">
								<Button className="w-full">
									Create Request
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			{/* Summary Stats */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Requests
						</CardTitle>
						<Wrench className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{totalRequests}
						</div>
						<p className="text-xs text-muted-foreground">
							All time
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Pending
						</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{pendingRequests}
						</div>
						<p className="text-xs text-muted-foreground">
							Awaiting action
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							In Progress
						</CardTitle>
						<Activity className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{inProgressRequests}
						</div>
						<p className="text-xs text-muted-foreground">
							Being worked on
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Completed
						</CardTitle>
						<CheckCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{completedRequests}
						</div>
						<p className="text-xs text-muted-foreground">
							This month
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Urgent
						</CardTitle>
						<AlertTriangle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{urgentRequests}
						</div>
						<p className="text-xs text-muted-foreground">
							Need attention
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Search and Filters */}
			<div className="flex items-center space-x-4">
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
					<Input
						placeholder="Search requests..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>
				<Select value={statusFilter} onValueChange={setStatusFilter}>
					<SelectTrigger className="w-32">
						<SelectValue placeholder="Status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Status</SelectItem>
						<SelectItem value="pending">Pending</SelectItem>
						<SelectItem value="scheduled">Scheduled</SelectItem>
						<SelectItem value="in-progress">In Progress</SelectItem>
						<SelectItem value="completed">Completed</SelectItem>
						<SelectItem value="cancelled">Cancelled</SelectItem>
					</SelectContent>
				</Select>
				<Select
					value={priorityFilter}
					onValueChange={setPriorityFilter}
				>
					<SelectTrigger className="w-32">
						<SelectValue placeholder="Priority" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Priority</SelectItem>
						<SelectItem value="low">Low</SelectItem>
						<SelectItem value="medium">Medium</SelectItem>
						<SelectItem value="high">High</SelectItem>
						<SelectItem value="urgent">Urgent</SelectItem>
					</SelectContent>
				</Select>
				<Select
					value={categoryFilter}
					onValueChange={setCategoryFilter}
				>
					<SelectTrigger className="w-32">
						<SelectValue placeholder="Category" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Categories</SelectItem>
						<SelectItem value="Plumbing">Plumbing</SelectItem>
						<SelectItem value="Electrical">Electrical</SelectItem>
						<SelectItem value="HVAC">HVAC</SelectItem>
						<SelectItem value="Appliance">Appliance</SelectItem>
						<SelectItem value="Safety">Safety</SelectItem>
						<SelectItem value="General">General</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Maintenance Requests Table */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{filteredRequests.map((request) => {
					const StatusIcon = getStatusIcon(request.status);
					return (
						<Card
							key={request.id}
							className="hover:shadow-lg transition-shadow"
						>
							<CardHeader>
								<div className="flex items-start space-x-4">
									<Avatar>
										<AvatarFallback>
											{request.tenant
												.split(" ")
												.map((n) => n[0])
												.join("")}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 space-y-1">
										<CardTitle className="text-lg">
											{request.title}
										</CardTitle>
										<div className="flex space-x-2">
											<Badge
												variant={getStatusColor(
													request.status
												)}
											>
												<StatusIcon className="h-3 w-3 mr-1" />
												{request.status.replace(
													"-",
													" "
												)}
											</Badge>
											<Badge
												variant={getPriorityColor(
													request.priority
												)}
											>
												{request.priority ===
													"urgent" && (
													<AlertTriangle className="h-3 w-3 mr-1" />
												)}
												{request.priority}
											</Badge>
										</div>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2 text-sm">
									<p className="text-muted-foreground">
										{request.description}
									</p>
									<div className="flex items-center">
										<User className="h-4 w-4 mr-2 text-muted-foreground" />
										<span className="text-muted-foreground">
											{request.tenant}
										</span>
									</div>
									<div className="flex items-center">
										<Phone className="h-4 w-4 mr-2 text-muted-foreground" />
										<span className="text-muted-foreground">
											{request.tenantPhone}
										</span>
									</div>
									<div className="flex items-center">
										<MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
										<span className="text-muted-foreground">
											{request.unit}, {request.property}
										</span>
									</div>
								</div>

								<div className="border-t pt-4 space-y-2">
									<div className="flex items-center justify-between text-sm">
										<span className="flex items-center text-muted-foreground">
											<Calendar className="h-4 w-4 mr-1" />
											Reported
										</span>
										<span>
											{formatDate(request.reportedDate)}
										</span>
									</div>
									<div className="flex items-center justify-between text-sm">
										<span className="flex items-center text-muted-foreground">
											<Calendar className="h-4 w-4 mr-1" />
											Scheduled
										</span>
										<span>
											{formatDate(request.scheduledDate)}
										</span>
									</div>
									<div className="flex items-center justify-between text-sm">
										<span className="flex items-center text-muted-foreground">
											<DollarSign className="h-4 w-4 mr-1" />
											Estimated Cost
										</span>
										<span>
											{formatCurrency(
												request.estimatedCost
											)}
										</span>
									</div>
									{request.actualCost !== null && (
										<div className="flex items-center justify-between text-sm">
											<span className="flex items-center text-muted-foreground">
												<DollarSign className="h-4 w-4 mr-1" />
												Actual Cost
											</span>
											<span>
												{formatCurrency(
													request.actualCost
												)}
											</span>
										</div>
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
									<Button
										variant="outline"
										size="sm"
										className="flex-1"
									>
										<MessageSquare className="h-4 w-4 mr-2" />
										Message
									</Button>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{filteredRequests.length === 0 && (
				<div className="text-center py-8">
					<Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
					<h3 className="text-lg font-medium">
						No maintenance requests found
					</h3>
					<p className="text-muted-foreground">
						Try adjusting your search criteria
					</p>
				</div>
			)}
		</div>
	);
}
