import { prisma } from "@/lib/prisma";
import { StorageService } from "@/lib/storage/storage";

const storage = new StorageService();

export async function createMedia({
	fileBuffer,
	fileName,
	mimeType,
	entityType,
	entityId,
}: {
	fileBuffer: Buffer;
	fileName: string;
	mimeType: string;
	entityType: string;
	entityId: number;
}) {
	const { key, url } = await storage.upload({
		fileBuffer,
		fileName,
		mimeType,
		folder: entityType.toLowerCase(),
	});
	const media = await prisma.media.create({
		data: {
			url,
			key,
			type: mimeType,
			size: fileBuffer.length,
			entityType,
			entityId,
		},
	});
	return media;
}

export async function deleteMedia(id: string) {
	const media = await prisma.media.findUnique({ where: { id } });
	if (!media) return;
	await storage.delete(media.key);
	await prisma.media.delete({ where: { id } });
}

export async function getMediaByEntity(entityType: string, entityId: number) {
	return prisma.media.findMany({
		where: { entityType, entityId },
		orderBy: { createdAt: "desc" },
	});
}
