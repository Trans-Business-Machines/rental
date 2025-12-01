import { NextRequest, NextResponse, } from "next/server";
import { prisma } from "@/lib/prisma";
import { MediaService } from "@/lib/services/mediaService"
import { revalidatePath } from "next/cache";
import z from "zod"

const unitSchema = z.object({
    name: z.string().min(1),
    type: z.string().min(1),
    rent: z.coerce.number().positive(),
    bedrooms: z.coerce.number().positive(),
    bathrooms: z.coerce.number().positive(),
    maxGuests: z.coerce.number().positive(),
});

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const formData = await request.formData();
        const { id } = await context.params

        const propertyId = Number(id)

        if (isNaN(propertyId)) {
            throw new Error("Invalid poperty id, it is not a number.")
        }

        // check property already exists
        const property = await prisma.property.findUnique({
            where: {
                id: propertyId
            }
        })

        if (!property) {
            throw new Error("Property does not exist.")
        }

        // Extract the unit data
        const unitData = {
            name: formData.get("name") as string,
            type: formData.get("type") as string,
            rent: formData.get("rent") as string,
            bedrooms: formData.get("bedrooms") as string,
            bathrooms: formData.get("bathrooms") as string,
            maxGuests: formData.get("maxGuests") as string,
        }

        // validate the data
        const validatedData = unitSchema.parse(unitData)

        // Extract image file
        const imageFiles = formData.getAll("images") as File[];

        // use a transaction to add the unit and it's images
        const result = await prisma.$transaction(
            async (tx) => {
                // add the unit details first to the db
                const unit = await tx.unit.create({
                    data: {
                        ...validatedData,
                        propertyId
                    }
                })

                // next we upload the images to disk and save metadata to db
                const uploadedMedia = []

                if (imageFiles && imageFiles.length > 0) {
                    for (const file of imageFiles) {
                        // validate the file
                        const fileValidation = MediaService.validateFile(file)

                        if (!fileValidation.valid) {
                            throw new Error(`Image validation failed. ${fileValidation.error}`)
                        }

                        // convert image file to a buffer and get a unique file name
                        const buffer = await file.arrayBuffer();
                        const uniqueFileName = MediaService.generateUniqueFilename(file.name, unit.id, "unit")

                        // save file to disk
                        const filePath = await MediaService.saveFile(Buffer.from(buffer), uniqueFileName)

                        // create media record
                        const media = await tx.media.create({
                            data: {
                                filename: uniqueFileName,
                                originalName: file.name,
                                fileSize: file.size,
                                mimeType: file.type,
                                unitId: unit.id,
                                filePath
                            }
                        })

                        uploadedMedia.push(media)
                    }
                }

                return {
                    unit,
                    media: uploadedMedia
                }
            },
            { timeout: 30000, maxWait: 5000, isolationLevel: "ReadCommitted" }
        )

        revalidatePath(`/properties/${propertyId}`)

        return NextResponse.json({
            message: "Unit created successfully.",
            property: result.unit,
            media: result.media,
        })



    } catch (error) {
        if (error instanceof z.ZodError) {
            const fieldErrors = error.errors.map(err => ({
                field: err.path.join("."),
                details: err.message
            }))

            console.log("Validation error: ", error)

            return NextResponse.json(
                {
                    message: "Validation failed",
                    details: fieldErrors,
                },
                { status: 400 }
            );
        }

        // Handle other errors
        console.error("Error creating unit with media: ", error);

        let errorMessage = "Failed to create unit";
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        return NextResponse.json(
            { message: errorMessage },
            { status: 500 }
        );
    }
}