import { createInvitation, resendInvitation } from "@/lib/actions/users";
import { NextRequest, NextResponse } from "next/server";
import { userInvitationSchema } from "@/lib/schemas/invitations"
import { getServerSession } from "@/lib/check-permissions"
import type { Role } from "@/lib/types/types"
import { PrismaClientKnownRequestError } from "@/prisma/generated/client/runtime/library";
import z from "zod"

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();

		const session = await getServerSession()
		const currentUserRole = (session?.user?.role as Role) || "user"

		const { email, invitedById, role, name } = userInvitationSchema.parse(body)

		if (currentUserRole !== "superAdmin") {
			throw new Error("Only super admins can manage users.")
		}

		const invitation = await createInvitation({ email, role, invitedById, name });

		return NextResponse.json({ success: true, invitation });
	} catch (error: any) {
		if (error instanceof z.ZodError) {
			const fieldErrors = error.errors.map((err) => ({
				field: err.path.join("."),
				message: err.message
			}))

			return NextResponse.json(
				{
					success: false,
					error: "Validation failed",
					details: fieldErrors,
				},
				{ status: 400 }
			);

		}

		if (error instanceof PrismaClientKnownRequestError) {
			if (error.code === "P2002") {
				return NextResponse.json(
					{ success: false, error: "A user with this email already exists." },
					{ status: 409 }
				);
			}
		}

		return NextResponse.json(
			{ success: false, error: "Failed to invite user" },
			{ status: 500 }
		);
	}
}

export async function PUT(req: NextRequest) {
	try {
		const { email } = await req.json();
		const invitation = await resendInvitation(email);
		return NextResponse.json({ success: true, invitation });
	} catch (error: any) {
		console.error(error);
		return NextResponse.json(
			{ success: false, error: "Failed to resend invitation" },
			{ status: 500 }
		);
	}
}