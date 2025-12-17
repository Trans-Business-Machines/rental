import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import z from "zod";

// Define a schema for uploaded image data 
const uploadedImageSchema = z.object({
    url: z.string().url(),
    filename: z.string(),
    originalName: z.string(),
    fileSize: z.number(),
    mimeType: z.string(),
});

// Define a schema  for property details
const propertySchema = z.object({
    name: z.string().min(1),
    address: z.string().min(1),
    type: z.string().min(1),
    rent: z.coerce.number().positive(),
    maxBedrooms: z.coerce.number().positive(),
    maxBathrooms: z.coerce.number().positive(),
    description: z.string().min(1).max(1000),
    images: z.array(uploadedImageSchema).min(1, "At least one image is required"),
});


export async function POST(request: NextRequest) {
    try {
        // Get the request body
        const body = await request.json();

        // validate the request body
        const validated = propertySchema.parse(body);

        const { images, ...propertyData } = validated;

        // we use a transaction to ensure atomicity and consistency
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create the property
            const property = await tx.property.create({
                data: {
                    ...propertyData,
                    // Use first image URL as the main property image
                    image: images[0]?.url || "",
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
                        propertyId: property.id,
                        filePath: img.url, // use supabase public URL
                    },
                });
                mediaRecords.push(media);
            }

            return {
                property,
                media: mediaRecords,
            };


        }, { timeout: 30000, maxWait: 5000, isolationLevel: "ReadCommitted" })

        // revalidate dashboard and properties paths
        revalidatePath("/properties");
        revalidatePath("/dashboard");

        return NextResponse.json({
            message: "Property created successfully.",
            property: result.property,
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
        console.error("Error creating property: ", error);

        let errorMessage = "Failed to create property";
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }


}