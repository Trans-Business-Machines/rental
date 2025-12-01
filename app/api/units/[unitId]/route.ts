import { NextRequest, NextResponse } from "next/server";
import { getUnitDetails } from "@/lib/actions/units";

export async function GET(request: NextRequest, context: { params: Promise<{ unitId: string }> }) {
    try {
        const { unitId } = await context.params
        const propertyId = request.nextUrl.searchParams.get("propertyId");

        if (!propertyId) {
            return NextResponse.json(
                { message: "propertyId query parameter is required" },
                { status: 400 }
            );
        }

        const unit = await getUnitDetails(unitId, propertyId);

        return NextResponse.json(unit);

    } catch (error) {
        console.error("Error fetching unit details:", error);

        if (error instanceof Error && error.message === "NEXT_NOT_FOUND") {
            return NextResponse.json(
                { message: "Unit not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Failed to fetch unit details" },
            { status: 500 }
        );
    }
}

