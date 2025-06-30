'use client'

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState, useTransition } from "react"

export function PropertySearch() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const [searchValue, setSearchValue] = useState(searchParams.get('search') ?? '')

    // Update local state when URL params change
    useEffect(() => {
        setSearchValue(searchParams.get('search') ?? '')
    }, [searchParams])

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams)
            params.set(name, value)
            return params.toString()
        },
        [searchParams]
    )

    const handleSearch = (term: string) => {
        setSearchValue(term)
        startTransition(() => {
            router.push(`/properties?${createQueryString('search', term)}`)
        })
    }

    return (
        <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
                key="property-search-input"
                placeholder="Search properties..."
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
                disabled={isPending}
            />
        </div>
    )
} 