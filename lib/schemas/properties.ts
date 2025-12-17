import z from "zod";

//  Define validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif",
];


export const FileSchema = z
    .instanceof(File)
    .refine(file => file.size <= MAX_FILE_SIZE, "Max file size is 10MB.")
    .refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
        "Only .jpg, .jpeg, .png, .webp and .avif formats are supported."
    )


export const NewPropertySchema = z.object({
    name: z.string().min(1, "Property name is required"),
    address: z.string().min(5, "At least 5 characters are required"),
    type: z.string().min(1, "property type is required."),
    rent: z
        .number()
        .positive("rent must a positve integer.")
        .min(1, "Minimum is 1"),
    maxBedrooms: z
        .number()
        .positive("max bedrooms must a positve integer.")
        .min(1, "Minimum is 1"),
    maxBathrooms: z.number().positive("max bedrooms must a positve integer.").min(0),
    description: z
        .string()
        .min(1, "description is required.")
        .max(1000, "At most 1000 characters allowed.")

})

export type NewPropertyFormData = z.infer<typeof NewPropertySchema>;
export const EditPropertySchema = NewPropertySchema;
export type EditPropertyFormData = z.infer<typeof EditPropertySchema>;


export const NewUnitSchema = z.object({
    name: z.string().min(3, "Unit name is required."),
    type: z.string().min(1, "Unit type is required."),
    rent: z
        .number()
        .positive("Rent must a positve integer.")
        .min(1, "Minimum is 1"),
    bedrooms: z
        .number()
        .positive("Bedrooms must be a positive integer.")
        .min(1, "Minimum is 1"),
    bathrooms: z.number().min(0, "Bathrooms cannot be negative."),
    maxGuests: z
        .number()
        .positive("Max guests must be a positive integer.")
        .min(1, "Minimum is 1"),
})

export type NewUnitFormData = z.infer<typeof NewUnitSchema>
export const EditUnitSchema = NewUnitSchema;
export type EditUnitFormData = z.infer<typeof EditUnitSchema>;



