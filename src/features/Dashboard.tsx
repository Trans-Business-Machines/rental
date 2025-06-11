import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import {
	AlertTriangle,
	Building2,
	Calendar,
	DollarSign,
	TrendingUp,
	Users,
} from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts";

const revenueData = [
	{ month: "Jan", revenue: 45000 },
	{ month: "Feb", revenue: 52000 },
	{ month: "Mar", revenue: 48000 },
	{ month: "Apr", revenue: 58000 },
	{ month: "May", revenue: 55000 },
	{ month: "Jun", revenue: 62000 },
];

const occupancyData = [
	{ month: "Jan", rate: 85 },
	{ month: "Feb", rate: 92 },
	{ month: "Mar", rate: 88 },
	{ month: "Apr", rate: 95 },
	{ month: "May", rate: 91 },
	{ month: "Jun", rate: 97 },
];

const recentActivities = [
	{
		id: 1,
		type: "payment",
		title: "Rent payment received",
		description: "John Doe - Apartment 2A",
		time: "2 hours ago",
		amount: "$1,200",
	},
	{
		id: 2,
		type: "maintenance",
		title: "Maintenance request",
		description: "Leaky faucet - Unit 1B",
		time: "4 hours ago",
		status: "pending",
	},
	{
		id: 3,
		type: "lease",
		title: "New lease signed",
		description: "Sarah Johnson - Studio 3C",
		time: "1 day ago",
		amount: "$950",
	},
	{
		id: 4,
		type: "payment",
		title: "Late payment reminder sent",
		description: "Mike Wilson - Apartment 4A",
		time: "2 days ago",
		status: "overdue",
	},
];

const upcomingTasks = [
	{
		id: 1,
		title: "Lease renewal discussion",
		tenant: "Emma Davis",
		unit: "Apartment 2B",
		date: "2025-06-08",
		priority: "high",
	},
	{
		id: 2,
		title: "Property inspection",
		tenant: "Robert Chen",
		unit: "Studio 1A",
		date: "2025-06-10",
		priority: "medium",
	},
	{
		id: 3,
		title: "Maintenance follow-up",
		tenant: "Lisa Park",
		unit: "Apartment 3A",
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

export function Dashboard() {
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
						<div className="text-2xl font-bold">24</div>
						<p className="text-xs text-muted-foreground">
							<span className="text-green-600">+2</span> from last
							month
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Active Tenants
						</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">87</div>
						<p className="text-xs text-muted-foreground">
							<span className="text-green-600">+5</span> from last
							month
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
						<div className="text-2xl font-bold">$62,400</div>
						<p className="text-xs text-muted-foreground">
							<span className="text-green-600">+12.5%</span> from
							last month
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
						<div className="text-2xl font-bold">97%</div>
						<p className="text-xs text-muted-foreground">
							<span className="text-green-600">+2%</span> from
							last month
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Charts */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Monthly Revenue</CardTitle>
					</CardHeader>
					<CardContent>
						<ChartContainer
							config={{
								revenue: {
									label: "Revenue",
									color: "var(--color-primary)",
								},
							}}
						>
							<BarChart
								accessibilityLayer
								data={revenueData}
								margin={{
									left: 12,
									right: 12,
								}}
							>
								<CartesianGrid vertical={false} />
								<XAxis
									dataKey="month"
									tickLine={false}
									axisLine={false}
									tickMargin={8}
								/>
								<ChartTooltip
									cursor={false}
									content={
										<ChartTooltipContent indicator="line" />
									}
								/>
								<Bar
									dataKey="revenue"
									fill="var(--color-revenue)"
									radius={4}
								/>
							</BarChart>
						</ChartContainer>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Occupancy Rate Trend</CardTitle>
					</CardHeader>
					<CardContent>
						<ChartContainer
							config={{
								rate: {
									label: "Occupancy Rate",
									color: "var(--chart-2)",
								},
							}}
						>
							<AreaChart
								accessibilityLayer
								data={occupancyData}
								margin={{
									left: 12,
									right: 12,
								}}
							>
								<CartesianGrid vertical={false} />
								<XAxis
									dataKey="month"
									tickLine={false}
									axisLine={false}
									tickMargin={8}
								/>
								<ChartTooltip
									cursor={false}
									content={
										<ChartTooltipContent indicator="line" />
									}
								/>
								<Area
									dataKey="rate"
									type="natural"
									fill="var(--color-rate)"
									fillOpacity={0.4}
									stroke="var(--color-rate)"
								/>
							</AreaChart>
						</ChartContainer>
					</CardContent>
				</Card>
			</div>

			{/* Activity and Tasks */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Recent Activity</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{recentActivities.map((activity) => (
							<div
								key={activity.id}
								className="flex items-start space-x-3 p-3 rounded-lg border"
							>
								<div className="flex-1 space-y-1">
									<div className="flex items-center justify-between">
										<p className="font-medium">
											{activity.title}
										</p>
										{activity.amount && (
											<span className="text-green-600">
												{activity.amount}
											</span>
										)}
										{activity.status && (
											<Badge
												variant={
													activity.status ===
													"overdue"
														? "destructive"
														: "secondary"
												}
											>
												{activity.status}
											</Badge>
										)}
									</div>
									<p className="text-sm text-muted-foreground">
										{activity.description}
									</p>
									<p className="text-xs text-muted-foreground">
										{activity.time}
									</p>
								</div>
							</div>
						))}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Upcoming Tasks</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{upcomingTasks.map((task) => (
							<div
								key={task.id}
								className="flex items-start space-x-3 p-3 rounded-lg border"
							>
								<Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
								<div className="flex-1 space-y-1">
									<div className="flex items-center justify-between">
										<p className="font-medium">
											{task.title}
										</p>
										<Badge
											variant={
												task.priority === "high"
													? "destructive"
													: task.priority === "medium"
													? "default"
													: "secondary"
											}
										>
											{task.priority}
										</Badge>
									</div>
									<p className="text-sm text-muted-foreground">
										{task.tenant} - {task.unit}
									</p>
									<p className="text-xs text-muted-foreground">
										{task.date}
									</p>
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			</div>

			{/* Quick Actions */}
			<Card>
				<CardHeader>
					<CardTitle>Quick Actions</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<Button className="h-auto p-4 flex-col space-y-2">
							<Building2 className="h-6 w-6" />
							<span>Add Property</span>
						</Button>
						<Button
							variant="outline"
							className="h-auto p-4 flex-col space-y-2"
						>
							<Users className="h-6 w-6" />
							<span>Add Tenant</span>
						</Button>
						<Button
							variant="outline"
							className="h-auto p-4 flex-col space-y-2"
						>
							<AlertTriangle className="h-6 w-6" />
							<span>View Maintenance</span>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
