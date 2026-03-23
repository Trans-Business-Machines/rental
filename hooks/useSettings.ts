"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getUnitTypePricings,
    createUnitTypePricing,
    updateUnitTypePricing,
    deleteUnitTypePricing,
} from "@/lib/actions/settings";
import { toast } from "sonner";
import type {
    CreatePricingParams,
    UpdatePricingParams,
} from "@/lib/types/types";

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

export const useCreatePricing = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreatePricingParams) => {
            return await createUnitTypePricing(data);
        },
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: SettingsKeys.all }),
                queryClient.invalidateQueries({ queryKey: ["pricing-options"] }),
            ]);

            toast.success("Pricing created successfully");
        },
        onError: (error: Error) => {
            console.error("Error creating pricing:", error);

            if (error.message.includes("already exists")) {
                toast.error(error.message);
            } else if (error.message.includes("Unauthorized")) {
                toast.error(
                    "Unauthorized: You don't have permission to create pricing",
                );
            } else {
                toast.error("Failed to create pricing. Please try again.");
            }
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
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: SettingsKeys.all }),
                queryClient.invalidateQueries({ queryKey: ["pricing-options"] }),
            ]);

            toast.success("Pricing updated successfully");
        },
        onError: (error: Error) => {
            console.error("Error updating pricing:", error);

            if (error.message.includes("Unauthorized")) {
                toast.error(
                    "Unauthorized: You don't have permission to update pricing",
                );
            } else {
                toast.error("Failed to update pricing. Please try again.");
            }
        },
    });
};

export const useDeletePricing = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            return await deleteUnitTypePricing(id);
        },
        onSuccess: async () => {

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: SettingsKeys.all }),
                queryClient.invalidateQueries({ queryKey: ["pricing-options"] }),
            ]);

            toast.success("Pricing deleted successfully");
        },
        onError: (error: Error) => {
            console.error("Error deleting pricing:", error);

            if (error.message.includes("Unauthorized")) {
                toast.error(
                    "Unauthorized: You don't have permission to delete pricing",
                );
            } else {
                toast.error("Failed to delete pricing. Please try again.");
            }
        },
    });
};
