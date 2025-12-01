import { NextRequest, NextResponse, } from "next/server";
import { prisma } from "@/lib/prisma";
import { MediaService } from "@/lib/services/mediaService"
import { revalidatePath } from "next/cache";
import z from "zod"

const propertySchema = z.object({
    name: z.string().min(1),
    address: z.string().min(1),
    type: z.string().min(1),
    rent: z.coerce.number().positive(), 
    maxBedrooms: z.coerce.number().positive(),
    maxBathrooms: z.coerce.number().positive(),
    description: z.string().min(1).max(1000),
});

export async function POST(request: NextRequest) {

    try {
        const formData = await request.formData();

        // Extract the property data
        const propertyData = {
            name: formData.get("name") as string,
            address: formData.get("address") as string,
            type: formData.get("type") as string,
            rent: formData.get("rent") as string,
            maxBedrooms: formData.get("maxBedrooms") as string,
            maxBathrooms: formData.get("maxBathrooms") as string,
            description: formData.get("description") as string,
        }

        // Validate and coerce types
        const validated = propertySchema.parse(propertyData);

        // append a static image so as not to break the exisiting image property
        const validatedData = { ...validated, image: "https://images.unsplash.com/photo-1612637968894-660373e23b03?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXBhcnRtZW50JTIwYnVpbGRpbmd8ZW58MHx8MHx8fDA%3D" }

        // Extract the images from the form data
        const imageFiles = formData.getAll("images") as File[];

        // Use a transaction to ensure atomicity
        const result = await prisma.$transaction(async (tx) => {
            // 1. create the property
            const property = await tx.property.create({
                data: validatedData,
                include: { media: true }
            })

            // 2. Upload the images next if provided
            const uploadedMedia = []

            if (imageFiles && imageFiles.length > 0) {
                for (const file of imageFiles) {
                    // validate each file
                    const fileValidation = MediaService.validateFile(file)

                    if (!fileValidation.valid) {
                        throw new Error(`Image validation failed. ${fileValidation.error}`)
                    }

                    // convert image file to a buffer and get a unique file name
                    const buffer = await file.arrayBuffer()
                    const uniqueFilename = MediaService.generateUniqueFilename(file.name, property.id, "property")

                    // save file to disk the and file path
                    const filePath = await MediaService.saveFile(Buffer.from(buffer), uniqueFilename)

                    // create a media record
                    const media = await tx.media.create({
                        data: {
                            filename: uniqueFilename,
                            originalName: file.name,
                            fileSize: file.size,
                            mimeType: file.type,
                            propertyId: property.id,
                            filePath
                        }
                    })

                    uploadedMedia.push(media)
                }
            }

            return {
                property,
                media: uploadedMedia
            }
        }, { timeout: 30000, maxWait: 5000, isolationLevel: "ReadCommitted" })

        revalidatePath("/properties")
        revalidatePath("/dashboard")

        return NextResponse.json({
            message: "Property created successfully.",
            property: result.property,
            media: result.media,
        })


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
        console.error("Error creating property with media: ", error);

        let errorMessage = "Failed to create property";
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }

}