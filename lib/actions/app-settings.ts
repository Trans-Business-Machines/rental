"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/check-permissions";
import { revalidatePath } from "next/cache";
import type { Role } from "@/lib/types/types";

export interface PaymentImageData {
    imageName: string;
    originalName: string;
    imageUrl: string;
    imageSize: number;
    mimeType: string;
}

const PAYMENT_IMAGE_TYPE = "payment_info";

/* Get payment image settings */
export async function getPaymentImageSettings() {
    try {
        const settings = await prisma.appSettings.findUnique({
            where: { imageType: PAYMENT_IMAGE_TYPE },
        });

        return settings;
    } catch (error) {
        console.error("Error fetching payment image settings:", error);
        return null;
    }
}

/* Upsert payment image settings (superAdmin only) */
export async function upsertPaymentImageSettings(data: PaymentImageData) {
    try {
        const session = await getServerSession();

        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const userRole = session.user.role as Role;

        if (userRole !== "superAdmin") {
            throw new Error("Unauthorized: Only super admins can update payment settings");
        }

        const settings = await prisma.appSettings.upsert({
            where: { imageType: PAYMENT_IMAGE_TYPE },
            update: {
                imageName: data.imageName,
                originalName: data.originalName,
                imageUrl: data.imageUrl,
                imageSize: data.imageSize,
                mimeType: data.mimeType,
            },
            create: {
                imageType: PAYMENT_IMAGE_TYPE,
                imageName: data.imageName,
                originalName: data.originalName,
                imageUrl: data.imageUrl,
                imageSize: data.imageSize,
                mimeType: data.mimeType,
            },
        });

        revalidatePath("/payments");

        return { success: true, settings };
    } catch (error) {
        console.error("Error upserting payment image settings:", error);
        throw error;
    }
}

/* Delete payment image settings (superAdmin only) */
export async function deletePaymentImageSettings() {
    try {
        const session = await getServerSession();

        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const userRole = session.user.role as Role;

        if (userRole !== "superAdmin") {
            throw new Error("Unauthorized: Only super admins can delete payment settings");
        }

        // Get current settings to return the filename for storage deletion
        const currentSettings = await prisma.appSettings.findUnique({
            where: { imageType: PAYMENT_IMAGE_TYPE },
        });

        if (!currentSettings) {
            return { success: true, imageName: null };
        }

        await prisma.appSettings.delete({
            where: { imageType: PAYMENT_IMAGE_TYPE },
        });

        revalidatePath("/payments");

        return { success: true, imageName: currentSettings.imageName };
    } catch (error) {
        console.error("Error deleting payment image settings:", error);
        throw error;
    }
}