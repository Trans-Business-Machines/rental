import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/check-permissions"
import type { NextRequest } from "next/server";
import type { Role } from "@/lib/types/types";

export async function GET(request: NextRequest) {

	// Get search params from next URL.
	const searchParams = request.nextUrl.searchParams;

	const page = Number(searchParams.get("page")) || 1;

	// Get the role of the currently logged in user
	const session = await getServerSession()
	const currentUserRole = (session?.user?.role as Role) || "user"


	const invitationWhere = {
		acceptedAt: null,
		...(currentUserRole === "admin" && { role: "user" }),
	};

	// Define the limit for invitations.
	const LIMIT = 6;

	// Get paginated invites from the DB.
	const invitations = await prisma.invitation.findMany({
		select: { name: true, role: true, email: true, acceptedAt: true },
		where: invitationWhere,
		orderBy: { createdAt: "desc" },
		take: LIMIT,
		skip: (page - 1) * LIMIT
	});


	// Count the total invites and calcultate total pages
	const totalInvitations = await prisma.invitation.count({
		where: {
			acceptedAt: null
		}
	});

	const totalPages = Math.ceil(totalInvitations / LIMIT)

	// Calculate hasNext and hasPrev attributes
	const hasNext = page < totalPages;
	const hasPrev = page > 1 && page <= totalPages;

	return NextResponse.json({ totalPages, invitations, hasNext, hasPrev, currentPage: page });
}
