"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/check-permissions";
import { revalidatePath } from "next/cache";
import type { Role } from "@/lib/types/types";

export interface PaymentSettingsData {
  paybillNumber: string;
  accountNumber: string;
  notes?: string
}

/* Get payment settings */
export async function getPaymentSettings() {
  try {
    const settings = await prisma.paymentSettings.findFirst();
    return settings;
  } catch (error) {
    console.error("Error fetching payment settings:", error);
    return null;
  }
}

/* Upsert payment settings (superAdmin only) */
export async function upsertPaymentSettings(data: PaymentSettingsData) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const userRole = session.user.role as Role;

    if (userRole !== "superAdmin") {
      throw new Error(
        "Unauthorized: Only super admins can update payment settings"
      );
    }

    const existing = await prisma.paymentSettings.findFirst();

    let settings;

    if (existing) {
      settings = await prisma.paymentSettings.update({
        where: { id: existing.id },
        data: {
          paybillNumber: data.paybillNumber,
          accountNumber: data.accountNumber,
          notes: data.notes
        },
      });
    } else {
      settings = await prisma.paymentSettings.create({
        data: {
          paybillNumber: data.paybillNumber,
          accountNumber: data.accountNumber,
          notes: data.notes
        },
      });
    }

    revalidatePath("/payments");

    return { success: true, settings };
  } catch (error) {
    console.error("Error upserting payment settings:", error);
    throw error;
  }
}