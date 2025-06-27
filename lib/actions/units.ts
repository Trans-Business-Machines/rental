"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getUnits() {
	return prisma.unit.findMany({
		include: { property: true },
		orderBy: { createdAt: "desc" },
	});
}

export async function getUnitsByProperty(propertyId: number) {
	return prisma.unit.findMany({
		where: { propertyId },
		include: { property: true },
		orderBy: { createdAt: "desc" },
	});
}

export async function getUnitById(id: number) {
	return prisma.unit.findUnique({
		where: { id },
		include: { property: true },
	});
}

export async function createUnit(data: any) {
	const unit = await prisma.unit.create({ data });
	revalidatePath("/properties");
	return unit;
}

export async function updateUnit(id: number, data: any) {
	const unit = await prisma.unit.update({ where: { id }, data });
	revalidatePath("/properties");
	return unit;
}

export async function deleteUnit(id: number) {
	await prisma.unit.delete({ where: { id } });
	revalidatePath("/properties");
}
