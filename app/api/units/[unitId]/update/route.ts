import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import z from "zod";

// Define schema for uploaded image data 
const uploadedImageSchema = z.object({
    url: z.string().url(),
    filename: z.string(),
    originalName: z.string(),
    fileSize: z.number(),
    mimeType: z.string(),
});

// Define schema for the new unit
const updateUnitSchema = z.object({
    name: z.string().min(1),
    type: z.string().min(1),
    rent: z.coerce.number().positive(),
    bedrooms: z.coerce.number().positive(),
    bathrooms: z.coerce.number().min(0),
    maxGuests: z.coerce.number().positive(),
    // New images uploaded from client
    newImages: z.array(uploadedImageSchema).optional().default([]),
    // IDs of existing images to delete
    imagesToDelete: z.array(z.string()).optional().default([]),
});

interface RouteParams {
    params: Promise<{
        unitId: string;
    }>;
    searchParams: Promise<{
        propertyId?: string;
    }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { unitId } = await params;
        const unitIdNum = parseInt(unitId);

        // Get propertyId from query params
        const url = new URL(request.url);
        const propertyId = url.searchParams.get("propertyId");

        if (isNaN(unitIdNum)) {
            return NextResponse.json({ error: "Invalid unit ID" }, { status: 400 });
        }

        // Verify unit exists
        const existingUnit = await prisma.unit.findUnique({
            where: { id: unitIdNum },
        });

        if (!existingUnit) {
            return NextResponse.json({ error: "Unit not found" }, { status: 404 });
        }

        // Get the request body
        const body = await request.json();

        // Validate the request body
        const validated = updateUnitSchema.parse(body);

        const { newImages, imagesToDelete, ...unitData } = validated;

        // Use a transaction to ensure atomicity
        const result = await prisma.$transaction(
            async (tx) => {

                // 1. Delete marked images from database
                if (imagesToDelete.length > 0) {
                    await tx.media.deleteMany({
                        where: {
                            id: { in: imagesToDelete },
                            unitId: unitIdNum,
                        },
                    });
                }

                // 2. Create media records for new images
                const newMediaRecords = [];
                for (const img of newImages) {
                    const media = await tx.media.create({
                        data: {
                            filename: img.filename,
                            originalName: img.originalName,
                            fileSize: img.fileSize,
                            mimeType: img.mimeType,
                            unitId: unitIdNum,
                            filePath: img.url,
                        },
                    });
                    newMediaRecords.push(media);
                }

                // 3. Update the unit
                const unit = await tx.unit.update({
                    where: { id: unitIdNum },
                    data: unitData,
                    include: { media: true },
                });

                return {
                    unit,
                    newMedia: newMediaRecords,
                    deletedCount: imagesToDelete.length,
                };
            },
            { timeout: 30000, maxWait: 5000, isolationLevel: "ReadCommitted" }
        );

        // Revalidate paths
        revalidatePath("/properties");
        if (propertyId) {
            revalidatePath(`/properties/${propertyId}`);
            revalidatePath(`/properties/${propertyId}/units/${unitIdNum}`);
        }
        revalidatePath("/dashboard");

        return NextResponse.json({
            message: "Unit updated successfully.",
            unit: result.unit,
            newMedia: result.newMedia,
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        // Handle validation errors
        if (error instanceof z.ZodError) {
            const fieldErrors = error.errors.map((err) => ({
                field: err.path.join("."),
                message: err.message,
            }));

            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: fieldErrors,
                },
                { status: 400 }
            );
        }

        // Handle other errors
        console.error("Error updating unit: ", error);

        let errorMessage = "Failed to update unit";
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}