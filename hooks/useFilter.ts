import { useMemo } from "react";
import { useDebounce } from "use-debounce";

interface useFilterProps<T> {
    items: T[],
    searchTerm: string,
    searchFields: (keyof T | string)[],
    selectFilters?: Partial<Record<keyof T | string, string>>
    delay?: number
}

// Helper function to retrieve a nested item value
function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}


export function useFilter<T extends Record<string, any>>({
    items = [],
    searchTerm = "",
    searchFields = [],
    selectFilters = {},
    delay = 300
}: useFilterProps<T>): T[] {

    // debounce the search term 
    const [debouncedSearchTerm] = useDebounce(searchTerm, delay)

    // filter and cache the results
    const filtered = useMemo(() => {
        let results = items

        // apply the select filters if they exist
        if (selectFilters && Object.keys(selectFilters).length > 0) {

            results = results.filter((item: T) => {
                // convert the selectFilters to an array
                const selectFilterEntries = Object.entries(selectFilters);

                return selectFilterEntries.every(([key, value]) => {
                    if (!value || value.includes("all")) return true

                    // Get the nested value
                    const itemValue = getNestedValue(item, key);

                    if (value === "true" || value === "false") {
                        const boolValue = JSON.parse(value)
                        return boolValue === itemValue
                    } else {
                        //  compare the itemValue to the search value
                        return itemValue.toLowerCase() === value.toLowerCase()
                    }
                })
            })
        }

        // apply the  search term filter if the search term exists
        if (debouncedSearchTerm) {
            const lower = debouncedSearchTerm.toLowerCase()

            results = results.filter((item: T) =>
                searchFields.length > 0
                    ? searchFields.some((field) => {
                        // Get the object value nested or not
                        const itemValue = getNestedValue(item, field as string)
                        return String(itemValue ?? "").toLowerCase().includes(lower)
                    })
                    : JSON.stringify(item).toLowerCase().includes(lower)
            )
        }

        return results
    }, [items, debouncedSearchTerm, searchFields, selectFilters])


    return filtered
}