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

// Define schema for updated property details
const updatePropertySchema = z.object({
    name: z.string().min(1),
    address: z.string().min(1),
    type: z.string().min(1),
    rent: z.coerce.number().positive(),
    maxBedrooms: z.coerce.number().positive(),
    maxBathrooms: z.coerce.number().positive(),
    description: z.string().min(1).max(1000),
    // New images uploaded from client
    newImages: z.array(uploadedImageSchema).optional().default([]),
    // IDs of existing images to delete
    imagesToDelete: z.array(z.string()).optional().default([]),
});

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const propertyId = parseInt(id);

        if (isNaN(propertyId)) {
            return NextResponse.json(
                { error: "Invalid property ID" },
                { status: 400 }
            );
        }

        // Get the request body
        const body = await request.json();

        // Validate the request body
        const validated = updatePropertySchema.parse(body);

        const { newImages, imagesToDelete, ...propertyData } = validated;

        // Use a transaction to ensure atomicity
        const result = await prisma.$transaction(
            async (tx) => {
                // 1. Delete marked images from database
                // Note: Actual file deletion from Supabase should be done on client
                // before calling this API, or via a cleanup job
                if (imagesToDelete.length > 0) {
                    await tx.media.deleteMany({
                        where: {
                            id: { in: imagesToDelete },
                            propertyId: propertyId,
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
                            propertyId: propertyId,
                            filePath: img.url,
                        },
                    });
                    newMediaRecords.push(media);
                }

                // 3. Get all remaining media to determine main image
                const allMedia = await tx.media.findMany({
                    where: { propertyId: propertyId },
                    orderBy: { createdAt: "asc" },
                });

                // 4. Update the property
                const property = await tx.property.update({
                    where: { id: propertyId },
                    data: {
                        ...propertyData,
                        // Update main image to first available image
                        image: allMedia[0]?.filePath || "",
                    },
                    include: { media: true },
                });

                return {
                    property,
                    newMedia: newMediaRecords,
                    deletedCount: imagesToDelete.length,
                };
            },
            { timeout: 30000, maxWait: 5000, isolationLevel: "ReadCommitted" }
        );

        revalidatePath("/properties");
        revalidatePath(`/properties/${propertyId}`);
        revalidatePath("/dashboard");

        return NextResponse.json({
            message: "Property updated successfully.",
            property: result.property,
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
        console.error("Error updating property: ", error);

        let errorMessage = "Failed to update property";
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}