

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBookings } from "@/lib/actions/bookings";
import { getGuests } from "@/lib/actions/guests";
import { getInventoryItems } from "@/lib/actions/inventory";
import { getProperties } from "@/lib/actions/properties";
import {
	AlertTriangle,
	Building2,
	Calendar,
	DollarSign,
	TrendingUp,
	Users,
} from "lucide-react";

export default async function DashboardPage() {
	// Fetch real data from database
	const properties = await getProperties();
	const guests = await getGuests();
	const bookings = await getBookings();
	const inventoryItems = await getInventoryItems();

	// Calculate real metrics
	const totalProperties = properties.length;
	const totalUnits = properties.reduce((sum, property) => sum + (property.totalUnits || 0), 0);
	const activeGuests = guests.filter(g => g.verificationStatus === 'verified').length;
	const totalBookingsCount = bookings.length;
	const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
	const completedBookings = bookings.filter(b => b.status === 'completed').length;
	
	// Calculate revenue (mock calculation based on bookings)
	const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
	const monthlyRevenue = totalRevenue / 6; // Assuming 6 months of data
	
	// Calculate occupancy rate
	const occupiedUnits = confirmedBookings + completedBookings;
	const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

	// Recent activities (mock data for now)
	const recentActivities = [
		{
			id: 1,
			type: "payment",
			title: "Booking payment received",
			description: `${guests[0]?.firstName || 'Guest'} - ${properties[0]?.name || 'Property'}`,
			time: "2 hours ago",
			amount: formatCurrency(bookings[0]?.totalAmount || 0),
		},
		{
			id: 2,
			type: "maintenance",
			title: "Inventory item damaged",
			description: `${inventoryItems.find(item => item.status === 'damaged')?.itemName || 'Item'} - ${properties[0]?.name || 'Property'}`,
			time: "4 hours ago",
			status: "pending",
		},
		{
			id: 3,
			type: "lease",
			title: "New booking created",
			description: `${guests[1]?.firstName || 'Guest'} - ${properties[1]?.name || 'Property'}`,
			time: "1 day ago",
			amount: formatCurrency(bookings[1]?.totalAmount || 0),
		},
		{
			id: 4,
			type: "payment",
			title: "Guest checked out",
			description: `${guests[2]?.firstName || 'Guest'} - ${properties[0]?.name || 'Property'}`,
			time: "2 days ago",
			status: "completed",
		},
	];

	// Upcoming tasks (mock data for now)
	const upcomingTasks = [
		{
			id: 1,
			title: "Guest check-in",
			tenant: guests[0]?.firstName || 'Guest',
			unit: properties[0]?.name || 'Property',
			date: "2025-06-08",
			priority: "high",
		},
		{
			id: 2,
			title: "Property inspection",
			tenant: guests[1]?.firstName || 'Guest',
			unit: properties[1]?.name || 'Property',
			date: "2025-06-10",
			priority: "medium",
		},
		{
			id: 3,
			title: "Inventory check",
			tenant: guests[2]?.firstName || 'Guest',
			unit: properties[0]?.name || 'Property',
			date: "2025-06-12",
			priority: "low",
		},
	];

	function getGreeting() {
		const hour = new Date().getHours();
		const name = "User"; // TODO: Replace with actual user name from context
		let greeting = "";

		if (hour < 12) {
			greeting = "Good morning";
		} else if (hour < 18) {
			greeting = "Good afternoon";
		} else {
			greeting = "Good evening";
		}

		return { greeting, name };
	}

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-KE', {
			style: 'currency',
			currency: 'KES'
		}).format(amount);
	}

	const { greeting, name } = getGreeting();

	return (
		<div className="space-y-6">
			<div>
				<h1 className="flex items-center gap-2 text-2xl">
					{greeting}, {name}
				</h1>
				<p className="text-muted-foreground">
					Overview of your rental properties and business metrics
				</p>
			</div>

			{/* Key Metrics */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Properties
						</CardTitle>
						<Building2 className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalProperties}</div>
						<p className="text-xs text-muted-foreground">
							{totalUnits} total units
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Active Guests
						</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{activeGuests}</div>
						<p className="text-xs text-muted-foreground">
							{guests.length} total registered
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Monthly Revenue
						</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{formatCurrency(monthlyRevenue)}</div>
						<p className="text-xs text-muted-foreground">
							{totalBookingsCount} total bookings
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Occupancy Rate
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{occupancyRate}%</div>
						<p className="text-xs text-muted-foreground">
							{occupiedUnits} of {totalUnits} units
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Recent Activities & Upcoming Tasks */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Recent Activities</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{recentActivities.map((activity) => (
								<div
									key={activity.id}
									className="flex items-start space-x-3"
								>
									<div className="flex-shrink-0">
										{activity.type === "payment" && (
											<div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
												<DollarSign className="h-4 w-4 text-green-600" />
											</div>
										)}
										{activity.type === "maintenance" && (
											<div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
												<AlertTriangle className="h-4 w-4 text-orange-600" />
											</div>
										)}
										{activity.type === "lease" && (
											<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
												<Calendar className="h-4 w-4 text-blue-600" />
											</div>
										)}
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium">
											{activity.title}
										</p>
										<p className="text-sm text-muted-foreground">
											{activity.description}
										</p>
										<div className="flex items-center space-x-2 mt-1">
											<span className="text-xs text-muted-foreground">
												{activity.time}
											</span>
											{activity.amount && (
												<Badge variant="outline" className="text-xs">
													{activity.amount}
												</Badge>
											)}
											{activity.status && (
												<Badge
													variant={
														activity.status ===
														"pending"
															? "secondary"
															: "destructive"
													}
													className="text-xs"
												>
													{activity.status}
												</Badge>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Upcoming Tasks</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{upcomingTasks.map((task) => (
								<div
									key={task.id}
									className="flex items-start space-x-3"
								>
									<div className="flex-shrink-0">
										<Badge
											variant={
												task.priority === "high"
													? "destructive"
													: task.priority === "medium"
													? "secondary"
													: "outline"
											}
											className="text-xs"
										>
											{task.priority}
										</Badge>
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium">
											{task.title}
										</p>
										<p className="text-sm text-muted-foreground">
											{task.tenant} - {task.unit}
										</p>
										<p className="text-xs text-muted-foreground mt-1">
											{task.date}
										</p>
									</div>
									<Button variant="outline" size="sm">
										View
									</Button>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
} 