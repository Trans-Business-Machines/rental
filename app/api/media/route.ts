import {
	createMedia,
	deleteMedia,
	getMediaByEntity,
} from "@/lib/actions/media";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	const formData = await req.formData();
	const file = formData.get("file") as File;
	const entityType = formData.get("entityType") as string;
	const entityId = parseInt(formData.get("entityId") as string);

	if (!file || !entityType || isNaN(entityId)) {
		return NextResponse.json(
			{ error: "Missing required fields" },
			{ status: 400 }
		);
	}

	const arrayBuffer = await file.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	const media = await createMedia({
		fileBuffer: buffer,
		fileName: file.name,
		mimeType: file.type,
		entityType,
		entityId,
	});

	return NextResponse.json(media);
}

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const entityType = searchParams.get("entityType");
	const entityId = searchParams.get("entityId");
	if (!entityType || !entityId) {
		return NextResponse.json(
			{ error: "Missing entityType or entityId" },
			{ status: 400 }
		);
	}
	const media = await getMediaByEntity(entityType, parseInt(entityId));
	return NextResponse.json(media);
}

export async function DELETE(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const id = searchParams.get("id");
	if (!id) {
		return NextResponse.json({ error: "Missing id" }, { status: 400 });
	}
	await deleteMedia(id);
	return NextResponse.json({ success: true });
}
