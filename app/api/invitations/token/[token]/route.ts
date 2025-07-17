import { getInvitationByToken } from "@/lib/actions/users";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ token: string }> }
) {
	try {
		const { token } = await params;
		const invitation = await getInvitationByToken(token);
		if (!invitation)
			return NextResponse.json(
				{ success: false, error: "Invalid or expired token" },
				{ status: 404 }
			);
		return NextResponse.json({ success: true, invitation });
	} catch (error: any) {
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 400 }
		);
	}
}
