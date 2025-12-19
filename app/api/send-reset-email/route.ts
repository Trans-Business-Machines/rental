// app/api/send-reset-email/route.ts

import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/components";
import { ResetPasswordEmail } from "@/lib/emails/ResetPasswordEmail";

export async function POST(request: NextRequest) {
    try {
        const { email, resetLink, name } = await request.json();

        const emailHtml = await render(
            ResetPasswordEmail({
                name: name || "there",
                resetLink,
                expiresIn: "1 hour",
            })
        );

        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: process.env.EMAIL_FROM || "onboarding@resend.dev",
                to: email,
                subject: "Reset Your Password - RentManager",
                html: emailHtml,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json({ success: true, id: data.id });
    } catch (error) {
        console.error("Email error:", error);
        return NextResponse.json(
            { error: "Failed to send email" },
            { status: 500 }
        );
    }
}