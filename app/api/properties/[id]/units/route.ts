import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const propertyId = Number(id);

        if (isNaN(propertyId)) {
            return NextResponse.json(
                { message: "Invalid property ID, it must be a number" },
                { status: 400 }
            );
        }

        // Extract filters from search params
        const searchParams = request.nextUrl.searchParams;
        const page = Number(searchParams.get("page")) || 1;
        const search = searchParams.get("search") || "";
        const status = searchParams.get("status") || "all";
        const type = searchParams.get("type") || "all";

        const LIMIT = 3;

        // Verify the property exists
        const existingProperty = await prisma.property.findUnique({
            where: { id: propertyId },
        });

        if (!existingProperty) {
            return NextResponse.json(
                { message: "Property with given ID does not exist" },
                { status: 404 }
            );
        }

        // Build where clause
        const where = {
            propertyId,

            // Search by unit name
            ...(search && {
                name: { contains: search, mode: "insensitive" as const },
            }),

            // Status filter
            ...(status !== "all" && {
                status: status as any,
            }),

            // Type filter
            ...(type !== "all" && {
                type: type as any,
            }),
        };

        const [units, totalUnits] = await Promise.all([
            prisma.unit.findMany({
                where,
                include: {
                    property: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    media: true,

                },
                orderBy: {
                    createdAt: "asc"
                },
                take: LIMIT,
                skip: (page - 1) * LIMIT,
            }),
            prisma.unit.count({ where }),
        ]);

        const allPricings = await prisma.unitTypePricing.findMany()

        const totalPages = Math.ceil(totalUnits / LIMIT) || 1;

        const hasNext = page < totalPages;
        const hasPrev = page > 1 && page <= totalPages;

        const unitsWithPricing = units.map((unit) => {
            const pricingOptions = allPricings.filter(
                (pricing) => pricing.unitType === unit.type
            )

            return {
                ...unit,
                pricingOptions,
            };
        });

        return NextResponse.json({
            totalPages,
            currentPage: page,
            units: unitsWithPricing,
            hasPrev,
            hasNext,
        });
    } catch (error) {
        console.error("Error getting property units: ", error);

        if (error instanceof Error) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }

        return NextResponse.json(
            { message: "An unexpected error occurred while getting property units" },
            { status: 500 }
        );
    }
}