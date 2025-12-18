import imageCompression from "browser-image-compression"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface UploadResult {
    url: string;
    filename: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
}

const COMPRESSION_OPTIONS = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: 0.8
}


const ALLOWED_MIMETYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export class ClientMediaService {

    /* Generate a unique filename using prefix, timestamp, and random hash */
    static generateUniqueFilename(
        originalFilename: string,
        entityType: "property" | "unit"
    ): string {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 10);
        const prefix = entityType === "property" ? "prop" : "unit";
        const ext = originalFilename.split(".").pop()?.toLowerCase() || "webp";

        return `${prefix}_${timestamp}_${randomStr}.${ext}`;
    }

    /* Validate file type before processing  */
    static validateFile(file: File): { valid: boolean; error?: string } {
        if (!ALLOWED_MIMETYPES.includes(file.type)) {
            return {
                valid: false,
                error:
                    "Invalid file type. Only jpeg, jpg, png, avif, and webp are allowed.",
            };
        }

        if (file.size > MAX_FILE_SIZE) {
            return {
                valid: false,
                error: "File is too large. Maximum is 10MB.",
            };
        }

        return { valid: true };
    }

    /* Compress a single Image */
    static async compressImage(file: File): Promise<File> {
        try {
            // skip compression for small images
            if (file.size < 500 * 1024) {
                console.log(`Skipping compression for ${file.name} (already small)`);
                return file;
            }

            // compress large files
            const compressedFile = await imageCompression(file, COMPRESSION_OPTIONS)

            console.log(
                `Compressed ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`
            );

            return compressedFile;


        } catch (error) {
            console.error("Compression failed:", error);
            return file
        }

    }


    /* Upload image to supabase */
    static async uploadToSupabase(file: File, filename: string): Promise<string> {

        const { error } = await supabase.storage.from("media").upload(filename, file, {
            contentType: file.type,
            cacheControl: "3600",
            upsert: false
        })

        if (error) {
            throw new Error(`Upload failed: ${error.message}`);
        }

        const { data: urlData } = supabase.storage.from("media").getPublicUrl(filename)

        return urlData.publicUrl
    }

    /* Main method: compress and upload multiple images  */
    static async processAndUploadImages(
        files: File[],
        entityType: "property" | "unit"
    ): Promise<UploadResult[]> {

        const results: UploadResult[] = [];

        for (const file of files) {

            // step 1 validate the file
            const validation = this.validateFile(file);
            if (!validation.valid) {
                throw new Error(`${file.name}: ${validation.error}`);
            }

            // step 2 Compress
            const compressedFile = await this.compressImage(file);

            // step 3 Generate unique filename
            const filename = this.generateUniqueFilename(file.name, entityType);


            // Step 4: Upload to Supabase
            const url = await this.uploadToSupabase(compressedFile, filename);

            // step 5: push image metadata to results array
            results.push({
                url,
                filename,
                originalName: file.name,
                fileSize: compressedFile.size,
                mimeType: compressedFile.type,
            });


        }

        return results;
    }

    /* Delete files from Supabase Storage (for cleanup on error or deletion) */
    static async deleteFromSupabase(filenames: string[]): Promise<void> {
        if (filenames.length === 0) return;

        const { error } = await supabase.storage.from("media").remove(filenames);

        if (error) {
            console.error("Failed to delete files from Supabase:", error);
        }

    }
}
