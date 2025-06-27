'use client'

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useTransition } from "react"

export function PropertySearch() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams)
            params.set(name, value)
            return params.toString()
        },
        [searchParams]
    )

    const handleSearch = (term: string) => {
        startTransition(() => {
            router.push(`/properties?${createQueryString('search', term)}`)
        })
    }

    return (
        <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
                placeholder="Search properties..."
                defaultValue={searchParams.get('search') ?? ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
                disabled={isPending}
            />
        </div>
    )
} 