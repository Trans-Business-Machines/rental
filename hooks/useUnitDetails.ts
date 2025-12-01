import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { UnitDetailsResponse } from "@/lib/types/types"

export const unitKeys = {
    all: ["units"] as const,
    details: (unitId: string, propertyId: string) => [...unitKeys.all, "details", propertyId, unitId] as const
}

export const useUnitDetails = ({
    unitId,
    propertyId,
}: {
    unitId: string;
    propertyId: string;
}) => {

    return useQuery<UnitDetailsResponse>({
        queryKey: unitKeys.details(unitId, propertyId),
        queryFn: async () => {
            const response = await fetch(`/api/units/${unitId}?propertyId=${propertyId}`)

            if (!response.ok) {
                throw new Error("Failed to fetch unit details")
            }

            return response.json()
        }
    })
}

export const prefetchUnitDetails = async (
    queryClient: ReturnType<typeof useQueryClient>,
    unitId: string,
    propertyId: string
) => {

    await queryClient.prefetchQuery({
        queryKey: unitKeys.details(unitId, propertyId),
        queryFn: async () => {
            const response = await fetch(`/api/units/${unitId}?propertyId=${propertyId}`)
            if (!response.ok) {
                throw new Error("Failed to fetch unit details");
            }

            return response.json();
        },
        staleTime: 5 * 60 * 60
    })

}
