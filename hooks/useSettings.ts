"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUnitTypePricings, updateUnitTypePricing } from "@/lib/actions/settings";
import { toast } from "sonner";
import type { UpdatePricingParams } from "@/lib/types/types";

export const SettingsKeys = {
    all: ["application", "settings"] as const,
};

export const useSettings = () => {
    return useQuery({
        queryKey: SettingsKeys.all,
        queryFn: async () => {
            return await getUnitTypePricings();
        },
    });
};


export const useUpdatePricing = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdatePricingParams) => {
            return await updateUnitTypePricing(data);
        },
        onSuccess: async () => {
            // Invalidate settings and pricing queries
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: SettingsKeys.all }),
                queryClient.invalidateQueries({ queryKey: ["pricing-options"] })
            ])

            toast.success("Pricing updated successfully");
        },
        onError: (error: Error) => {
            console.error("Error updating pricing:", error);

            if (error.message.includes("Unauthorized")) {
                toast.error("You don't have permission to update pricing.");
            } else {
                toast.error("Failed to update pricing. Please try again.");
            }
        },
    });
};