import { createInvitation, resendInvitation } from "@/lib/actions/users";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const { email, role, invitedById } = await req.json();
		const invitation = await createInvitation({ email, role, invitedById });
		return NextResponse.json({ success: true, invitation });
	} catch (error: any) {
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
