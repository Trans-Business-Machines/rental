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
const unitSchema = z.object({
    name: z.string().min(1),
    type: z.string().min(1),
    rent: z.coerce.number().positive(),
    bedrooms: z.coerce.number().positive(),
    bathrooms: z.coerce.number().min(0),
    maxGuests: z.coerce.number().positive(),
    images: z.array(uploadedImageSchema).min(1, "At least one image is required"),
});

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const propertyId = parseInt(id);

        if (isNaN(propertyId)) {
            return NextResponse.json(
                { error: "Invalid property ID" },
                { status: 400 }
            );
        }

        // Verify property exists
        const property = await prisma.property.findUnique({
            where: { id: propertyId },
        });

        if (!property) {
            return NextResponse.json(
                { error: "Property not found" },
                { status: 404 }
            );
        }

        // Get the request body
        const body = await request.json();

        // Validate the request body
        const validated = unitSchema.parse(body);

        const { images, ...unitData } = validated;

        // Use a transaction to ensure atomicity
        const result = await prisma.$transaction(
            async (tx) => {
                // 1. Create the unit
                const unit = await tx.unit.create({
                    data: {
                        ...unitData,
                        propertyId: propertyId,
                    },
                });

                // 2. Create media records for all uploaded images
                const mediaRecords = [];

                for (const img of images) {
                    const media = await tx.media.create({
                        data: {
                            filename: img.filename,
                            originalName: img.originalName,
                            fileSize: img.fileSize,
                            mimeType: img.mimeType,
                            unitId: unit.id,
                            filePath: img.url,
                        },
                    });
                    mediaRecords.push(media);
                }

                return {
                    unit,
                    media: mediaRecords,
                };
            },
            { timeout: 30000, maxWait: 5000, isolationLevel: "ReadCommitted" }
        );

        revalidatePath("/properties");
        revalidatePath(`/properties/${propertyId}`);
        revalidatePath("/dashboard");

        return NextResponse.json({
            message: "Unit created successfully.",
            unit: result.unit,
            media: result.media,
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
        console.error("Error creating unit: ", error);

        let errorMessage = "Failed to create unit";
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}