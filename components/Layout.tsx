"use client";

import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { authClient } from "@/lib/auth-client";
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
	X
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface LayoutProps {
	children: React.ReactNode;
}

interface NavItem {
	id: string;
	label: string;
	icon?: React.ComponentType<{ className?: string }>;
	items?: NavItem[];
}

const navigationConfig: NavItem[] = [
	{ id: "dashboard", label: "Dashboard", icon: BarChart3 },
	{ id: "properties", label: "Properties", icon: Building2 },
	{ id: "inventory", label: "Inventory", icon: FileText },
	{ id: "bookings", label: "Bookings", icon: Calendar },
	{ id: "guests", label: "Guests", icon: Users },
	{ id: "payments", label: "Payments", icon: CreditCard },
	{ id: "maintenance", label: "Maintenance", icon: Wrench },
	{
		id: "amenities",
		label: "Amenities",
		icon: Calendar,
		items: [
			{ id: "amenities", label: "Amenities" },
			{ id: "booking-requests", label: "Booking Requests" },
		],
	},
];

export function Layout({ children }: LayoutProps) {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const pathname = usePathname();
	const router = useRouter();
	const currentPage = pathname.slice(1) || "dashboard";
	const [searchQuery, setSearchQuery] = useState("");
	const { data: session } = authClient.useSession();

	// Track which collapsible menus are open
	const [openMenus, setOpenMenus] = useState<Set<string>>(() => {
		const initialOpen = new Set<string>();
		// Open menu if current page is a nested item
		navigationConfig.forEach((item) => {
			if (item.items) {
				const hasActiveChild = item.items.some(
					(subItem) => subItem.id === currentPage
				);
				if (hasActiveChild) {
					initialOpen.add(item.id);
				}
			}
		});
		return initialOpen;
	});

	const isItemActive = (item: NavItem): boolean => {
		if (item.id === currentPage) return true;
		if (item.items) {
			return item.items.some((subItem) => subItem.id === currentPage);
		}
		return false;
	};

	const toggleMenu = (menuId: string) => {
		setOpenMenus((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(menuId)) {
				newSet.delete(menuId);
			} else {
				newSet.add(menuId);
			}
			return newSet;
		});
	};

	const renderNavItem = (item: NavItem) => {
		const Icon = item.icon;
		const isActive = isItemActive(item);
		const isOpen = openMenus.has(item.id);

		if (item.items) {
			// Render collapsible menu
			return (
				<Collapsible
					key={item.id}
					open={isOpen}
					onOpenChange={() => toggleMenu(item.id)}
				>
					<CollapsibleTrigger asChild>
						<button
							className={cn(
								"w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
								isActive
									? "bg-sidebar-primary text-sidebar-primary-foreground"
									: "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
							)}
						>
							{Icon && <Icon className="h-5 w-5" />}
							<span className="flex-1 text-left">{item.label}</span>
							{isOpen ? (
								<ChevronDown className="h-4 w-4" />
							) : (
								<ChevronRight className="h-4 w-4" />
							)}
						</button>
					</CollapsibleTrigger>
					<CollapsibleContent className="space-y-1 mt-1">
						{item.items.map((subItem) => (
							<button
								key={subItem.id}
								onClick={() => {
									router.push(`/${subItem.id}`);
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
			);
		}

		// Render regular menu item
		return (
			<button
				key={item.id}
				onClick={() => {
					router.push(`/${item.id}`);
					setSidebarOpen(false);
				}}
				className={cn(
					"w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
					isActive
						? "bg-sidebar-primary text-sidebar-primary-foreground"
						: "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
				)}
			>
				{Icon && <Icon className="h-5 w-5" />}
				<span>{item.label}</span>
			</button>
		);
	};

	// Get user display name and role
	const userName = session?.user?.name || "User";
	const userRole = session?.user?.role || "User";

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
					{navigationConfig.map(renderNavItem)}
				</nav>

				<div className="absolute bottom-4 left-4 right-4">
					<Button
						variant="ghost"
						className={cn(
							"w-full justify-start",
							currentPage === "settings"
								? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-accent-foreground"
								: "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
						)}
						onClick={() => router.push("/settings")}
					>
						<Settings className="h-5 w-5 mr-3" />
						Settings
					</Button>
				</div>
			</div>

			{/* Main content */}
			<div className="lg:ml-64">
				{/* Top bar */}
				<div className="bg-card border-b border-border px-4 py-[15px] flex items-center justify-between sticky top-0 z-30 backdrop-blur-sm bg-background/95">
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
									{userName}
								</p>
								<p className="text-xs text-muted-foreground capitalize">
									{userRole}
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