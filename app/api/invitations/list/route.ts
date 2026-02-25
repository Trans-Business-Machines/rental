import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/check-permissions";
import type { NextRequest } from "next/server";
import type { Role } from "@/lib/types/types";

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;

	// Get filter params
	const page = Number(searchParams.get("page")) || 1;
	const search = searchParams.get("search") || "";
	const status = searchParams.get("status") || "all";
	const role = searchParams.get("role") || "all";

	// Get the role of the currently logged in user
	const session = await getServerSession();
	const currentUserRole = (session?.user?.role as Role) || "user";

	const LIMIT = 6;

	// Build where clause
	const where = {

		// Admin can only see invitations for "user" role
		...(currentUserRole === "admin" && { role: "user" }),

		acceptedAt: null,
		

		// Search by name or email
		...(search && {
			OR: [
				{ name: { contains: search, mode: "insensitive" as const } },
				{ email: { contains: search, mode: "insensitive" as const } },
			],
		}),

		// Status filter
		...(status === "pending" && { acceptedAt: null }),
		...(status === "accepted" && { acceptedAt: { not: null } }),

		// Role filter (only for superAdmin)
		...(role !== "all" &&
			currentUserRole === "superAdmin" && {
			role: role,
		}),
	};

	const [invitations, totalInvitations] = await Promise.all([
		prisma.invitation.findMany({
			select: {
				id: true,
				name: true,
				role: true,
				email: true,
				acceptedAt: true,
				createdAt: true,
			},
			where,
			orderBy: { createdAt: "desc" },
			take: LIMIT,
			skip: (page - 1) * LIMIT,
		}),
		prisma.invitation.count({ where }),
	]);

	const totalPages = Math.ceil(totalInvitations / LIMIT) || 1;

	const hasNext = page < totalPages;
	const hasPrev = page > 1 && page <= totalPages;

	return NextResponse.json({
		totalPages,
		invitations,
		hasNext,
		hasPrev,
		currentPage: page,
	});
}