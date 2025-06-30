"use client";

import { ImageWithFallback } from "@/components/ImageWithFallback";
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
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
    Calendar,
    Car,
    Coffee,
    Dumbbell,
    Edit,
    Plus,
    Search,
    Settings,
    TreePine,
    Users,
    Waves,
} from "lucide-react";
import { useState } from "react";

type Amenity = {
	id: number;
	name: string;
	type: string;
	total: number;
	available: number;
	occupied: number;
	icon: LucideIcon;
	image: string;
	description: string;
	rules: string;
	maxBookingHours: number;
	hourlyRate: number;
	status: string;
};

const mockAmenities: Amenity[] = [
	{
		id: 1,
		name: "Parking Spots",
		type: "parking",
		total: 25,
		available: 18,
		occupied: 7,
		icon: Car,
		image: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400&h=300&fit=crop",
		description: "Covered parking spaces for residents",
		rules: "First-come, first-served. 24-hour maximum booking.",
		maxBookingHours: 24,
		hourlyRate: 0,
		status: "active",
	},
	{
		id: 2,
		name: "Fitness Center",
		type: "gym",
		total: 1,
		available: 1,
		occupied: 0,
		icon: Dumbbell,
		image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop",
		description: "Fully equipped gym with cardio and weight equipment",
		rules: "Maximum 2 hours per session. Clean equipment after use.",
		maxBookingHours: 2,
		hourlyRate: 0,
		status: "active",
	},
	{
		id: 3,
		name: "Swimming Pool",
		type: "pool",
		total: 1,
		available: 1,
		occupied: 0,
		icon: Waves,
		image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop",
		description: "Outdoor swimming pool with lounge area",
		rules: "No glass containers. Children must be supervised.",
		maxBookingHours: 4,
		hourlyRate: 0,
		status: "active",
	},
	{
		id: 4,
		name: "Community Room",
		type: "community_room",
		total: 1,
		available: 0,
		occupied: 1,
		icon: Users,
		image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
		description: "Multi-purpose room for events and gatherings",
		rules: "Maximum 15 people. Clean up after use. No loud music after 10 PM.",
		maxBookingHours: 6,
		hourlyRate: 25,
		status: "active",
	},
	{
		id: 5,
		name: "BBQ Area",
		type: "bbq",
		total: 3,
		available: 2,
		occupied: 1,
		icon: Coffee,
		image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
		description: "Outdoor BBQ grills with seating area",
		rules: "Bring your own charcoal. Clean grill after use.",
		maxBookingHours: 4,
		hourlyRate: 10,
		status: "active",
	},
	{
		id: 6,
		name: "Rooftop Garden",
		type: "garden",
		total: 1,
		available: 0,
		occupied: 0,
		icon: TreePine,
		image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
		description: "Beautiful rooftop garden space for relaxation",
		rules: "Quiet hours after 8 PM. No pets allowed.",
		maxBookingHours: 3,
		hourlyRate: 0,
		status: "maintenance",
	},
];

export default function AmenitiesPage() {
	const [amenities, setAmenities] = useState<Amenity[]>(mockAmenities);
	const [searchQuery, setSearchQuery] = useState("");
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(
		null
	);
	const [formData, setFormData] = useState({
		name: "",
		type: "",
		total: "",
		description: "",
		rules: "",
		maxBookingHours: "",
		hourlyRate: "",
		image: "",
	});

	const filteredAmenities = amenities.filter(
		(amenity) =>
			amenity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			amenity.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
			amenity.description
				.toLowerCase()
				.includes(searchQuery.toLowerCase())
	);

	const handleAddAmenity = () => {
		const newAmenity = {
			id: amenities.length + 1,
			name: formData.name,
			type: formData.type,
			total: parseInt(formData.total),
			available: parseInt(formData.total),
			occupied: 0,
			icon: getAmenityIcon(formData.type),
			image: formData.image || getDefaultAmenityImage(formData.type),
			description: formData.description,
			rules: formData.rules,
			maxBookingHours: parseInt(formData.maxBookingHours),
			hourlyRate: parseInt(formData.hourlyRate) || 0,
			status: "active",
		};

		setAmenities([...amenities, newAmenity]);
		setIsAddDialogOpen(false);
		setFormData({
			name: "",
			type: "",
			total: "",
			description: "",
			rules: "",
			maxBookingHours: "",
			hourlyRate: "",
			image: "",
		});
	};

	const handleEditAmenity = (amenity: Amenity) => {
		setSelectedAmenity(amenity);
		setFormData({
			name: amenity.name,
			type: amenity.type,
			total: amenity.total.toString(),
			description: amenity.description,
			rules: amenity.rules,
			maxBookingHours: amenity.maxBookingHours.toString(),
			hourlyRate: amenity.hourlyRate.toString(),
			image: amenity.image,
		});
		setIsEditDialogOpen(true);
	};

	const handleUpdateAmenity = () => {
		const updatedAmenities = amenities.map((amenity) =>
			amenity.id === selectedAmenity?.id
				? {
						...amenity,
						name: formData.name,
						type: formData.type,
						total: parseInt(formData.total),
						description: formData.description,
						rules: formData.rules,
						maxBookingHours: parseInt(formData.maxBookingHours),
						hourlyRate: parseInt(formData.hourlyRate) || 0,
						image:
							formData.image ||
							getDefaultAmenityImage(formData.type),
						icon: getAmenityIcon(formData.type),
				  }
				: amenity
		);

		setAmenities(updatedAmenities);
		setIsEditDialogOpen(false);
		setSelectedAmenity(null);
		setFormData({
			name: "",
			type: "",
			total: "",
			description: "",
		rules: "",
		maxBookingHours: "",
		hourlyRate: "",
		image: "",
	});
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
			case "garden":
				return TreePine;
			default:
				return Calendar;
		}
	};

	const getDefaultAmenityImage = (type: string) => {
		switch (type) {
			case "parking":
				return "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400&h=300&fit=crop";
			case "gym":
				return "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop";
			case "pool":
				return "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop";
			case "community_room":
				return "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop";
			case "bbq":
				return "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop";
			case "garden":
				return "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop";
			default:
				return "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop";
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "default";
			case "maintenance":
				return "secondary";
			case "inactive":
				return "destructive";
			default:
				return "default";
		}
	};

	const getAvailabilityColor = (available: number, total: number) => {
		const percentage = (available / total) * 100;
		if (percentage === 0) return "text-destructive";
		if (percentage < 30) return "text-orange-500";
		return "text-green-600";
	};

	const totalAmenities = amenities.length;
	const activeAmenities = amenities.filter(
		(a) => a.status === "active"
	).length;
	const totalCapacity = amenities.reduce((sum, a) => sum + a.total, 0);
	const totalAvailable = amenities.reduce((sum, a) => sum + a.available, 0);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1>Amenities Management</h1>
					<p className="text-muted-foreground">
						Manage your property amenities and availability
					</p>
				</div>
				<Dialog
					open={isAddDialogOpen}
					onOpenChange={setIsAddDialogOpen}
				>
					<DialogTrigger asChild>
						<Button>
							<Plus className="h-4 w-4 mr-2" />
							Add Amenity
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-md">
						<DialogHeader>
							<DialogTitle>Add New Amenity</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							<div>
								<Label htmlFor="name" className="mb-2 block">
									Amenity Name
								</Label>
								<Input
									id="name"
									value={formData.name}
									onChange={(e) =>
										setFormData({
											...formData,
											name: e.target.value,
										})
									}
									placeholder="Enter amenity name"
								/>
							</div>
							<div>
								<Label htmlFor="type" className="mb-2 block">
									Amenity Type
								</Label>
								<Select
									value={formData.type}
									onValueChange={(value) =>
										setFormData({
											...formData,
											type: value,
										})
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="parking">
											Parking
										</SelectItem>
										<SelectItem value="gym">
											Gym/Fitness
										</SelectItem>
										<SelectItem value="pool">
											Swimming Pool
										</SelectItem>
										<SelectItem value="community_room">
											Community Room
										</SelectItem>
										<SelectItem value="bbq">
											BBQ Area
										</SelectItem>
										<SelectItem value="garden">
											Garden/Outdoor
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor="image" className="mb-2 block">
									Image URL (optional)
								</Label>
								<Input
									id="image"
									value={formData.image}
									onChange={(e) =>
										setFormData({
											...formData,
											image: e.target.value,
										})
									}
									placeholder="Enter image URL or leave blank for default"
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label
										htmlFor="total"
										className="mb-2 block"
									>
										Total Capacity
									</Label>
									<Input
										id="total"
										type="number"
										value={formData.total}
										onChange={(e) =>
											setFormData({
												...formData,
												total: e.target.value,
											})
										}
										placeholder="0"
									/>
								</div>
								<div>
									<Label
										htmlFor="maxBookingHours"
										className="mb-2 block"
									>
										Max Hours
									</Label>
									<Input
										id="maxBookingHours"
										type="number"
										value={formData.maxBookingHours}
										onChange={(e) =>
											setFormData({
												...formData,
												maxBookingHours: e.target.value,
											})
										}
										placeholder="0"
									/>
								</div>
							</div>
							<div>
								<Label
									htmlFor="hourlyRate"
									className="mb-2 block"
								>
									Hourly Rate ($)
								</Label>
								<Input
									id="hourlyRate"
									type="number"
									value={formData.hourlyRate}
									onChange={(e) =>
										setFormData({
											...formData,
											hourlyRate: e.target.value,
										})
									}
									placeholder="0 (free)"
								/>
							</div>
							<div>
								<Label
									htmlFor="description"
									className="mb-2 block"
								>
									Description
								</Label>
								<Textarea
									id="description"
									value={formData.description}
									onChange={(e) =>
										setFormData({
											...formData,
											description: e.target.value,
										})
									}
									placeholder="Amenity description..."
								/>
							</div>
							<div>
								<Label htmlFor="rules" className="mb-2 block">
									Rules & Guidelines
								</Label>
								<Textarea
									id="rules"
									value={formData.rules}
									onChange={(e) =>
										setFormData({
											...formData,
											rules: e.target.value,
										})
									}
									placeholder="Booking rules and usage guidelines..."
								/>
							</div>
							<Button
								onClick={handleAddAmenity}
								className="w-full"
							>
								Add Amenity
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			{/* Summary Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Amenities
						</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{totalAmenities}
						</div>
						<p className="text-xs text-muted-foreground">
							{activeAmenities} active
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Capacity
						</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{totalCapacity}
						</div>
						<p className="text-xs text-muted-foreground">
							spots/units available
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Currently Available
						</CardTitle>
						<Settings className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{totalAvailable}
						</div>
						<p className="text-xs text-muted-foreground">
							{Math.round((totalAvailable / totalCapacity) * 100)}
							% availability
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Occupied
						</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{totalCapacity - totalAvailable}
						</div>
						<p className="text-xs text-muted-foreground">
							currently in use
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Search */}
			<div className="flex items-center space-x-4">
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
					<Input
						placeholder="Search amenities..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>
			</div>

			{/* Amenities Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{filteredAmenities.map((amenity) => {
					const IconComponent = amenity.icon;
					const availabilityPercentage =
						(amenity.available / amenity.total) * 100;

					return (
						<Card
							key={amenity.id}
							className="hover:shadow-lg transition-shadow overflow-hidden pt-0"
						>
							<div className="relative h-48 w-full">
								<ImageWithFallback
									src={amenity.image}
									alt={amenity.name}
									className="w-full h-full object-cover"
								/>
								<div className="absolute top-3 right-3">
									<Badge
										variant={getStatusColor(amenity.status)}
									>
										{amenity.status}
									</Badge>
								</div>
								<div className="absolute top-3 left-3">
									<Badge
										variant="outline"
										className="bg-white/90 text-black capitalize"
									>
										{amenity.type.replace("_", " ")}
									</Badge>
								</div>
								<div className="absolute bottom-3 left-3">
									<div className="bg-white/90 rounded-full p-2">
										<IconComponent className="h-5 w-5" />
									</div>
								</div>
							</div>

							<CardHeader>
								<div className="space-y-2">
									<CardTitle className="text-lg">
										{amenity.name}
									</CardTitle>
									<p className="text-sm text-muted-foreground">
										{amenity.description}
									</p>
								</div>
							</CardHeader>

							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4 text-sm">
									<div>
										<span className="text-muted-foreground">
											Total Capacity
										</span>
										<p className="font-medium">
											{amenity.total}
										</p>
									</div>
									<div>
										<span className="text-muted-foreground">
											Max Booking
										</span>
										<p className="font-medium">
											{amenity.maxBookingHours}h
										</p>
									</div>
									<div>
										<span className="text-muted-foreground">
											Hourly Rate
										</span>
										<p className="font-medium">
											{amenity.hourlyRate > 0
												? `$${amenity.hourlyRate}`
												: "Free"}
										</p>
									</div>
									<div>
										<span className="text-muted-foreground">
											Available
										</span>
										<p
											className={`font-medium ${getAvailabilityColor(
												amenity.available,
												amenity.total
											)}`}
										>
											{amenity.available}/{amenity.total}
										</p>
									</div>
								</div>

								<div className="space-y-2">
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">
											Availability
										</span>
										<span className="font-medium">
											{Math.round(availabilityPercentage)}
											%
										</span>
									</div>
									<div className="w-full bg-secondary rounded-full h-2">
										<div
											className={cn(
												"h-2 rounded-full",
												availabilityPercentage === 0
													? "bg-destructive"
													: availabilityPercentage <
													  30
													? "bg-orange-500"
													: "bg-primary"
											)}
											style={{
												width: `${availabilityPercentage}%`,
											}}
										/>
									</div>
								</div>

								<div className="border-t pt-3">
									<p className="text-sm font-medium mb-1">
										Rules & Guidelines
									</p>
									<p className="text-xs text-muted-foreground">
										{amenity.rules}
									</p>
								</div>

								<div className="flex space-x-2">
									<Button
										variant="outline"
										size="sm"
										className="flex-1"
										onClick={() =>
											handleEditAmenity(amenity)
										}
									>
										<Edit className="h-4 w-4 mr-2" />
										Edit
									</Button>
									<Button
										variant="outline"
										size="sm"
										className="flex-1"
									>
										<Settings className="h-4 w-4 mr-2" />
										Settings
									</Button>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{filteredAmenities.length === 0 && (
				<div className="text-center py-8">
					<Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
					<h3 className="text-lg font-medium">No amenities found</h3>
					<p className="text-muted-foreground">
						Try adjusting your search criteria
					</p>
				</div>
			)}

			{/* Edit Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Edit Amenity</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<Label htmlFor="edit-name" className="mb-2 block">
								Amenity Name
							</Label>
							<Input
								id="edit-name"
								value={formData.name}
								onChange={(e) =>
									setFormData({
										...formData,
										name: e.target.value,
									})
								}
								placeholder="Enter amenity name"
							/>
						</div>
						<div>
							<Label htmlFor="edit-type" className="mb-2 block">
								Amenity Type
							</Label>
							<Select
								value={formData.type}
								onValueChange={(value) =>
									setFormData({
										...formData,
										type: value,
									})
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="parking">
										Parking
									</SelectItem>
									<SelectItem value="gym">
										Gym/Fitness
									</SelectItem>
									<SelectItem value="pool">
										Swimming Pool
									</SelectItem>
									<SelectItem value="community_room">
										Community Room
									</SelectItem>
									<SelectItem value="bbq">
										BBQ Area
									</SelectItem>
									<SelectItem value="garden">
										Garden/Outdoor
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label htmlFor="edit-image" className="mb-2 block">
								Image URL (optional)
							</Label>
							<Input
								id="edit-image"
								value={formData.image}
								onChange={(e) =>
									setFormData({
										...formData,
										image: e.target.value,
									})
								}
								placeholder="Enter image URL or leave blank for default"
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label
									htmlFor="edit-total"
									className="mb-2 block"
								>
									Total Capacity
								</Label>
								<Input
									id="edit-total"
									type="number"
									value={formData.total}
									onChange={(e) =>
										setFormData({
											...formData,
											total: e.target.value,
										})
									}
									placeholder="0"
								/>
							</div>
							<div>
								<Label
									htmlFor="edit-maxBookingHours"
									className="mb-2 block"
								>
									Max Hours
								</Label>
								<Input
									id="edit-maxBookingHours"
									type="number"
									value={formData.maxBookingHours}
									onChange={(e) =>
										setFormData({
											...formData,
											maxBookingHours: e.target.value,
										})
									}
									placeholder="0"
								/>
							</div>
						</div>
						<div>
							<Label
								htmlFor="edit-hourlyRate"
								className="mb-2 block"
							>
								Hourly Rate ($)
							</Label>
							<Input
								id="edit-hourlyRate"
								type="number"
								value={formData.hourlyRate}
								onChange={(e) =>
									setFormData({
										...formData,
										hourlyRate: e.target.value,
									})
								}
								placeholder="0 (free)"
							/>
						</div>
						<div>
							<Label
								htmlFor="edit-description"
								className="mb-2 block"
							>
								Description
							</Label>
							<Textarea
								id="edit-description"
								value={formData.description}
								onChange={(e) =>
									setFormData({
										...formData,
										description: e.target.value,
									})
								}
								placeholder="Amenity description..."
							/>
						</div>
						<div>
							<Label htmlFor="edit-rules" className="mb-2 block">
								Rules & Guidelines
							</Label>
							<Textarea
								id="edit-rules"
								value={formData.rules}
								onChange={(e) =>
									setFormData({
										...formData,
										rules: e.target.value,
									})
								}
								placeholder="Booking rules and usage guidelines..."
							/>
						</div>
						<Button
							onClick={handleUpdateAmenity}
							className="w-full"
						>
							Update Amenity
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}