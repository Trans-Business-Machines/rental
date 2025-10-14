"use client";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  ChartColumnBig,
  Bell,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Box,
  Home,
  LogOut,
  Menu,
  User,
  Users,
  X,
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
  role?: string;
}

const navigationConfig: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: ChartColumnBig },
  { id: "bookings", label: "Bookings", icon: CalendarDays },
  { id: "guests", label: "Guests", icon: Users },
  { id: "inventory", label: "Inventory", icon: Box },
  { id: "properties", label: "Properties", icon: Building2 },
  /*   { id: "payments", label: "Payments", icon: CreditCard }, */
  /*  { id: "maintenance", label: "Maintenance", icon: Wrench }, */
  { id: "users", label: "Users", icon: User, role: "admin" },
  /* {
    id: "amenities",
    label: "Amenities",
    icon: Calendar,
    items: [
      { id: "amenities", label: "Amenities" },
      { id: "booking-requests", label: "Booking Requests" },
    ],
  }, */
];

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const currentPage = pathname.slice(1) || "dashboard";
  // const [searchQuery, setSearchQuery] = useState("");
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

  // Show loading state while checking authentication
  if (session === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no session, show a message (middleware will handle redirect)
  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Home className="h-12 w-12 text-primary mx-auto mb-4" />
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

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
                "w-full flex items-center space-x-3 px-6 text-sidebar-primary-foreground py-2  transition-colors cursor-pointer",
                isActive
                  ? "bg-sidebar-primary font-bold"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              {Icon && <Icon className="size-5" />}
              <span className="flex-1 text-left">{item.label}</span>
              {isOpen ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
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
                  "w-12/12 flex items-center space-x-3 px-3 py-2 ml-6 rounded-none transition-colors text-sm cursor-pointer text-sidebar-primary-foreground",
                  currentPage === subItem.id
                    ? "bg-sidebar-primary font-bold"
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <div className="size-1 bg-current rounded-full" />
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
          "w-full flex items-center space-x-3 px-6 text-sidebar-primary-foreground py-2  transition-colors cursor-pointer",
          isActive
            ? "bg-sidebar-primary font-bold"
            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
      >
        {Icon && <Icon className="size-5" />}
        <span>{item.label}</span>
      </button>
    );
  };

  // Get user display name and role
  const userName = session?.user?.name || "User";
  const userRole = session?.user?.role || "User";

  // Filter navigation items based on role
  const filteredNavigationConfig = navigationConfig.filter((item) => {
    if (item.role && userRole !== item.role) {
      return false;
    }
    return true;
  });

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
      <aside
        className={cn(
          "fixed inset-y-0 left-0 w-52 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200  ease-in-out z-50 overflow-x-hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-sidebar-border">
          <div className="flex items-center space-x-2">
            <Home className="size-6 text-sidebar-primary-foreground" />
            <span className="font-semibold text-sidebar-primary-foreground">
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

        <nav className="py-4 space-y-2">
          {filteredNavigationConfig.map(renderNavItem)}
        </nav>

        <div className="absolute bottom-0  border-t border-sidebar-border  w-full">
          <Button
            className="rounded-none w-full cursor-pointer flex justify-start items-center gap-2 py-6 bg-transparent text-sidebar-primary-foreground  transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={handleLogout}
          >
            <LogOut className="size-4 ml-4" />
            <span className="font-normal text-sm">Log out</span>
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-52">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
          {/* Mobile: Hamburger menu */}
          <div className="flex items-center gap-4 flex-1">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Profile information */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-6 w-6" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </Button>

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {userRole}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground capitalize">
                        {userRole}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
