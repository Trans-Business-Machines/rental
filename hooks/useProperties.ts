import { useQuery } from "@tanstack/react-query";

export const propertyUnitKeys = {
	propertyUnitList: (propertyId: number, page: number) => ["property", propertyId, "units", page]
}

// Fetch the units that belong to a given property
export const usePropertyUnits = ({ page, propertyId }: { page: number, propertyId: number }) => {
	return useQuery({
		queryKey: propertyUnitKeys.propertyUnitList(propertyId, page),
		queryFn: async () => {
			const response = await fetch(`/api/properties/${propertyId}/units?page=${page}`)

			if (!response.ok) {
				throw new Error(`Failed to fetch units: ${response.status}`)
			}

			const data = await response.json()
			return data
		},
	})
}

