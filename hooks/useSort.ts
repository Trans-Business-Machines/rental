import { useMemo } from "react";

interface useSortProps<T> {
    sortItems: T[]
    sortOrder: "none" | "asc" | "desc"
    sortKey: keyof T
}

export function useSort<T>({ sortItems, sortOrder, sortKey }: useSortProps<T>): T[] {

    const sortedItems = useMemo(() => {

        if (!sortKey || sortOrder === "none") {
            return sortItems
        }

        let results = sortItems.slice()

        results = results.sort((r1, r2) => {

            // get the checkout date from the comparison objects
            const r1Value = r1[sortKey] as string | Date | number
            const r2Value = r2[sortKey] as string | Date | number

            // Handle null or undefined value
            if (!r1Value && !r2Value) return 0
            if (!r1Value) return 1
            if (!r2Value) return -1

            if (typeof r1Value === "number" && typeof r2Value === "number") {

                // compare the numbers

                const comparison = r1Value - r2Value
                return sortOrder === "asc" ? comparison : -comparison

            } else {
                // convert date to timestamp & compare
                const r1Time = new Date(r1Value).getTime()
                const r2Time = new Date(r2Value).getTime()

                const comparison = r1Time - r2Time

                return sortOrder === "asc" ? comparison : -comparison
            }

        })
        return results
    }, [sortOrder, sortItems, sortKey])

    return sortedItems
}