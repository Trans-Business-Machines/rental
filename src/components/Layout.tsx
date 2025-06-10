import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
	BarChart3,
	Bell,
	Building2,
	Calendar,
	ChevronDown,
	ChevronRight,
	CreditCard,
	FileText,
	Home,
	Menu,
	Search,
	Settings,
	User,
	Users,
	Wrench,
	X,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface LayoutProps {
	children: React.ReactNode;
}

const navItems = [
	{ id: "dashboard", label: "Dashboard", icon: BarChart3 },
	{ id: "properties", label: "Properties", icon: Building2 },
	{ id: "tenants", label: "Tenants", icon: Users },
	{ id: "rentals", label: "Rentals", icon: FileText },
	{ id: "payments", label: "Payments", icon: CreditCard },
	{ id: "maintenance", label: "Maintenance", icon: Wrench },
];

const amenitiesItems = [
	{ id: "amenities-management", label: "Amenities" },
	{ id: "booking-requests", label: "Booking Requests" },
];

export function Layout({ children }: LayoutProps) {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();
	const currentPage = location.pathname.slice(1) || "dashboard";
	const [searchQuery, setSearchQuery] = useState("");

	const [amenitiesOpen, setAmenitiesOpen] = useState(
		currentPage === "amenities-management" ||
			currentPage === "booking-requests"
	);

	const isAmenitiesActive =
		currentPage === "amenities-management" ||
		currentPage === "booking-requests";

	return (
		<div className="min-h-screen bg-background">
			{/* Mobile sidebar overlay */}
			{sidebarOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-40 lg:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<div
				className={cn(
					"fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out z-50 overflow-x-hidden",
					sidebarOpen
						? "translate-x-0"
						: "-translate-x-full lg:translate-x-0"
				)}
			>
				<div className="flex items-center justify-between p-6 border-b border-sidebar-border">
					<div className="flex items-center space-x-2">
						<Home className="h-6 w-6 text-sidebar-primary" />
						<span className="font-semibold text-sidebar-foreground">
							RentManager
						</span>
					</div>
					<Button
						variant="ghost"
						size="sm"
						className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
						onClick={() => setSidebarOpen(false)}
					>
						<X className="h-4 w-4" />
					</Button>
				</div>

				<nav className="p-4 space-y-2">
					{navItems.map((item) => {
						const Icon = item.icon;
						return (
							<button
								key={item.id}
								onClick={() => {
									navigate(`/${item.id}`);
									setSidebarOpen(false);
								}}
								className={cn(
									"w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
									currentPage === item.id
										? "bg-sidebar-primary text-sidebar-primary-foreground"
										: "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
								)}
							>
								<Icon className="h-5 w-5" />
								<span>{item.label}</span>
							</button>
						);
					})}

					{/* Expandable Amenities Menu */}
					<Collapsible
						open={amenitiesOpen}
						onOpenChange={setAmenitiesOpen}
					>
						<CollapsibleTrigger asChild>
							<button
								className={cn(
									"w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
									isAmenitiesActive
										? "bg-sidebar-primary text-sidebar-primary-foreground"
										: "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
								)}
							>
								<Calendar className="h-5 w-5" />
								<span className="flex-1 text-left">
									Amenities
								</span>
								{amenitiesOpen ? (
									<ChevronDown className="h-4 w-4" />
								) : (
									<ChevronRight className="h-4 w-4" />
								)}
							</button>
						</CollapsibleTrigger>
						<CollapsibleContent className="space-y-1 mt-1">
							{amenitiesItems.map((subItem) => (
								<button
									key={subItem.id}
									onClick={() => {
										navigate(`/${subItem.id}`);
										setSidebarOpen(false);
									}}
									className={cn(
										"w-full flex items-center space-x-3 px-3 py-2 ml-6 rounded-lg transition-colors text-sm",
										currentPage === subItem.id
											? "bg-sidebar-primary text-sidebar-primary-foreground"
											: "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
									)}
								>
									<div className="w-1 h-1 bg-current rounded-full" />
									<span>{subItem.label}</span>
								</button>
							))}
						</CollapsibleContent>
					</Collapsible>
				</nav>

				<div className="absolute bottom-4 left-4 right-4">
					<Button
						variant="ghost"
						className={cn(
							"w-full justify-start",
							currentPage === "settings"
								? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
								: "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
						)}
						onClick={() => navigate("/settings")}
					>
						<Settings className="h-5 w-5 mr-3" />
						Settings
					</Button>
				</div>
			</div>

			{/* Main content */}
			<div className="lg:ml-64">
				{/* Top bar */}
				<div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-30 backdrop-blur-sm bg-background/95">
					<div className="flex items-center gap-4 flex-1">
						<Button
							variant="ghost"
							size="sm"
							className="lg:hidden"
							onClick={() => setSidebarOpen(true)}
						>
							<Menu className="h-5 w-5" />
						</Button>

						{/* Search Bar */}
						<div className="hidden md:flex items-center flex-1 max-w-md">
							<div className="relative w-full">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<input
									type="text"
									placeholder="Search properties, tenants, or payments..."
									className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
									value={searchQuery}
									onChange={(e) =>
										setSearchQuery(e.target.value)
									}
								/>
							</div>
						</div>
					</div>

					<div className="flex items-center gap-4">
						{/* Notifications */}
						<Button
							variant="ghost"
							size="icon"
							className="relative"
						>
							<Bell className="h-5 w-5" />
							<span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
						</Button>

						{/* User Profile */}
						<div className="flex items-center gap-3">
							<div className="hidden md:block text-right">
								<p className="text-sm font-medium">
									Property Manager
								</p>
								<p className="text-xs text-muted-foreground">
									Admin
								</p>
							</div>
							<Button
								variant="ghost"
								size="icon"
								className="rounded-full"
							>
								<User className="h-5 w-5" />
							</Button>
						</div>
					</div>
				</div>

				{/* Page content */}
				<main className="p-6">{children}</main>
			</div>
		</div>
	);
}
