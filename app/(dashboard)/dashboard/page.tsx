import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBookingStats, getMonthlyRevenue, getRecentBookings } from "@/lib/actions/bookings";
import { getGuestStats } from "@/lib/actions/guests";
import { getRecentInventoryActivities } from "@/lib/actions/inventory";
import { getPropertyStats, getUpcomingCheckins } from "@/lib/actions/properties";
import {
	AlertTriangle,
	Building2,
	Calendar,
	DollarSign,
	TrendingUp,
	Users,
} from "lucide-react";

export default async function DashboardPage() {
	// Fetch all data concurrently using Promise.all
	const [
		propertyStats,
		guestStats,
		bookingStats,
		monthlyRevenue,
		recentBookings,
		recentInventoryActivities,
		upcomingCheckins
	] = await Promise.all([
		getPropertyStats(),
		getGuestStats(),
		getBookingStats(),
		getMonthlyRevenue(),
		getRecentBookings(4),
		getRecentInventoryActivities(4),
		getUpcomingCheckins(4)
	]);

	// Calculate real metrics from the fetched data
	const totalProperties = propertyStats.total;
	const totalUnits = propertyStats.totalUnits;
	const occupiedUnits = propertyStats.occupiedUnits;
	const activeGuests = guestStats.verified;
	const totalBookingsCount = bookingStats.total;
	
	// Calculate occupancy rate
	const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

	// Generate real recent activities from actual data
	const recentActivities = [
		// Recent bookings
		...recentBookings.slice(0, 2).map((booking) => ({
			id: `booking-${booking.id}`,
			type: "lease" as const,
			title: "New booking created",
			description: `${booking.guest.firstName} ${booking.guest.lastName} - ${booking.property.name}`,
			time: formatTimeAgo(booking.createdAt),
			amount: formatCurrency(booking.totalAmount),
		})),
		// Recent inventory issues
		...recentInventoryActivities.slice(0, 1).map((item) => ({
			id: `inventory-${item.id}`,
			type: "maintenance" as const,
			title: `Inventory item ${item.status}`,
			description: `${item.itemName} - ${item.property.name}`,
			time: formatTimeAgo(item.updatedAt),
			status: item.status,
		})),
		// Recent payments (from bookings)
		...recentBookings.slice(2, 3).map((booking) => ({
			id: `payment-${booking.id}`,
			type: "payment" as const,
			title: "Booking payment received",
			description: `${booking.guest.firstName} ${booking.guest.lastName} - ${booking.property.name}`,
			time: formatTimeAgo(booking.createdAt),
			amount: formatCurrency(booking.totalAmount),
		}))
	].slice(0, 4); // Limit to 4 activities

	// Generate real upcoming tasks from actual data
	const upcomingTasks = upcomingCheckins.map((booking) => ({
		id: booking.id,
		title: "Guest check-in",
		tenant: `${booking.guest.firstName} ${booking.guest.lastName}`,
		unit: `${booking.property.name} - ${booking.unit.name}`,
		date: formatDate(booking.checkInDate),
		priority: getPriorityFromDate(booking.checkInDate),
	}));

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

	function formatTimeAgo(date: Date) {
		const now = new Date();
		const diffInMs = now.getTime() - new Date(date).getTime();
		const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
		const diffInDays = Math.floor(diffInHours / 24);

		if (diffInHours < 1) {
			return "Just now";
		} else if (diffInHours < 24) {
			return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
		} else if (diffInDays < 7) {
			return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
		} else {
			return formatDate(date);
		}
	}

	function formatDate(date: Date) {
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		}).format(new Date(date));
	}

	function getPriorityFromDate(checkInDate: Date) {
		const now = new Date();
		const diffInMs = new Date(checkInDate).getTime() - now.getTime();
		const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

		if (diffInDays <= 1) return "high";
		if (diffInDays <= 3) return "medium";
		return "low";
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
							{guestStats.total} total registered
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
							{recentActivities.length > 0 ? (
								recentActivities.map((activity) => (
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
																							{'amount' in activity && activity.amount && (
												<Badge variant="outline" className="text-xs">
													{activity.amount}
												</Badge>
											)}
											{'status' in activity && activity.status && (
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
								))
							) : (
								<p className="text-sm text-muted-foreground">No recent activities</p>
							)}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Upcoming Tasks</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{upcomingTasks.length > 0 ? (
								upcomingTasks.map((task) => (
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
								))
							) : (
								<p className="text-sm text-muted-foreground">No upcoming tasks</p>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
} 