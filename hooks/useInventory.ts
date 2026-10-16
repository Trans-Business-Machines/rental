import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getOpenIssueCount } from "@/lib/actions/inventory";

// Query keys
export const inventoryKeys = {
    openIssueCount: ["open-inventory-issue-count"] as const,
};

// Open issue count for the sidebar badge
export function useOpenIssueCount(enabled: boolean = true) {
    return useQuery({
        queryKey: inventoryKeys.openIssueCount,
        queryFn: () => getOpenIssueCount(),
        enabled,
        refetchInterval: 30000, // Poll every 30 seconds
    });
}

/**
 * The inventory dialogs call server actions directly rather than through
 * mutations, so they call this after anything that opens or closes an
 * issue to update the badge immediately instead of on the next poll.
 */
export function useRefreshOpenIssueCount() {
    const queryClient = useQueryClient();

    return () =>
        queryClient.invalidateQueries({ queryKey: inventoryKeys.openIssueCount });
}
