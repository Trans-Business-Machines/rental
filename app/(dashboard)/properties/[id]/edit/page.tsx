import { PropertyForm } from "@/components/PropertyForm";
import { Button } from "@/components/ui/button";
import { getPropertyById } from "@/lib/actions/properties";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PropertyDeleteButton } from "../../property-delete-button";

interface EditPropertyPageProps {
	params: Promise<{ id: string }>
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
	const { id } = await params
	const propertyId = parseInt(id)

	if (isNaN(propertyId)) {
		notFound()
	}

	const property = await getPropertyById(propertyId)

	if (!property) {
		notFound()
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col space-x-4">
				<Link href="/properties">
					<Button variant="ghost" size="sm">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Properties
					</Button>
				</Link>
				<div className="flex items-center justify-between">
					<div>
						<h1>Edit Property</h1>
						<p className="text-muted-foreground">
							Update property details and manage units
						</p>
					</div>
					<PropertyDeleteButton property={property} />
				</div>
			</div>

			<div className="w-full">
				<PropertyForm 
					property={property}
				/>
			</div>
		</div>
	);
} 