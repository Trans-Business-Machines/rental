import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Bell,
	Building,
	CreditCard,
	Download,
	Eye,
	EyeOff,
	Globe,
	Key,
	MapPin,
	Palette,
	Save,
	Shield,
	Trash2,
	Upload,
	User,
} from "lucide-react";
import { useState } from "react";

const mockUserData = {
	name: "John Anderson",
	email: "john.anderson@rentmanager.com",
	phone: "+1 (555) 123-4567",
	role: "Property Manager",
	avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
	company: "Anderson Property Management",
	address: "123 Business Ave, Suite 100",
	city: "San Francisco",
	state: "CA",
	zipCode: "94105",
	timezone: "America/Los_Angeles",
	language: "en",
	currency: "USD",
};

const mockNotificationSettings = {
	emailNotifications: true,
	smsNotifications: false,
	newTenantApplications: true,
	maintenanceRequests: true,
	paymentReminders: true,
	amenityBookings: false,
	monthlyReports: true,
	systemUpdates: false,
};

export function Settings() {
	const [userData, setUserData] = useState(mockUserData);
	const [notifications, setNotifications] = useState(
		mockNotificationSettings
	);
	const [showPassword, setShowPassword] = useState(false);
	const [selectedTab, setSelectedTab] = useState("profile");

	const handleUserDataChange = (field: string, value: string) => {
		setUserData((prev) => ({ ...prev, [field]: value }));
	};

	const handleNotificationChange = (field: string, value: boolean) => {
		setNotifications((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1>Settings</h1>
					<p className="text-muted-foreground">
						Manage your account and application preferences
					</p>
				</div>
				<Button>
					<Save className="h-4 w-4 mr-2" />
					Save Changes
				</Button>
			</div>

			<Tabs value={selectedTab} onValueChange={setSelectedTab}>
				<TabsList className="grid w-full grid-cols-5">
					<TabsTrigger value="profile">Profile</TabsTrigger>
					<TabsTrigger value="notifications">
						Notifications
					</TabsTrigger>
					<TabsTrigger value="security">Security</TabsTrigger>
					<TabsTrigger value="billing">Billing</TabsTrigger>
					<TabsTrigger value="system">System</TabsTrigger>
				</TabsList>

				{/* Profile Settings */}
				<TabsContent value="profile" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center space-x-2">
								<User className="h-5 w-5" />
								<span>Personal Information</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="flex items-center space-x-6">
								<Avatar className="h-24 w-24">
									<AvatarImage
										src={userData.avatar}
										alt={userData.name}
									/>
									<AvatarFallback>
										{userData.name
											.split(" ")
											.map((n) => n[0])
											.join("")}
									</AvatarFallback>
								</Avatar>
								<div className="space-y-2">
									<div>
										<Button variant="outline" size="sm">
											<Upload className="h-4 w-4 mr-2" />
											Upload Photo
										</Button>
									</div>
									<p className="text-sm text-muted-foreground">
										JPG, PNG or GIF. Max size 2MB.
									</p>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-2">
									<Label htmlFor="name">Full Name</Label>
									<Input
										id="name"
										value={userData.name}
										onChange={(e) =>
											handleUserDataChange(
												"name",
												e.target.value
											)
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="role">Role</Label>
									<Select
										value={userData.role}
										onValueChange={(value) =>
											handleUserDataChange("role", value)
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="Property Manager">
												Property Manager
											</SelectItem>
											<SelectItem value="Leasing Agent">
												Leasing Agent
											</SelectItem>
											<SelectItem value="Maintenance Coordinator">
												Maintenance Coordinator
											</SelectItem>
											<SelectItem value="Administrator">
												Administrator
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="email">Email Address</Label>
									<Input
										id="email"
										type="email"
										value={userData.email}
										onChange={(e) =>
											handleUserDataChange(
												"email",
												e.target.value
											)
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="phone">Phone Number</Label>
									<Input
										id="phone"
										value={userData.phone}
										onChange={(e) =>
											handleUserDataChange(
												"phone",
												e.target.value
											)
										}
									/>
								</div>
								<div className="space-y-2 md:col-span-2">
									<Label htmlFor="company">Company</Label>
									<Input
										id="company"
										value={userData.company}
										onChange={(e) =>
											handleUserDataChange(
												"company",
												e.target.value
											)
										}
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center space-x-2">
								<MapPin className="h-5 w-5" />
								<span>Address Information</span>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-2 md:col-span-2">
									<Label htmlFor="address">
										Street Address
									</Label>
									<Input
										id="address"
										value={userData.address}
										onChange={(e) =>
											handleUserDataChange(
												"address",
												e.target.value
											)
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="city">City</Label>
									<Input
										id="city"
										value={userData.city}
										onChange={(e) =>
											handleUserDataChange(
												"city",
												e.target.value
											)
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="state">State</Label>
									<Input
										id="state"
										value={userData.state}
										onChange={(e) =>
											handleUserDataChange(
												"state",
												e.target.value
											)
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="zipCode">ZIP Code</Label>
									<Input
										id="zipCode"
										value={userData.zipCode}
										onChange={(e) =>
											handleUserDataChange(
												"zipCode",
												e.target.value
											)
										}
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center space-x-2">
								<Globe className="h-5 w-5" />
								<span>Preferences</span>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<div className="space-y-2">
									<Label htmlFor="timezone">Timezone</Label>
									<Select
										value={userData.timezone}
										onValueChange={(value) =>
											handleUserDataChange(
												"timezone",
												value
											)
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="America/Los_Angeles">
												Pacific Time
											</SelectItem>
											<SelectItem value="America/Denver">
												Mountain Time
											</SelectItem>
											<SelectItem value="America/Chicago">
												Central Time
											</SelectItem>
											<SelectItem value="America/New_York">
												Eastern Time
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="language">Language</Label>
									<Select
										value={userData.language}
										onValueChange={(value) =>
											handleUserDataChange(
												"language",
												value
											)
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="en">
												English
											</SelectItem>
											<SelectItem value="es">
												Spanish
											</SelectItem>
											<SelectItem value="fr">
												French
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="currency">Currency</Label>
									<Select
										value={userData.currency}
										onValueChange={(value) =>
											handleUserDataChange(
												"currency",
												value
											)
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="USD">
												USD ($)
											</SelectItem>
											<SelectItem value="EUR">
												EUR (€)
											</SelectItem>
											<SelectItem value="GBP">
												GBP (£)
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Notification Settings */}
				<TabsContent value="notifications" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center space-x-2">
								<Bell className="h-5 w-5" />
								<span>Notification Preferences</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="space-y-1">
										<p className="font-medium">
											Email Notifications
										</p>
										<p className="text-sm text-muted-foreground">
											Receive notifications via email
										</p>
									</div>
									<Switch
										checked={
											notifications.emailNotifications
										}
										onCheckedChange={(checked) =>
											handleNotificationChange(
												"emailNotifications",
												checked
											)
										}
									/>
								</div>
								<div className="flex items-center justify-between">
									<div className="space-y-1">
										<p className="font-medium">
											SMS Notifications
										</p>
										<p className="text-sm text-muted-foreground">
											Receive notifications via text
											message
										</p>
									</div>
									<Switch
										checked={notifications.smsNotifications}
										onCheckedChange={(checked) =>
											handleNotificationChange(
												"smsNotifications",
												checked
											)
										}
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Notification Types</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<p className="font-medium">
										New Tenant Applications
									</p>
									<p className="text-sm text-muted-foreground">
										Get notified when new applications are
										submitted
									</p>
								</div>
								<Switch
									checked={
										notifications.newTenantApplications
									}
									onCheckedChange={(checked) =>
										handleNotificationChange(
											"newTenantApplications",
											checked
										)
									}
								/>
							</div>
							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<p className="font-medium">
										Maintenance Requests
									</p>
									<p className="text-sm text-muted-foreground">
										Get notified about new maintenance
										requests
									</p>
								</div>
								<Switch
									checked={notifications.maintenanceRequests}
									onCheckedChange={(checked) =>
										handleNotificationChange(
											"maintenanceRequests",
											checked
										)
									}
								/>
							</div>
							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<p className="font-medium">
										Payment Reminders
									</p>
									<p className="text-sm text-muted-foreground">
										Get notified about overdue payments
									</p>
								</div>
								<Switch
									checked={notifications.paymentReminders}
									onCheckedChange={(checked) =>
										handleNotificationChange(
											"paymentReminders",
											checked
										)
									}
								/>
							</div>
							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<p className="font-medium">
										Amenity Bookings
									</p>
									<p className="text-sm text-muted-foreground">
										Get notified about amenity booking
										requests
									</p>
								</div>
								<Switch
									checked={notifications.amenityBookings}
									onCheckedChange={(checked) =>
										handleNotificationChange(
											"amenityBookings",
											checked
										)
									}
								/>
							</div>
							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<p className="font-medium">
										Monthly Reports
									</p>
									<p className="text-sm text-muted-foreground">
										Receive monthly financial and occupancy
										reports
									</p>
								</div>
								<Switch
									checked={notifications.monthlyReports}
									onCheckedChange={(checked) =>
										handleNotificationChange(
											"monthlyReports",
											checked
										)
									}
								/>
							</div>
							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<p className="font-medium">
										System Updates
									</p>
									<p className="text-sm text-muted-foreground">
										Get notified about system maintenance
										and updates
									</p>
								</div>
								<Switch
									checked={notifications.systemUpdates}
									onCheckedChange={(checked) =>
										handleNotificationChange(
											"systemUpdates",
											checked
										)
									}
								/>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Security Settings */}
				<TabsContent value="security" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center space-x-2">
								<Key className="h-5 w-5" />
								<span>Password & Authentication</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="current-password">
										Current Password
									</Label>
									<div className="relative">
										<Input
											id="current-password"
											type={
												showPassword
													? "text"
													: "password"
											}
											placeholder="Enter current password"
										/>
										<Button
											variant="ghost"
											size="sm"
											className="absolute right-2 top-1/2 -translate-y-1/2"
											onClick={() =>
												setShowPassword(!showPassword)
											}
										>
											{showPassword ? (
												<EyeOff className="h-4 w-4" />
											) : (
												<Eye className="h-4 w-4" />
											)}
										</Button>
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="new-password">
										New Password
									</Label>
									<Input
										id="new-password"
										type="password"
										placeholder="Enter new password"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="confirm-password">
										Confirm New Password
									</Label>
									<Input
										id="confirm-password"
										type="password"
										placeholder="Confirm new password"
									/>
								</div>
								<Button className="w-full md:w-auto">
									Update Password
								</Button>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center space-x-2">
								<Shield className="h-5 w-5" />
								<span>Two-Factor Authentication</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<p className="font-medium">Enable 2FA</p>
									<p className="text-sm text-muted-foreground">
										Add an extra layer of security to your
										account
									</p>
								</div>
								<Badge variant="secondary">Disabled</Badge>
							</div>
							<Button variant="outline">
								Set Up Two-Factor Authentication
							</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Active Sessions</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-3">
								<div className="flex items-center justify-between p-3 border rounded-lg">
									<div>
										<p className="font-medium">
											Current Session
										</p>
										<p className="text-sm text-muted-foreground">
											Chrome on macOS • San Francisco, CA
										</p>
									</div>
									<Badge variant="default">Active</Badge>
								</div>
								<div className="flex items-center justify-between p-3 border rounded-lg">
									<div>
										<p className="font-medium">
											Mobile App
										</p>
										<p className="text-sm text-muted-foreground">
											iOS App • Last active 2 hours ago
										</p>
									</div>
									<Button variant="outline" size="sm">
										Revoke
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Billing Settings */}
				<TabsContent value="billing" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center space-x-2">
								<CreditCard className="h-5 w-5" />
								<span>Subscription Plan</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="flex items-center justify-between p-4 border rounded-lg">
								<div>
									<p className="font-medium">
										Professional Plan
									</p>
									<p className="text-sm text-muted-foreground">
										Up to 100 units • All features included
									</p>
								</div>
								<div className="text-right">
									<p className="font-medium">$49/month</p>
									<p className="text-sm text-muted-foreground">
										Billed monthly
									</p>
								</div>
							</div>
							<div className="flex space-x-4">
								<Button variant="outline">Change Plan</Button>
								<Button variant="outline">
									Cancel Subscription
								</Button>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Payment Method</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between p-4 border rounded-lg">
								<div className="flex items-center space-x-3">
									<div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-blue-400 rounded"></div>
									<div>
										<p className="font-medium">
											•••• •••• •••• 4242
										</p>
										<p className="text-sm text-muted-foreground">
											Expires 12/26
										</p>
									</div>
								</div>
								<Button variant="outline" size="sm">
									Update
								</Button>
							</div>
							<Button variant="outline">
								Add Payment Method
							</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Billing History</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{[
									{
										date: "2025-06-01",
										amount: "$49.00",
										status: "Paid",
									},
									{
										date: "2025-05-01",
										amount: "$49.00",
										status: "Paid",
									},
									{
										date: "2025-04-01",
										amount: "$49.00",
										status: "Paid",
									},
								].map((invoice, index) => (
									<div
										key={index}
										className="flex items-center justify-between p-3 border rounded-lg"
									>
										<div>
											<p className="font-medium">
												{invoice.date}
											</p>
											<p className="text-sm text-muted-foreground">
												Professional Plan
											</p>
										</div>
										<div className="flex items-center space-x-4">
											<span className="font-medium">
												{invoice.amount}
											</span>
											<Badge variant="default">
												{invoice.status}
											</Badge>
											<Button variant="ghost" size="sm">
												<Download className="h-4 w-4" />
											</Button>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* System Settings */}
				<TabsContent value="system" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center space-x-2">
								<Building className="h-5 w-5" />
								<span>Company Settings</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="company-name">
									Company Name
								</Label>
								<Input
									id="company-name"
									defaultValue="Anderson Property Management"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="company-logo">
									Company Logo
								</Label>
								<div className="flex items-center space-x-4">
									<div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
										<Building className="h-8 w-8 text-muted-foreground" />
									</div>
									<Button variant="outline" size="sm">
										<Upload className="h-4 w-4 mr-2" />
										Upload Logo
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center space-x-2">
								<Palette className="h-5 w-5" />
								<span>Appearance</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label>Theme</Label>
								<Select defaultValue="system">
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="light">
											Light
										</SelectItem>
										<SelectItem value="dark">
											Dark
										</SelectItem>
										<SelectItem value="system">
											System
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Data Management</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium">
											Export Data
										</p>
										<p className="text-sm text-muted-foreground">
											Download your data in CSV format
										</p>
									</div>
									<Button variant="outline">
										<Download className="h-4 w-4 mr-2" />
										Export
									</Button>
								</div>
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium">
											Import Data
										</p>
										<p className="text-sm text-muted-foreground">
											Import properties and tenants from
											CSV
										</p>
									</div>
									<Button variant="outline">
										<Upload className="h-4 w-4 mr-2" />
										Import
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-destructive">
								Danger Zone
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between p-4 border border-destructive rounded-lg">
								<div>
									<p className="font-medium">
										Delete Account
									</p>
									<p className="text-sm text-muted-foreground">
										Permanently delete your account and all
										data
									</p>
								</div>
								<Button variant="destructive">
									<Trash2 className="h-4 w-4 mr-2" />
									Delete Account
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
