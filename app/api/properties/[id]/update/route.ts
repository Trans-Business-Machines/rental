import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { MediaService } from "@/lib/services/mediaService";
import z from "zod";


const updatePropertySchema = z.object({
    name: z.string().min(1),
    address: z.string().min(10),
    type: z.string().min(1),
    rent: z.coerce.number().positive(),
    maxBedrooms: z.coerce.number().positive(),
    maxBathrooms: z.coerce.number().positive(),
    description: z.string().min(1).max(1000),
    imagesToDelete: z.array(z.string()).optional(),
});


export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const formData = await request.formData();
        const { id } = await context.params

        const propertyId = Number(id);

        if (isNaN(propertyId)) {
            return NextResponse.json({
                error: "Invalid property Id",
                details: "Property Id is not number"
            }, {
                status: 400
            })
        }

        // Extract property details
        const propertyData = {
            name: formData.get('name') as string,
            address: formData.get('address') as string,
            type: formData.get('type') as string,
            rent: formData.get('rent') as string,
            maxBedrooms: formData.get('maxBedrooms') as string,
            maxBathrooms: formData.get('maxBathrooms') as string,
            description: formData.get('description') as string,
            imagesToDelete: JSON.parse(formData.get('imagesToDelete') as string || '[]'),
        };

        // Validate the data
        const validatedData = updatePropertySchema.parse(propertyData);

        // Extract image files
        const newImageFiles = formData.getAll("images") as File[]

        // Verify the property is existing
        const property = await prisma.property.findUnique({
            where: {
                id: propertyId,
                deletedAt: null
            }
        })


        // Return a 404 error if property is not found
        if (!property) {
            return NextResponse.json(
                {
                    error: "property not found."
                },
                {
                    status: 404
                })
        }


        // update property details first
        await prisma.property.update({
            where: { id: propertyId },
            data: {
                name: validatedData.name,
                address: validatedData.address,
                type: validatedData.type,
                rent: validatedData.rent,
                maxBedrooms: validatedData.maxBedrooms,
                maxBathrooms: validatedData.maxBathrooms,
                description: validatedData.description,
            },
        })


        // Delete marked images
        if (validatedData.imagesToDelete && validatedData.imagesToDelete.length > 0) {
            for (const imageId of validatedData.imagesToDelete) {
                const media = await prisma.media.findUnique({
                    where: {
                        id: imageId
                    }
                })

                if (media) {
                    await MediaService.deleteFile(media.filename)
                    await prisma.media.delete({
                        where: {
                            id: imageId
                        }
                    })
                }
            }
        }

        // upload the new images
        const uploadedMedia = [];

        if (newImageFiles && newImageFiles.length > 0) {
            for (const file of newImageFiles) {
                const fileValidation = MediaService.validateFile(file)

                if (!fileValidation.valid) {
                    throw new Error(`Image validation failed: ${fileValidation.error}`);
                }

                const buffer = await file.arrayBuffer()
                const uniqueFileName = MediaService.generateUniqueFilename(
                    file.name, propertyId, "property")

                const filePath = await MediaService.saveFile(Buffer.from(buffer), uniqueFileName)

                const media = await prisma.media.create({
                    data: {
                        filename: uniqueFileName,
                        originalName: file.name,
                        fileSize: file.size,
                        mimeType: file.type,
                        filePath,
                        propertyId,
                    }
                })

                uploadedMedia.push(media)
            }
        }

        // Revalidate cache
        revalidateTag('property');

        // fetch the updated property with all media
        const finalProperty = await prisma.property.findUnique({
            where: {
                id: propertyId,
                deletedAt: null
            }
        })



        // Return response 
        return NextResponse.json({
            message: 'Property updated successfully',
            property: finalProperty,
            newMedia: uploadedMedia,
        }, {
            status: 200
        })


    } catch (error) {

        if (error instanceof z.ZodError) {
            const fieldErrors = error.errors.map(err => ({
                field: err.path.join("."),
                message: err.message
            }))

            return NextResponse.json({
                error: "Validation failed",
                details: fieldErrors
            }, {
                status: 400
            })
        }

        // handle other errors
        console.error('Error updating property:', error);

        let errorMessage = 'Failed to update property';
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );

    }

}