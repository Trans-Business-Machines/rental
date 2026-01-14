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

    const emailHtml = await Promise.resolve(
        render(
            ResetPasswordEmail({
                name: name || "there",
                resetLink,
                expiresIn: "1 hour",
            })
        )
    );

    try {
        const result = await resend.emails.send({
            from: `RentalsManager <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: "Reset Your Password - Rentals Manager",
            html: emailHtml,
        });

        return result;
    } catch (error) {
        throw error;
    }
}