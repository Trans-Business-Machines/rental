import { Layout } from "@/components/Layout";
import { AmenitiesManagement } from "@/features/AmenitiesManagement";
import { BookingRequests } from "@/features/BookingRequests";
import { Dashboard } from "@/features/Dashboard";
import { Inventory } from "@/features/InventoryManagement";
import { Maintenance } from "@/features/Maintenance";
import { Payments } from "@/features/Payments";
import { Properties } from "@/features/Properties";
import { RentalAgreements } from "@/features/RentalAgreements";
import { Settings } from "@/features/Settings";
import { Tenants } from "@/features/Tenants";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Bookings } from "./features/Bookings";
import { Guests } from "./features/Guests";
import { PropertyView } from "./features/PropertyView";

export default function App() {
	return (
		<BrowserRouter>
			<Layout>
				<Routes>
					<Route
						path="/"
						element={<Navigate to="/dashboard" replace />}
					/>
					<Route path="/dashboard" element={<Dashboard />} />
					<Route path="/properties" element={<Properties />} />
					<Route path="/properties/:id" element={<PropertyView />} />
					<Route path="/tenants" element={<Tenants />} />
					<Route
						path="/amenities-management"
						element={<AmenitiesManagement />}
					/>
					<Route
						path="/booking-requests"
						element={<BookingRequests />}
					/>
					<Route path="/rentals" element={<RentalAgreements />} />
					<Route path="/payments" element={<Payments />} />
					<Route path="/maintenance" element={<Maintenance />} />
					<Route path="/inventory" element={<Inventory />} />
					<Route path="/guests" element={<Guests />} />
					<Route path="/bookings" element={<Bookings />} />
					<Route path="/settings" element={<Settings />} />
				</Routes>
			</Layout>
		</BrowserRouter>
	);
}
