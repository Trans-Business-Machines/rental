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
import {
	AlertCircle,
	CheckCircle,
	Clock,
	CreditCard,
	DollarSign,
	Download,
	Edit,
	Eye,
	Plus,
	Receipt,
	Search,
	Send,
	TrendingDown,
	TrendingUp,
	XCircle,
} from "lucide-react";
import { useState } from "react";

const mockPayments = [
	{
		id: 1,
		tenantName: "Sarah Johnson",
		tenantUnit: "Apartment 2A",
		property: "Sunset Apartments",
		amount: 1200,
		dueDate: "2025-06-01",
		paidDate: "2025-06-01",
		status: "paid",
		paymentMethod: "ACH Transfer",
		type: "rent",
		late: false,
		lateFee: 0,
	},
	{
		id: 2,
		tenantName: "Mike Wilson",
		tenantUnit: "Condo 3B",
		property: "Green Valley Condos",
		amount: 1800,
		dueDate: "2025-06-01",
		paidDate: null,
		status: "overdue",
		paymentMethod: null,
		type: "rent",
		late: true,
		lateFee: 75,
	},
	{
		id: 3,
		tenantName: "Emma Davis",
		tenantUnit: "Studio 1C",
		property: "Riverside Studios",
		amount: 950,
		dueDate: "2025-06-01",
		paidDate: "2025-05-30",
		status: "paid",
		paymentMethod: "Credit Card",
		type: "rent",
		late: false,
		lateFee: 0,
	},
	{
		id: 4,
		tenantName: "John Doe",
		tenantUnit: "Townhouse 4A",
		property: "Heritage Townhomes",
		amount: 2200,
		dueDate: "2025-06-01",
		paidDate: null,
		status: "pending",
		paymentMethod: null,
		type: "rent",
		late: false,
		lateFee: 0,
	},
	{
		id: 5,
		tenantName: "Lisa Chen",
		tenantUnit: "Loft 2B",
		property: "Metro Lofts",
		amount: 500,
		dueDate: "2025-05-15",
		paidDate: "2025-05-20",
		status: "paid",
		paymentMethod: "ACH Transfer",
		type: "deposit",
		late: true,
		lateFee: 25,
	},
	{
		id: 6,
		tenantName: "Robert Chen",
		tenantUnit: "Apartment 3A",
		property: "Parkside Apartments",
		amount: 150,
		dueDate: "2025-05-30",
		paidDate: null,
		status: "overdue",
		paymentMethod: null,
		type: "utility",
		late: true,
		lateFee: 15,
	},
];

const mockFinancialSummary = {
	totalRevenue: 8650,
	collectedThisMonth: 7100,
	outstandingBalance: 1550,
	overduePayments: 2,
	averageCollectionTime: 2.3,
	collectionRate: 95.2,
};

export function Payments() {
	const [payments, setPayments] = useState(mockPayments);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [typeFilter, setTypeFilter] = useState("all");
	const [selectedTab, setSelectedTab] = useState("payments");
	const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);

	const filteredPayments = payments.filter((payment) => {
		const matchesSearch =
			payment.tenantName
				.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
			payment.tenantUnit
				.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
			payment.property.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesStatus =
			statusFilter === "all" || payment.status === statusFilter;
		const matchesType = typeFilter === "all" || payment.type === typeFilter;

		return matchesSearch && matchesStatus && matchesType;
	});

	const getStatusColor = (status: string) => {
		switch (status) {
			case "paid":
				return "default";
			case "pending":
				return "secondary";
			case "overdue":
				return "destructive";
			default:
				return "secondary";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "paid":
				return CheckCircle;
			case "pending":
				return Clock;
			case "overdue":
				return XCircle;
			default:
				return AlertCircle;
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

	const paidPayments = payments.filter((p) => p.status === "paid");
	const pendingPayments = payments.filter((p) => p.status === "pending");
	const overduePayments = payments.filter((p) => p.status === "overdue");

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1>Payments</h1>
					<p className="text-muted-foreground">
						Track rent payments and financial transactions
					</p>
				</div>
				<div className="flex space-x-2">
					<Button variant="outline">
						<Download className="h-4 w-4 mr-2" />
						Export
					</Button>
					<Dialog
						open={isRecordPaymentOpen}
						onOpenChange={setIsRecordPaymentOpen}
					>
						<DialogTrigger asChild>
							<Button>
								<Plus className="h-4 w-4 mr-2" />
								Record Payment
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-md">
							<DialogHeader>
								<DialogTitle>Record New Payment</DialogTitle>
							</DialogHeader>
							<div className="space-y-4">
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
									<Label htmlFor="amount">Amount</Label>
									<Input
										id="amount"
										type="number"
										placeholder="0.00"
									/>
								</div>
								<div>
									<Label htmlFor="payment-type">
										Payment Type
									</Label>
									<Select>
										<SelectTrigger>
											<SelectValue placeholder="Select type" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="rent">
												Rent
											</SelectItem>
											<SelectItem value="deposit">
												Deposit
											</SelectItem>
											<SelectItem value="utility">
												Utility
											</SelectItem>
											<SelectItem value="late-fee">
												Late Fee
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor="payment-method">
										Payment Method
									</Label>
									<Select>
										<SelectTrigger>
											<SelectValue placeholder="Select method" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="ach">
												ACH Transfer
											</SelectItem>
											<SelectItem value="credit">
												Credit Card
											</SelectItem>
											<SelectItem value="check">
												Check
											</SelectItem>
											<SelectItem value="cash">
												Cash
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor="payment-date">
										Payment Date
									</Label>
									<Input id="payment-date" type="date" />
								</div>
								<Button className="w-full">
									Record Payment
								</Button>
							</div>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			{/* Financial Summary */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Revenue
						</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatCurrency(mockFinancialSummary.totalRevenue)}
						</div>
						<p className="text-xs text-muted-foreground">
							This month
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Collected
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatCurrency(
								mockFinancialSummary.collectedThisMonth
							)}
						</div>
						<p className="text-xs text-muted-foreground">
							{(
								(mockFinancialSummary.collectedThisMonth /
									mockFinancialSummary.totalRevenue) *
								100
							).toFixed(1)}
							% of total
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Outstanding
						</CardTitle>
						<TrendingDown className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatCurrency(
								mockFinancialSummary.outstandingBalance
							)}
						</div>
						<p className="text-xs text-muted-foreground">
							{overduePayments.length} overdue payments
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Collection Rate
						</CardTitle>
						<CheckCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{mockFinancialSummary.collectionRate}%
						</div>
						<p className="text-xs text-muted-foreground">
							Last 12 months
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Avg Collection
						</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{mockFinancialSummary.averageCollectionTime} days
						</div>
						<p className="text-xs text-muted-foreground">
							Average time
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Late Payments
						</CardTitle>
						<AlertCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{payments.filter((p) => p.late).length}
						</div>
						<p className="text-xs text-muted-foreground">
							This month
						</p>
					</CardContent>
				</Card>
			</div>

			<Tabs value={selectedTab} onValueChange={setSelectedTab}>
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="payments">
						All Payments ({payments.length})
					</TabsTrigger>
					<TabsTrigger value="pending">
						Pending ({pendingPayments.length})
					</TabsTrigger>
					<TabsTrigger value="overdue">
						Overdue ({overduePayments.length})
					</TabsTrigger>
					<TabsTrigger value="reports">Reports</TabsTrigger>
				</TabsList>

				{/* All Payments */}
				<TabsContent value="payments" className="space-y-4">
					{/* Search and Filters */}
					<div className="flex items-center space-x-4">
						<div className="relative flex-1 max-w-md">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
							<Input
								placeholder="Search payments..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>
						<Select
							value={statusFilter}
							onValueChange={setStatusFilter}
						>
							<SelectTrigger className="w-32">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="paid">Paid</SelectItem>
								<SelectItem value="pending">Pending</SelectItem>
								<SelectItem value="overdue">Overdue</SelectItem>
							</SelectContent>
						</Select>
						<Select
							value={typeFilter}
							onValueChange={setTypeFilter}
						>
							<SelectTrigger className="w-32">
								<SelectValue placeholder="Type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Types</SelectItem>
								<SelectItem value="rent">Rent</SelectItem>
								<SelectItem value="deposit">Deposit</SelectItem>
								<SelectItem value="utility">Utility</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Payments List */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{filteredPayments.map((payment) => {
							const StatusIcon = getStatusIcon(payment.status);
							const totalAmount =
								payment.amount + payment.lateFee;

							return (
								<Card
									key={payment.id}
									className="hover:shadow-lg transition-shadow"
								>
									<CardHeader>
										<div className="flex items-start justify-between">
											<div className="flex items-start space-x-3">
												<Avatar>
													<AvatarFallback>
														{payment.tenantName
															.split(" ")
															.map((n) => n[0])
															.join("")}
													</AvatarFallback>
												</Avatar>
												<div className="space-y-1">
													<CardTitle className="text-lg">
														{payment.tenantName}
													</CardTitle>
													<p className="text-sm text-muted-foreground">
														{payment.tenantUnit}
													</p>
													<p className="text-sm text-muted-foreground">
														{payment.property}
													</p>
												</div>
											</div>
											<div className="flex items-center space-x-2">
												<Badge
													variant={getStatusColor(
														payment.status
													)}
												>
													<StatusIcon className="h-3 w-3 mr-1" />
													{payment.status}
												</Badge>
											</div>
										</div>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="grid grid-cols-2 gap-4 text-sm">
											<div>
												<span className="text-muted-foreground">
													Amount
												</span>
												<p className="font-medium">
													{formatCurrency(
														payment.amount
													)}
												</p>
											</div>
											<div>
												<span className="text-muted-foreground">
													Type
												</span>
												<p className="font-medium capitalize">
													{payment.type}
												</p>
											</div>
											<div>
												<span className="text-muted-foreground">
													Due Date
												</span>
												<p className="font-medium">
													{formatDate(
														payment.dueDate
													)}
												</p>
											</div>
											<div>
												<span className="text-muted-foreground">
													Paid Date
												</span>
												<p className="font-medium">
													{payment.paidDate
														? formatDate(
																payment.paidDate
														  )
														: "Not paid"}
												</p>
											</div>
										</div>

										{payment.late &&
											payment.lateFee > 0 && (
												<div className="p-3 bg-destructive/10 rounded-lg">
													<div className="flex items-center justify-between text-sm">
														<span className="text-destructive">
															Late Fee
														</span>
														<span className="font-medium text-destructive">
															{formatCurrency(
																payment.lateFee
															)}
														</span>
													</div>
													<div className="flex items-center justify-between text-sm font-medium mt-1">
														<span>
															Total Amount
														</span>
														<span>
															{formatCurrency(
																totalAmount
															)}
														</span>
													</div>
												</div>
											)}

										{payment.paymentMethod && (
											<div className="border-t pt-3">
												<div className="flex items-center space-x-2 text-sm">
													<CreditCard className="h-4 w-4 text-muted-foreground" />
													<span className="text-muted-foreground">
														Payment Method:
													</span>
													<span className="font-medium">
														{payment.paymentMethod}
													</span>
												</div>
											</div>
										)}

										<div className="flex space-x-2">
											{payment.status === "pending" && (
												<Button
													size="sm"
													className="flex-1"
												>
													<Send className="h-4 w-4 mr-2" />
													Send Reminder
												</Button>
											)}
											<Button
												variant="outline"
												size="sm"
												className="flex-1"
											>
												<Eye className="h-4 w-4 mr-2" />
												View Details
											</Button>
											<Button
												variant="outline"
												size="sm"
												className="flex-1"
											>
												<Receipt className="h-4 w-4 mr-2" />
												Receipt
											</Button>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				</TabsContent>

				{/* Pending Payments */}
				<TabsContent value="pending" className="space-y-4">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{pendingPayments.map((payment) => {
							const StatusIcon = getStatusIcon(payment.status);

							return (
								<Card
									key={payment.id}
									className="border-l-4 border-l-yellow-500"
								>
									<CardHeader>
										<div className="flex items-start justify-between">
											<div className="flex items-start space-x-3">
												<Avatar>
													<AvatarFallback>
														{payment.tenantName
															.split(" ")
															.map((n) => n[0])
															.join("")}
													</AvatarFallback>
												</Avatar>
												<div className="space-y-1">
													<CardTitle className="text-lg">
														{payment.tenantName}
													</CardTitle>
													<p className="text-sm text-muted-foreground">
														{payment.tenantUnit}
													</p>
													<p className="text-sm text-muted-foreground">
														{payment.property}
													</p>
												</div>
											</div>
											<Badge
												variant={getStatusColor(
													payment.status
												)}
											>
												<StatusIcon className="h-3 w-3 mr-1" />
												{payment.status}
											</Badge>
										</div>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="grid grid-cols-2 gap-4 text-sm">
											<div>
												<span className="text-muted-foreground">
													Amount
												</span>
												<p className="font-medium">
													{formatCurrency(
														payment.amount
													)}
												</p>
											</div>
											<div>
												<span className="text-muted-foreground">
													Due Date
												</span>
												<p className="font-medium">
													{formatDate(
														payment.dueDate
													)}
												</p>
											</div>
										</div>

										<div className="flex space-x-2">
											<Button
												size="sm"
												className="flex-1"
											>
												<Send className="h-4 w-4 mr-2" />
												Send Reminder
											</Button>
											<Button
												variant="outline"
												size="sm"
												className="flex-1"
											>
												<Edit className="h-4 w-4 mr-2" />
												Record Payment
											</Button>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				</TabsContent>

				{/* Overdue Payments */}
				<TabsContent value="overdue" className="space-y-4">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{overduePayments.map((payment) => {
							const StatusIcon = getStatusIcon(payment.status);
							const daysOverdue = Math.floor(
								(new Date().getTime() -
									new Date(payment.dueDate).getTime()) /
									(1000 * 3600 * 24)
							);

							return (
								<Card
									key={payment.id}
									className="border-l-4 border-l-red-500"
								>
									<CardHeader>
										<div className="flex items-start justify-between">
											<div className="flex items-start space-x-3">
												<Avatar>
													<AvatarFallback>
														{payment.tenantName
															.split(" ")
															.map((n) => n[0])
															.join("")}
													</AvatarFallback>
												</Avatar>
												<div className="space-y-1">
													<CardTitle className="text-lg">
														{payment.tenantName}
													</CardTitle>
													<p className="text-sm text-muted-foreground">
														{payment.tenantUnit}
													</p>
													<p className="text-sm text-muted-foreground">
														{payment.property}
													</p>
												</div>
											</div>
											<Badge
												variant={getStatusColor(
													payment.status
												)}
											>
												<StatusIcon className="h-3 w-3 mr-1" />
												{payment.status}
											</Badge>
										</div>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="p-3 bg-destructive/10 rounded-lg">
											<div className="flex items-center justify-between text-sm mb-2">
												<span className="text-destructive font-medium">
													{daysOverdue} days overdue
												</span>
												<span className="font-medium">
													{formatCurrency(
														payment.amount
													)}
												</span>
											</div>
											{payment.lateFee > 0 && (
												<div className="flex items-center justify-between text-sm">
													<span className="text-destructive">
														Late Fee
													</span>
													<span className="font-medium text-destructive">
														{formatCurrency(
															payment.lateFee
														)}
													</span>
												</div>
											)}
										</div>

										<div className="flex space-x-2">
											<Button
												size="sm"
												variant="destructive"
												className="flex-1"
											>
												<Send className="h-4 w-4 mr-2" />
												Send Notice
											</Button>
											<Button
												variant="outline"
												size="sm"
												className="flex-1"
											>
												<Edit className="h-4 w-4 mr-2" />
												Record Payment
											</Button>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				</TabsContent>

				{/* Reports */}
				<TabsContent value="reports" className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<Card>
							<CardHeader>
								<CardTitle>Monthly Revenue Report</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<p className="text-sm text-muted-foreground">
									Generate detailed monthly revenue and
									collection reports
								</p>
								<div className="flex space-x-2">
									<Select defaultValue="2025-06">
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="2025-06">
												June 2025
											</SelectItem>
											<SelectItem value="2025-05">
												May 2025
											</SelectItem>
											<SelectItem value="2025-04">
												April 2025
											</SelectItem>
										</SelectContent>
									</Select>
									<Button variant="outline">
										<Download className="h-4 w-4 mr-2" />
										Generate
									</Button>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Tenant Payment History</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<p className="text-sm text-muted-foreground">
									Export payment history for specific tenants
									or properties
								</p>
								<div className="flex space-x-2">
									<Select>
										<SelectTrigger>
											<SelectValue placeholder="Select tenant" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">
												All Tenants
											</SelectItem>
											<SelectItem value="sarah">
												Sarah Johnson
											</SelectItem>
											<SelectItem value="mike">
												Mike Wilson
											</SelectItem>
										</SelectContent>
									</Select>
									<Button variant="outline">
										<Download className="h-4 w-4 mr-2" />
										Export
									</Button>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Late Payment Analysis</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<p className="text-sm text-muted-foreground">
									Analyze late payment trends and collection
									efficiency
								</p>
								<Button variant="outline" className="w-full">
									<TrendingUp className="h-4 w-4 mr-2" />
									View Analysis
								</Button>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Tax Reports</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<p className="text-sm text-muted-foreground">
									Generate tax-ready reports for rental income
								</p>
								<div className="flex space-x-2">
									<Select defaultValue="2024">
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="2024">
												2024
											</SelectItem>
											<SelectItem value="2023">
												2023
											</SelectItem>
											<SelectItem value="2022">
												2022
											</SelectItem>
										</SelectContent>
									</Select>
									<Button variant="outline">
										<Download className="h-4 w-4 mr-2" />
										Generate
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>

			{filteredPayments.length === 0 && selectedTab === "payments" && (
				<div className="text-center py-8">
					<DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
					<h3 className="text-lg font-medium">No payments found</h3>
					<p className="text-muted-foreground">
						Try adjusting your search criteria
					</p>
				</div>
			)}
		</div>
	);
}
