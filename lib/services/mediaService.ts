import { promises as fs } from "fs"
import path from "path"
import crypto from "crypto"
import { createClient } from "@supabase/supabase-js"



const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "media");
const ALLOWED_MIMETYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "images/avif",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Initialize supabase
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)


export class MediaService {
    static async ensureUploadDirExists() {
        try {

            await fs.mkdir(UPLOAD_DIR, { recursive: true })
        } catch (error) {
            console.error("Failed to create the upload directory: ", error)
            throw new Error("Failed to create the upload directory")
        }
    }

    static generateUniqueFilename(
        originalFilename: string, entityId: number, entityType: "property" | "unit"): string {

        const ext = path.extname(originalFilename).toLowerCase()
        const timestamp = Date.now()
        const hash = crypto.randomBytes(4).toString("hex")
        const prefix = entityType === "property" ? "prop" : "unit"

        return `${prefix}_${entityId}_${timestamp}_${hash}${ext}`
    }


    static async saveFile(file: File, filename: string): Promise<string> {
        try {
            const useSupabase = process.env.USE_SUPABASE_STORAGE || process.env.NODE_ENV === "production"
            const buffer = Buffer.from(await file.arrayBuffer());

            if (useSupabase) {
                // if the environment is production use supabase for image storage
                const { error } = await supabase.storage.from("media").upload(filename, buffer, {
                    contentType: file.type,
                    cacheControl: "3600",
                    upsert: false
                })

                if (error) {
                    console.error("Supabase upload error: ", error)
                    throw new Error(`Failed to upload to supabase: ${error.message}`)

                }

                // Get the public URL
                const { data: urlData } = supabase.storage.from("media").getPublicUrl(filename)

                return urlData.publicUrl

            } else {
                // if env is development use local disk for storage
                await this.ensureUploadDirExists();

                const filePath = path.join(UPLOAD_DIR, filename);

                await fs.writeFile(filePath, buffer);

                return `/uploads/media/${filename}`

            }

        } catch (error) {
            console.error("Failed to save file: ", error)
            throw new Error("Failed to save file")
        }

    }


    static async deleteFile(filename: string): Promise<void> {
        try {
            const useSupabase = process.env.USE_SUPABASE_STORAGE || process.env.NODE_ENV === "production"
            // If the environment is the production use supabase
            if (useSupabase) {
                const { error } = await supabase.storage.from("media").remove([filename])

                if (error) {
                    console.error('Supabase delete error:', error);
                }
                return;

            } else {
                // If the environment is development use the file system
                const filePath = path.join(UPLOAD_DIR, filename)
                await fs.unlink(filePath)
            }
        } catch (error) {
            console.error("Failed to delete file: ", error)
        }
    }


    static validateFile(file: File): { valid: boolean, error?: string } {
        if (!ALLOWED_MIMETYPES.includes(file.type)) {
            return { valid: false, error: "Invalid file type. Only jpeg, jpg, png, avif, and webp are allowed" }
        }

        if (file.size > MAX_FILE_SIZE) {
            return { valid: false, error: "File is too large. Maximum is 10MB." }
        }

        return { valid: true }

    }

}