import imageCompression from "browser-image-compression";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
    initialQuality: 0.8,
};

const ALLOWED_IMAGE_MIMETYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif",
];

const ALLOWED_DOCUMENT_MIMETYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024;

type EntityType = "property" | "unit" | "guest";

export class ClientMediaService {
    /* Generate a unique filename using prefix, timestamp, and random hash */
    static generateUniqueFilename(
        originalFilename: string,
        entityType: EntityType
    ): string {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 10);

        const prefixMap: Record<EntityType, string> = {
            property: "prop",
            unit: "unit",
            guest: "guest_id",
        };

        const prefix = prefixMap[entityType];
        const ext = originalFilename.split(".").pop()?.toLowerCase() || "webp";

        return `${prefix}_${timestamp}_${randomStr}.${ext}`;
    }

    /* Validate file type before processing */
    static validateFile(file: File): { valid: boolean; error?: string } {
        if (!ALLOWED_IMAGE_MIMETYPES.includes(file.type)) {
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

    /* Validate document file (ID documents - images or PDFs) */
    static validateDocument(file: File): { valid: boolean; error?: string } {
        if (!ALLOWED_DOCUMENT_MIMETYPES.includes(file.type)) {
            return {
                valid: false,
                error:
                    "Invalid file type. Only JPEG, PNG, WebP, and AVIF are allowed for ID documents.",
            };
        }

        if (file.size > MAX_DOCUMENT_SIZE) {
            return {
                valid: false,
                error: "File is too large. Maximum is 5MB for ID documents.",
            };
        }

        return { valid: true };
    }

    /* Compress a single Image */
    static async compressImage(file: File): Promise<File> {
        try {
            // Skip compression for small images
            if (file.size < 500 * 1024) {
                console.log(`Skipping compression for ${file.name} (already small)`);
                return file;
            }

            // Compress large files
            const compressedFile = await imageCompression(file, COMPRESSION_OPTIONS);

            console.log(
                `Compressed ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`
            );

            return compressedFile;
        } catch (error) {
            console.error("Compression failed:", error);
            return file;
        }
    }

    /* Upload file to Supabase */
    static async uploadToSupabase(
        file: File,
        filename: string,
        folder?: string
    ): Promise<string> {
        const filePath = folder ? `${folder}/${filename}` : filename;

        const { error } = await supabase.storage.from("media").upload(filePath, file, {
            contentType: file.type,
            cacheControl: "3600",
            upsert: false,
        });

        if (error) {
            throw new Error(`Upload failed: ${error.message}`);
        }

        const { data: urlData } = supabase.storage
            .from("media")
            .getPublicUrl(filePath);

        return urlData.publicUrl;
    }

    /* Main method: compress and upload multiple images */
    static async processAndUploadImages(
        files: File[],
        entityType: "property" | "unit"
    ): Promise<UploadResult[]> {
        const results: UploadResult[] = [];

        for (const file of files) {
            // Step 1: Validate the file
            const validation = this.validateFile(file);
            if (!validation.valid) {
                throw new Error(`${file.name}: ${validation.error}`);
            }

            // Step 2: Compress
            const compressedFile = await this.compressImage(file);

            // Step 3: Generate unique filename
            const filename = this.generateUniqueFilename(file.name, entityType);

            // Step 4: Upload to Supabase
            const url = await this.uploadToSupabase(compressedFile, filename);

            // Step 5: Push image metadata to results array
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

    /* Upload guest ID document (single file) */
    static async uploadGuestDocument(file: File): Promise<UploadResult> {
        // Step 1: Validate the document
        const validation = this.validateDocument(file);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        // Step 2: Compress if it's an image (skip PDFs)
        const processedFile = await this.compressImage(file);

        // Step 3: Generate unique filename
        const filename = this.generateUniqueFilename(file.name, "guest");

        // Step 4: Upload to Supabase in guest-documents folder
        const url = await this.uploadToSupabase(
            processedFile,
            filename,
            "guest-documents"
        );

        // Step 5: Return metadata
        return {
            url,
            filename,
            originalName: file.name,
            fileSize: processedFile.size,
            mimeType: processedFile.type,
        };
    }

    /* Delete files from Supabase Storage (for cleanup on error or deletion) */
    static async deleteFromSupabase(filenames: string[]): Promise<void> {
        if (filenames.length === 0) return;

        const { error } = await supabase.storage.from("media").remove(filenames);

        if (error) {
            console.error("Failed to delete files from Supabase:", error);
        }
    }

    /* Delete guest document from Supabase */
    static async deleteGuestDocument(filename: string): Promise<void> {
        const filePath = `guest-documents/${filename}`;

        const { error } = await supabase.storage.from("media").remove([filePath]);

        if (error) {
            console.error("Failed to delete guest document:", error);
        }
    }
}