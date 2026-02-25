// hooks/useProperties.ts
import { useQuery } from "@tanstack/react-query";

interface UsePropertyUnitsParams {
	propertyId: number;
	page?: number;
	search?: string;
	status?: string;
	type?: string;
	sortOrder?: string;
}

export const propertyUnitKeys = {
	propertyUnitList: (propertyId: number, params: Omit<UsePropertyUnitsParams, "propertyId">) =>
		["property", propertyId, "units", params] as const,
};

export const usePropertyUnits = ({
	propertyId,
	page = 1,
	search = "",
	status = "all",
	type = "all",
	sortOrder = "none",
}: UsePropertyUnitsParams) => {
	return useQuery({
		queryKey: propertyUnitKeys.propertyUnitList(propertyId, {
			page,
			search,
			status,
			type,
			sortOrder,
		}),
		queryFn: async () => {
			const params = new URLSearchParams();
			params.set("page", page.toString());

			if (search) params.set("search", search);
			if (status !== "all") params.set("status", status);
			if (type !== "all") params.set("type", type);
			if (sortOrder !== "none") params.set("sortOrder", sortOrder);

			const response = await fetch(
				`/api/properties/${propertyId}/units?${params.toString()}`
			);

			if (!response.ok) {
				throw new Error(`Failed to fetch units: ${response.status}`);
			}

			return response.json();
		},
	});
};