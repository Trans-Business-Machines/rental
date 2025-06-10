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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
	AlertCircle,
	Calendar,
	Car,
	Check,
	Clock,
	Coffee,
	Dumbbell,
	Filter,
	Search,
	Users,
	Waves,
	X,
} from "lucide-react";
import { useState } from "react";

type BookingRequest = {
	id: number;
	tenantName: string;
	tenantUnit: string;
	tenantEmail: string;
	amenityType: string;
	amenityName: string;
	requestDate: string;
	bookingDate: string;
	startTime: string;
	endTime: string;
	duration: string;
	status: "pending" | "approved" | "rejected";
	notes?: string;
	requestedAt: string;
	priority: "high" | "medium" | "low";
	approvedAt?: string;
	rejectedAt?: string;
	rejectionReason?: string;
};

// Mock data for amenity booking requests
const mockBookingRequests: BookingRequest[] = [
	{
		id: 1,
		tenantName: "John Doe",
		tenantUnit: "Apartment 2A",
		tenantEmail: "john.doe@email.com",
		amenityType: "parking",
		amenityName: "Parking Spot #15",
		requestDate: "2025-06-05",
		bookingDate: "2025-06-08",
		startTime: "09:00",
		endTime: "18:00",
		duration: "9 hours",
		status: "pending",
		notes: "Need parking for work vehicle during office hours",
		requestedAt: "2025-06-05T10:30:00",
		priority: "medium",
	},
	{
		id: 2,
		tenantName: "Sarah Johnson",
		tenantUnit: "Studio 3C",
		tenantEmail: "sarah.j@email.com",
		amenityType: "gym",
		amenityName: "Fitness Center",
		requestDate: "2025-06-05",
		bookingDate: "2025-06-07",
		startTime: "06:00",
		endTime: "07:30",
		duration: "1.5 hours",
		status: "pending",
		notes: "Early morning workout session",
		requestedAt: "2025-06-05T14:15:00",
		priority: "low",
	},
	{
		id: 3,
		tenantName: "Mike Wilson",
		tenantUnit: "Apartment 4A",
		tenantEmail: "mike.wilson@email.com",
		amenityType: "pool",
		amenityName: "Swimming Pool",
		requestDate: "2025-06-04",
		bookingDate: "2025-06-09",
		startTime: "15:00",
		endTime: "17:00",
		duration: "2 hours",
		status: "approved",
		notes: "Family pool time for weekend",
		requestedAt: "2025-06-04T16:20:00",
		approvedAt: "2025-06-05T09:15:00",
		priority: "medium",
	},
	{
		id: 4,
		tenantName: "Emma Davis",
		tenantUnit: "Apartment 2B",
		tenantEmail: "emma.davis@email.com",
		amenityType: "community_room",
		amenityName: "Community Room",
		requestDate: "2025-06-03",
		bookingDate: "2025-06-10",
		startTime: "19:00",
		endTime: "22:00",
		duration: "3 hours",
		status: "rejected",
		notes: "Birthday party for 20 people",
		requestedAt: "2025-06-03T11:45:00",
		rejectedAt: "2025-06-04T08:30:00",
		rejectionReason: "Exceeds maximum capacity of 15 people",
		priority: "high",
	},
	{
		id: 5,
		tenantName: "Robert Chen",
		tenantUnit: "Condo 1A",
		tenantEmail: "robert.chen@email.com",
		amenityType: "bbq",
		amenityName: "BBQ Area #2",
		requestDate: "2025-06-05",
		bookingDate: "2025-06-06",
		startTime: "12:00",
		endTime: "16:00",
		duration: "4 hours",
		status: "pending",
		notes: "Weekend family BBQ",
		requestedAt: "2025-06-05T16:45:00",
		priority: "high",
	},
];

export function BookingRequests() {
	const [bookingRequests, setBookingRequests] =
		useState<BookingRequest[]>(mockBookingRequests);
	const [searchQuery, setSearchQuery] = useState("");
	const [filterStatus] = useState("all");
	const [selectedTab, setSelectedTab] = useState("pending");

	const handleApproveRequest = (requestId: number) => {
		setBookingRequests((requests) =>
			requests.map((request) =>
				request.id === requestId
					? {
							...request,
							status: "approved",
							approvedAt: new Date().toISOString(),
							rejectedAt: undefined,
							rejectionReason: undefined,
					  }
					: request
			)
		);
	};

	const handleRejectRequest = (requestId: number, reason: string) => {
		setBookingRequests((requests) =>
			requests.map((request) =>
				request.id === requestId
					? {
							...request,
							status: "rejected",
							rejectedAt: new Date().toISOString(),
							rejectionReason: reason,
							approvedAt: undefined,
					  }
					: request
			)
		);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "pending":
				return "secondary";
			case "approved":
				return "default";
			case "rejected":
				return "destructive";
			default:
				return "secondary";
		}
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "high":
				return "destructive";
			case "medium":
				return "default";
			case "low":
				return "secondary";
			default:
				return "secondary";
		}
	};

	const getAmenityIcon = (type: string) => {
		switch (type) {
			case "parking":
				return Car;
			case "gym":
				return Dumbbell;
			case "pool":
				return Waves;
			case "community_room":
				return Users;
			case "bbq":
				return Coffee;
			default:
				return Calendar;
		}
	};

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase();
	};

	const formatDateTime = (dateString: string) => {
		return new Date(dateString).toLocaleString();
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString();
	};

	const filteredRequests = bookingRequests.filter((request) => {
		const matchesSearch =
			request.tenantName
				.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
			request.amenityName
				.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
			request.tenantUnit
				.toLowerCase()
				.includes(searchQuery.toLowerCase());

		const matchesFilter =
			filterStatus === "all" || request.status === filterStatus;

		return matchesSearch && matchesFilter;
	});

	const pendingRequests = filteredRequests.filter(
		(r) => r.status === "pending"
	);
	const approvedRequests = filteredRequests.filter(
		(r) => r.status === "approved"
	);
	const rejectedRequests = filteredRequests.filter(
		(r) => r.status === "rejected"
	);

	const totalRequests = bookingRequests.length;
	const pendingCount = bookingRequests.filter(
		(r) => r.status === "pending"
	).length;
	const approvedCount = bookingRequests.filter(
		(r) => r.status === "approved"
	).length;
	const rejectedCount = bookingRequests.filter(
		(r) => r.status === "rejected"
	).length;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1>Booking Requests</h1>
					<p className="text-muted-foreground">
						Review and manage tenant amenity booking requests
					</p>
				</div>
				<div className="flex items-center space-x-2">
					<Badge
						variant="secondary"
						className="flex items-center space-x-1"
					>
						<AlertCircle className="h-3 w-3" />
						<span>{pendingCount} pending approval</span>
					</Badge>
				</div>
			</div>

			{/* Summary Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Requests
						</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{totalRequests}
						</div>
						<p className="text-xs text-muted-foreground">
							All time requests
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
						<div className="text-2xl font-bold text-orange-600">
							{pendingCount}
						</div>
						<p className="text-xs text-muted-foreground">
							Awaiting review
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Approved
						</CardTitle>
						<Check className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">
							{approvedCount}
						</div>
						<p className="text-xs text-muted-foreground">
							{approvedCount > 0
								? Math.round(
										(approvedCount / totalRequests) * 100
								  )
								: 0}
							% approval rate
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Rejected
						</CardTitle>
						<X className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-red-600">
							{rejectedCount}
						</div>
						<p className="text-xs text-muted-foreground">
							{rejectedCount > 0
								? Math.round(
										(rejectedCount / totalRequests) * 100
								  )
								: 0}
							% rejection rate
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
				<Button variant="outline" size="sm">
					<Filter className="h-4 w-4 mr-2" />
					Filter
				</Button>
			</div>

			<Tabs value={selectedTab} onValueChange={setSelectedTab}>
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="pending" className="relative">
						Pending Requests
						{pendingCount > 0 && (
							<Badge
								variant="destructive"
								className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
							>
								{pendingCount}
							</Badge>
						)}
					</TabsTrigger>
					<TabsTrigger value="approved">
						Approved ({approvedCount})
					</TabsTrigger>
					<TabsTrigger value="rejected">
						Rejected ({rejectedCount})
					</TabsTrigger>
				</TabsList>

				{/* Pending Requests */}
				<TabsContent value="pending" className="space-y-4">
					{pendingRequests.length === 0 ? (
						<Card>
							<CardContent className="flex flex-col items-center justify-center py-12">
								<Clock className="h-12 w-12 text-muted-foreground mb-4" />
								<h3 className="text-lg font-medium mb-2">
									No pending requests
								</h3>
								<p className="text-muted-foreground text-center">
									All amenity booking requests have been
									reviewed.
								</p>
							</CardContent>
						</Card>
					) : (
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							{pendingRequests.map((request) => {
								const IconComponent = getAmenityIcon(
									request.amenityType
								);
								return (
									<Card
										key={request.id}
										className="hover:shadow-lg transition-shadow border-l-4 border-l-orange-500"
									>
										<CardHeader>
											<div className="flex items-start justify-between">
												<div className="flex items-start space-x-3">
													<Avatar>
														<AvatarFallback>
															{getInitials(
																request.tenantName
															)}
														</AvatarFallback>
													</Avatar>
													<div className="space-y-1">
														<CardTitle className="text-lg">
															{request.tenantName}
														</CardTitle>
														<p className="text-sm text-muted-foreground">
															{request.tenantUnit}
														</p>
														<div className="flex space-x-2">
															<Badge
																variant={getStatusColor(
																	request.status
																)}
															>
																{request.status}
															</Badge>
															<Badge
																variant={getPriorityColor(
																	request.priority
																)}
															>
																{
																	request.priority
																}{" "}
																priority
															</Badge>
														</div>
													</div>
												</div>
												<IconComponent className="h-6 w-6 text-muted-foreground" />
											</div>
										</CardHeader>
										<CardContent className="space-y-4">
											<div className="space-y-2">
												<div className="flex items-center justify-between">
													<span className="text-sm text-muted-foreground">
														Amenity
													</span>
													<span className="font-medium">
														{request.amenityName}
													</span>
												</div>
												<div className="flex items-center justify-between">
													<span className="text-sm text-muted-foreground">
														Date
													</span>
													<span className="font-medium">
														{formatDate(
															request.bookingDate
														)}
													</span>
												</div>
												<div className="flex items-center justify-between">
													<span className="text-sm text-muted-foreground">
														Time
													</span>
													<span className="font-medium">
														{request.startTime} -{" "}
														{request.endTime}
													</span>
												</div>
												<div className="flex items-center justify-between">
													<span className="text-sm text-muted-foreground">
														Duration
													</span>
													<span className="font-medium">
														{request.duration}
													</span>
												</div>
											</div>

											{request.notes && (
												<div className="border-t pt-3">
													<p className="text-sm text-muted-foreground mb-1">
														Tenant Notes
													</p>
													<p className="text-sm bg-muted p-2 rounded">
														{request.notes}
													</p>
												</div>
											)}

											<div className="border-t pt-3">
												<p className="text-xs text-muted-foreground">
													Requested{" "}
													{formatDateTime(
														request.requestedAt
													)}
												</p>
											</div>

											<div className="flex space-x-2">
												<Button
													size="sm"
													className="flex-1"
													onClick={() =>
														handleApproveRequest(
															request.id
														)
													}
												>
													<Check className="h-4 w-4 mr-2" />
													Approve
												</Button>
												<Dialog>
													<DialogTrigger asChild>
														<Button
															variant="destructive"
															size="sm"
															className="flex-1"
														>
															<X className="h-4 w-4 mr-2" />
															Reject
														</Button>
													</DialogTrigger>
													<DialogContent className="max-w-md">
														<DialogHeader>
															<DialogTitle>
																Reject Booking
																Request
															</DialogTitle>
														</DialogHeader>
														<div className="space-y-4">
															<div className="p-3 bg-muted rounded">
																<p className="text-sm font-medium">
																	{
																		request.tenantName
																	}
																</p>
																<p className="text-sm text-muted-foreground">
																	{
																		request.amenityName
																	}
																</p>
																<p className="text-sm text-muted-foreground">
																	{formatDate(
																		request.bookingDate
																	)}{" "}
																	•{" "}
																	{
																		request.startTime
																	}{" "}
																	-{" "}
																	{
																		request.endTime
																	}
																</p>
															</div>
															<div>
																<label className="text-sm font-medium">
																	Reason for
																	rejection
																</label>
																<Textarea
																	placeholder="Please provide a detailed reason for rejecting this request..."
																	id={`rejection-reason-${request.id}`}
																	className="mt-1"
																/>
															</div>
															<Button
																onClick={() => {
																	const reasonElement =
																		document.getElementById(
																			`rejection-reason-${request.id}`
																		) as HTMLTextAreaElement;
																	const reason =
																		reasonElement?.value ||
																		"No reason provided";
																	handleRejectRequest(
																		request.id,
																		reason
																	);
																}}
																className="w-full"
																variant="destructive"
															>
																Reject Request
															</Button>
														</div>
													</DialogContent>
												</Dialog>
											</div>
										</CardContent>
									</Card>
								);
							})}
						</div>
					)}
				</TabsContent>

				{/* Approved Requests */}
				<TabsContent value="approved" className="space-y-4">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{approvedRequests.map((request) => {
							const IconComponent = getAmenityIcon(
								request.amenityType
							);
							return (
								<Card
									key={request.id}
									className="border-l-4 border-l-green-500"
								>
									<CardHeader>
										<div className="flex items-start justify-between">
											<div className="flex items-start space-x-3">
												<Avatar>
													<AvatarFallback>
														{getInitials(
															request.tenantName
														)}
													</AvatarFallback>
												</Avatar>
												<div className="space-y-1">
													<CardTitle className="text-lg">
														{request.tenantName}
													</CardTitle>
													<p className="text-sm text-muted-foreground">
														{request.tenantUnit}
													</p>
													<Badge
														variant={getStatusColor(
															request.status
														)}
													>
														{request.status}
													</Badge>
												</div>
											</div>
											<IconComponent className="h-6 w-6 text-muted-foreground" />
										</div>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="space-y-2">
											<div className="flex items-center justify-between">
												<span className="text-sm text-muted-foreground">
													Amenity
												</span>
												<span className="font-medium">
													{request.amenityName}
												</span>
											</div>
											<div className="flex items-center justify-between">
												<span className="text-sm text-muted-foreground">
													Date
												</span>
												<span className="font-medium">
													{formatDate(
														request.bookingDate
													)}
												</span>
											</div>
											<div className="flex items-center justify-between">
												<span className="text-sm text-muted-foreground">
													Time
												</span>
												<span className="font-medium">
													{request.startTime} -{" "}
													{request.endTime}
												</span>
											</div>
										</div>
										{request.approvedAt && (
											<div className="border-t pt-3">
												<p className="text-xs text-muted-foreground">
													Approved{" "}
													{formatDateTime(
														request.approvedAt
													)}
												</p>
											</div>
										)}
									</CardContent>
								</Card>
							);
						})}
					</div>
				</TabsContent>

				{/* Rejected Requests */}
				<TabsContent value="rejected" className="space-y-4">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{rejectedRequests.map((request) => {
							const IconComponent = getAmenityIcon(
								request.amenityType
							);
							return (
								<Card
									key={request.id}
									className="border-l-4 border-l-red-500"
								>
									<CardHeader>
										<div className="flex items-start justify-between">
											<div className="flex items-start space-x-3">
												<Avatar>
													<AvatarFallback>
														{getInitials(
															request.tenantName
														)}
													</AvatarFallback>
												</Avatar>
												<div className="space-y-1">
													<CardTitle className="text-lg">
														{request.tenantName}
													</CardTitle>
													<p className="text-sm text-muted-foreground">
														{request.tenantUnit}
													</p>
													<Badge
														variant={getStatusColor(
															request.status
														)}
													>
														{request.status}
													</Badge>
												</div>
											</div>
											<IconComponent className="h-6 w-6 text-muted-foreground" />
										</div>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="space-y-2">
											<div className="flex items-center justify-between">
												<span className="text-sm text-muted-foreground">
													Amenity
												</span>
												<span className="font-medium">
													{request.amenityName}
												</span>
											</div>
											<div className="flex items-center justify-between">
												<span className="text-sm text-muted-foreground">
													Date
												</span>
												<span className="font-medium">
													{formatDate(
														request.bookingDate
													)}
												</span>
											</div>
											<div className="flex items-center justify-between">
												<span className="text-sm text-muted-foreground">
													Time
												</span>
												<span className="font-medium">
													{request.startTime} -{" "}
													{request.endTime}
												</span>
											</div>
										</div>
										{request.rejectionReason && (
											<div className="border-t pt-3">
												<p className="text-sm text-muted-foreground mb-1">
													Rejection Reason
												</p>
												<p className="text-sm bg-destructive/10 text-destructive p-2 rounded border">
													{request.rejectionReason}
												</p>
											</div>
										)}
										{request.rejectedAt && (
											<div className="border-t pt-3">
												<p className="text-xs text-muted-foreground">
													Rejected{" "}
													{formatDateTime(
														request.rejectedAt
													)}
												</p>
											</div>
										)}
									</CardContent>
								</Card>
							);
						})}
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
