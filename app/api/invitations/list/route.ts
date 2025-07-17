import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
	const invitations = await prisma.invitation.findMany({
		select: { name: true, email: true, acceptedAt: true },
		orderBy: { createdAt: "desc" },
	});
	return NextResponse.json({ invitations });
}
