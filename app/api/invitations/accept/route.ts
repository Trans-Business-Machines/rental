import { acceptInvitation } from "@/lib/actions/users";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const { token, password, name } = await req.json();
		if (!name)
			return NextResponse.json(
				{ success: false, error: "Name is required" },
				{ status: 400 }
			);
		const user = await acceptInvitation({ token, password, name });
		return NextResponse.json({ success: true, user });
	} catch (error: any) {
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 400 }
		);
	}
}
