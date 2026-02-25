// hooks/useDebouncedSearch.ts
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

interface UseDebouncedSearchProps {
    tab: string;
    delay?: number;
}

export function useDebouncedSearch({ tab, delay = 600 }: UseDebouncedSearchProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [searchValue, setSearchValue] = useState(
        searchParams.get("search") || ""
    );

    const [isSearching, setIsSearching] = useState(false);

    // Debounced function to update URL
    const debouncedUpdateUrl = useDebouncedCallback((value: string) => {
        
        const params = new URLSearchParams();
        params.set("tab", tab);
        params.set("page", "1"); // Reset to page 1 on search

        if (value) {
            params.set("search", value);
        }

        // Preserve status filter if exists
        const status = searchParams.get("status");
        if (status && status !== "all") {
            params.set("status", status);
        }

        router.push(`?${params.toString()}`);
        setIsSearching(false);
    }, delay);

    // Handle search input change
    const handleSearchChange = (value: string) => {
        setSearchValue(value);
        setIsSearching(true);
        debouncedUpdateUrl(value);
    };

    // Handle status filter change (immediate, no debounce)
    const handleStatusChange = (status: string) => {
        const params = new URLSearchParams();
        params.set("tab", tab);
        params.set("page", "1");

        if (searchValue) {
            params.set("search", searchValue);
        }

        if (status !== "all") {
            params.set("status", status);
        }

        router.push(`?${params.toString()}`);
    };

    // Sync search value with URL on mount/tab change
    useEffect(() => {
        setSearchValue(searchParams.get("search") || "");
    }, [searchParams]);

    return {
        searchValue,
        isSearching,
        handleSearchChange,
        handleStatusChange,
    };
}