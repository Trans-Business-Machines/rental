import { createInvitation, resendInvitation } from "@/lib/actions/users";
import { NextRequest, NextResponse } from "next/server";
import { userInvitationSchema } from "@/lib/schemas/invitations"
import z from "zod"

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();

		const { email, invitedById, role, name } = userInvitationSchema.parse(body)

		const invitation = await createInvitation({ email, role, invitedById, name });

		return NextResponse.json({ success: true, invitation });
	} catch (error: any) {

		console.error("Error inviting user: ", error)

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


		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 400 }
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
			{ status: 400 }
		);
	}
}
