import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { MediaService } from "@/lib/services/mediaService";
import z from "zod";

const updateUnitSchema = z.object({
    name: z.string().min(1),
    type: z.string().min(1),
    rent: z.coerce.number().positive(),
    bedrooms: z.coerce.number().positive(),
    bathrooms: z.coerce.number().positive(),
    maxGuests: z.coerce.number().positive(),
    imagesToDelete: z.array(z.string()).optional()
});


export async function PUT(request: NextRequest, context: { params: Promise<{ unitId: string }> }) {
    try {
        const formData = await request.formData();
        const { unitId } = await context.params

        const propertyId = Number(request.nextUrl.searchParams.get("propertyId"))
        const parsedUnitId = Number(unitId)

        if (isNaN(propertyId) || isNaN(parsedUnitId)) {
            return NextResponse.json({
                error: "Invalid property ID or unit ID",
                details: "Property and unit Ids must be a number"
            }, {
                status: 400
            })
        }

        // Extract property details
        const unitData = {
            name: formData.get('name') as string,
            type: formData.get('type') as string,
            rent: formData.get('rent') as string,
            bedrooms: formData.get('bedrooms') as string,
            bathrooms: formData.get('bathrooms') as string,
            maxGuests: formData.get('maxGuests') as string,
            imagesToDelete: JSON.parse(formData.get('imagesToDelete') as string || '[]'),
        };

        // Validate the data
        const validatedData = updateUnitSchema.parse(unitData);

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

        //  Verify the unit exists first before updating
        const unit = await prisma.unit.findUnique({
            where: {
                id: parsedUnitId,
                propertyId
            }
        })

        // Return a 404 error if unit is not found
        if (!unit) {
            return NextResponse.json(
                {
                    error: "property not found."
                },
                {
                    status: 404
                })
        }


        // update unit details first
        await prisma.unit.update({
            where: { id: parsedUnitId, propertyId },
            data: {
                name: validatedData.name,
                type: validatedData.type,
                rent: validatedData.rent,
                bedrooms: validatedData.bedrooms,
                bathrooms: validatedData.bathrooms,
                maxGuests: validatedData.maxGuests,
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
                    file.name, parsedUnitId, "unit")

                const filePath = await MediaService.saveFile(Buffer.from(buffer), uniqueFileName)

                const media = await prisma.media.create({
                    data: {
                        filename: uniqueFileName,
                        originalName: file.name,
                        fileSize: file.size,
                        mimeType: file.type,
                        unitId: parsedUnitId,
                        filePath,
                    }
                })

                uploadedMedia.push(media)
            }
        }

        // Revalidate cache
        revalidateTag('unit');

        // fetch the updated unit with all media
        const finalUnit = await prisma.unit.findUnique({
            where: {
                id: parsedUnitId,
                propertyId

            }
        })

        // Return response 
        return NextResponse.json({
            message: 'Unit updated successfully',
            unit: finalUnit,
            newMedia: uploadedMedia,
        }, {
            status: 200
        })


    } catch (error) {
        console.error('Error updating property:', error);
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