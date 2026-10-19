import {
    keepPreviousData,
    useInfiniteQuery,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import {
    getInventoryAssignments,
    getInventoryItemsBatch,
    getOpenIssueCount,
    type GetInventoryAssignmentsProps,
    type InventoryItemsBatchProps,
} from "@/lib/actions/inventory";

export type ItemListFilters = Omit<InventoryItemsBatchProps, "cursor">;
export type AssignmentListFilters = Omit<GetInventoryAssignmentsProps, "cursor">;

type ItemsBatch = Awaited<ReturnType<typeof getInventoryItemsBatch>>;
type AssignmentsBatch = Awaited<ReturnType<typeof getInventoryAssignments>>;

// Query keys
export const inventoryKeys = {
    openIssueCount: ["open-inventory-issue-count"] as const,
    lists: ["inventory-lists"] as const,
    items: (filters: ItemListFilters) =>
        [...inventoryKeys.lists, "items", filters] as const,
    assignments: (filters: AssignmentListFilters) =>
        [...inventoryKeys.lists, "assignments", filters] as const,
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

/**
 * The inventory page's lists live in the query cache, so revalidatePath
 * alone no longer refreshes them. Call this after any inventory mutation.
 */
export function useRefreshInventoryLists() {
    const queryClient = useQueryClient();

    return () => queryClient.invalidateQueries({ queryKey: inventoryKeys.lists });
}

/**
 * Items and assignments also change on the item detail and checkout pages,
 * which only revalidate server paths. A short staleTime makes returning to
 * /inventory refresh the lists in the background. Focus refetch is off
 * because it would reload every batch scrolled so far.
 */
const LIST_FRESHNESS = {
    staleTime: 5_000,
    refetchOnWindowFocus: false,
} as const;

/**
 * Infinite scroll for the Inventory Items tab. `initialBatch` is the first
 * batch the server rendered for these filters; it seeds the cache so the
 * first paint needs no client fetch.
 */
export function useInventoryItemsInfinite(
    filters: ItemListFilters,
    initialBatch?: ItemsBatch | null,
) {
    return useInfiniteQuery({
        queryKey: inventoryKeys.items(filters),
        queryFn: ({ pageParam }) =>
            getInventoryItemsBatch({ ...filters, cursor: pageParam }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastBatch) => lastBatch.nextCursor ?? undefined,
        // Keep the old rows on screen while a new filter loads.
        placeholderData: keepPreviousData,
        ...LIST_FRESHNESS,
        ...(initialBatch && {
            initialData: { pages: [initialBatch], pageParams: [undefined] },
            initialDataUpdatedAt: Date.now(),
        }),
    });
}

/** Infinite scroll for the Assignments tab; see useInventoryItemsInfinite. */
export function useAssignmentsInfinite(
    filters: AssignmentListFilters,
    initialBatch?: AssignmentsBatch | null,
) {
    return useInfiniteQuery({
        queryKey: inventoryKeys.assignments(filters),
        queryFn: ({ pageParam }) =>
            getInventoryAssignments({ ...filters, cursor: pageParam }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastBatch) => lastBatch.nextCursor ?? undefined,
        // Keep the old rows on screen while a new filter loads.
        placeholderData: keepPreviousData,
        ...LIST_FRESHNESS,
        ...(initialBatch && {
            initialData: { pages: [initialBatch], pageParams: [undefined] },
            initialDataUpdatedAt: Date.now(),
        }),
    });
}
