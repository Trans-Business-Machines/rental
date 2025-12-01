import { promises as fs } from "fs"
import path from "path"
import crypto from "crypto"

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "media");
const ALLOWED_MIMETYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "images/avif",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export class MediaService {
    static async ensureUploadDirExists() {
        try {

            await fs.mkdir(UPLOAD_DIR, { recursive: true })
        } catch (error) {
            console.error("Failed to create the upload directory: ", error)
            throw new Error("Failed to create the upload directory")
        }
    }

    static generateUniqueFilename(originalFilename: string, entityId: number, entityType: "property" | "unit"): string {

        const ext = path.extname(originalFilename).toLowerCase()
        const timestamp = Date.now()
        const hash = crypto.randomBytes(4).toString("hex")
        const prefix = entityType === "property" ? "prop" : "unit"

        return `${prefix}_${entityId}_${timestamp}_${hash}${ext}`
    }


    static async saveFile(buffer: Buffer, filename: string): Promise<string> {

        try {
            await this.ensureUploadDirExists()

            const filePath = path.join(UPLOAD_DIR, filename)

            await fs.writeFile(filePath, buffer)

            return `/uploads/media/${filename}`

        } catch (error) {
            console.error("Failed to save file: ", error)
            throw new Error("Failed to save file")
        }

    }


    static async deleteFile(filename: string): Promise<void> {
        try {

            const filePath = path.join(UPLOAD_DIR, filename)
            await fs.unlink(filePath)

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