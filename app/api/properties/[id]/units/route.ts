import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        // Extract the property id from context object
        const { id } = await context.params
        const propertyId = Number(id);

        if (isNaN(propertyId)) {
            return NextResponse.json({ message: "Invalid property ID, it must be a number" }, { status: 400 })
        }

        // Extract the page from the API search params
        const page = Number(request.nextUrl.searchParams.get("page")) || 1

        // Define the Limit for a page
        const LIMIT = 4;

        // Verify the property exists
        const existingProperty = await prisma.property.findUnique({
            where: {
                id: propertyId
            }
        })

        if (!existingProperty) {
            return NextResponse.json({ message: "Property with given ID does not exist" }, { status: 404 })
        }

        // count how many units are there, that belong to this property 
        const totalUnits = await prisma.unit.count({
            where: {
                propertyId
            }
        })

        // fetch units from the DB
        const units = await prisma.unit.findMany({
            where: {
                propertyId
            },
            include: {
                property: true,
                media: true,
            },
            take: LIMIT,
            skip: (page - 1) * LIMIT
        })

        // calculate total pages for these units
        const totalPages = Math.ceil(totalUnits / LIMIT)

        const hasNext = page < totalPages;
        const hasPrev = page > 1 && page <= totalPages

        return NextResponse.json({
            totalPages,
            currentPage: page,
            units,
            hasPrev,
            hasNext
        })


    } catch (error) {
        console.log("Error geting property units: ", error)

        if (error instanceof Error) {
            return NextResponse.json({ message: error.message }, { status: 500 })
        }

        return NextResponse.json(
            { message: "An unexpected error occurred while getting property units" }, { status: 500 }
        )

    }
}
