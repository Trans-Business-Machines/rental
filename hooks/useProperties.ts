import { getAllPropertiesWithUnits } from "@/lib/actions/properties";
import { useQuery } from "@tanstack/react-query";


interface Property {
	id: number;
	name: string;
	units: {
		id: number;
		name: string;
	}[];
}

// Query keys
export const propertyKeys = {
	all: ["properties"] as const,
	list: () => [...propertyKeys.all, "list"] as const,
	details: () => [...propertyKeys.all, "detail"] as const,
	detail: (id: number) => [...propertyKeys.details(), id] as const,
};

export const propertyUnitKeys = {
	unitList: (page: number) => ["property", "units", page]
}

// Fetch properties with units
export const usePropertiesWithUnits = () => {
	return useQuery({
		queryKey: propertyKeys.list(),
		queryFn: async (): Promise<Property[]> => {
			const properties = await getAllPropertiesWithUnits();
			return properties;
		},
		staleTime: 30 * 1000, // 30 seconds
	});
};

// Fetch the units that belong to a given property
export const usePropertyUnits = ({ propertyId, page }: { propertyId: number, page: number }) => {
	const result = useQuery({
		queryKey: propertyUnitKeys.unitList(page),
		queryFn: async () => {
			const response = await fetch(`/api/properties/${propertyId}/units?page=${page}`)

			if (!response.ok) {
				throw new Error(`Failed to fetch units: ${response.status}`)
			}

			return await response.json()
		}
	})

	return result

}