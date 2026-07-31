import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean)

function getOrigin(request: NextRequest): string {
    const origin = request.headers.get("Origin") ?? ""
    return ALLOWED_ORIGINS.includes(origin) ? origin : ""
}

function corsHeaders(origin: string) {
    return {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Vary": "Origin",
    }
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
    const origin = getOrigin(request)
    return NextResponse.json(null, { status: 204, headers: corsHeaders(origin) })
}

export async function GET(request: NextRequest) {
    const origin = getOrigin(request)

    try {
        const { searchParams } = request.nextUrl
        const type = searchParams.get("type")
        const sort = searchParams.get("sort")

        // Build the unit filter
        const whereClause: Record<string, unknown> = {
            deletedAt: null,
            propertyId: 1
        }

        if (type && type !== "all") {
            const bedroomCount = type === "1bedroom" ? 1 : 2
            whereClause.bedrooms = bedroomCount
        }

        // Fetch units with their media
        const units = await prisma.unit.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                type: true,
                bedrooms: true,
                bathrooms: true,
                maxGuests: true,
                status: true,
                property: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                    },
                },
                media: {
                    select: {
                        id: true,
                        filePath: true,
                    },
                },
            },
            orderBy: {
                createdAt: "asc"
            },
        })

        // Fetch active pricing for relevant unit types
        const unitTypes = [...new Set(units.map((u) => u.type))]

        const pricing = await prisma.unitTypePricing.findMany({
            where: {
                unitType: { in: unitTypes },
                isActive: true,
            },
            select: {
                unitType: true,
                duration: true,
                price: true,
                nights: true,
                discountRate: true,
            },
        })

        // Group pricing by unit type for easy lookup
        const pricingByType = pricing.reduce<
            Record<string, typeof pricing>
        >((acc, p) => {
            if (!acc[p.unitType]) acc[p.unitType] = []
            acc[p.unitType].push(p)
            return acc
        }, {})

        // Merge units with their pricing
        const results = units.map((unit) => ({
            ...unit,
            pricing: pricingByType[unit.type] ?? [],
        }))

        // Sort by the lowest available price per unit
        if (sort === "price_asc" || sort === "price_desc") {
            results.sort((a, b) => {
                const priceA = Math.min(...(a.pricing.map((p) => p.price) || [0]))
                const priceB = Math.min(...(b.pricing.map((p) => p.price) || [0]))
                return sort === "price_asc" ? priceA - priceB : priceB - priceA
            })
        }

        return NextResponse.json(
            { units: results },
            { status: 200, headers: corsHeaders(origin) }
        )
    } catch (error) {
        console.error("Failed to fetch units:", error)
        return NextResponse.json(
            { error: "Failed to fetch units" },
            { status: 500, headers: corsHeaders(origin) }
        )
    }
}