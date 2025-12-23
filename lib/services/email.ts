import { ResetPasswordEmail } from "@/lib/emails/ResetPasswordEmail";
import { render } from "@react-email/components";
import resend from "@/lib/emailClient"

interface SendPasswordResetEmailParams {
    email: string;
    resetLink: string;
    name?: string;
}

export async function sendPasswordResetEmail(
    {
        email,
        resetLink,
        name,
    }: SendPasswordResetEmailParams) {

    console.log("=== Password Reset Email Debug ===");
    console.log("RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY);
    console.log("EMAIL_FROM:", process.env.EMAIL_FROM);
    console.log("To:", email);
    console.log("Reset Link:", resetLink);
    console.log("==================================");

    if (!process.env.RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY is not configured");
    }

    if (!process.env.EMAIL_FROM) {
        throw new Error("RESEND_FROM is not configured");
    }

    const emailHtml = await Promise.resolve(
        render(
            ResetPasswordEmail({
                name: name || "there",
                resetLink,
                expiresIn: "1 hour",
            })
        )
    );

    await resend.emails.send({
        from: `RentalsManager <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: "Reset Your Password - Rentals Manager",
        html: emailHtml,
    });
}