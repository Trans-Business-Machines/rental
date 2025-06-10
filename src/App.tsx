import { Layout } from "@/components/Layout";
import { AmenitiesManagement } from "@/features/AmenitiesManagement";
import { BookingRequests } from "@/features/BookingRequests";
import { Dashboard } from "@/features/Dashboard";
import { Maintenance } from "@/features/Maintenance";
import { Payments } from "@/features/Payments";
import { Properties } from "@/features/Properties";
import { RentalAgreements } from "@/features/RentalAgreements";
import { Settings } from "@/features/Settings";
import { Tenants } from "@/features/Tenants";
import { useState } from "react";

export default function App() {
	const [currentPage, setCurrentPage] = useState("dashboard");

	const renderPage = () => {
		switch (currentPage) {
			case "dashboard":
				return <Dashboard />;
			case "properties":
				return <Properties />;
			case "tenants":
				return <Tenants />;
			case "amenities-management":
				return <AmenitiesManagement />;
			case "booking-requests":
				return <BookingRequests />;
			case "rentals":
				return <RentalAgreements />;
			case "payments":
				return <Payments />;
			case "maintenance":
				return <Maintenance />;
			case "settings":
				return <Settings />;
			default:
				return <Dashboard />;
		}
	};

	return (
		<Layout currentPage={currentPage} onPageChange={setCurrentPage}>
			{renderPage()}
		</Layout>
	);
}
