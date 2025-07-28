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
	lists: () => [...propertyKeys.all, "list"] as const,
	list: () => [...propertyKeys.lists()] as const,
	details: () => [...propertyKeys.all, "detail"] as const,
	detail: (id: number) => [...propertyKeys.details(), id] as const,
};

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
