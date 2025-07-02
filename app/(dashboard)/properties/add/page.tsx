import { PropertyForm } from "@/components/PropertyForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AddPropertyPage() {
	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4">
				<Link href="/properties">
					<Button variant="ghost" size="sm">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Properties
					</Button>
				</Link>
				<div>
					<h1>Add New Property</h1>
					<p className="text-muted-foreground">
						Create a new rental property with its units
					</p>
				</div>
			</div>

			<div className="w-full">
				<PropertyForm />
			</div>
		</div>
	);
} 