import { ResetPasswordEmail } from "@/lib/emails/ResetPasswordEmail";
import { render } from "@react-email/components";
import resend from "@/lib/emailClient"
import {
    GuestCheckoutEmail,
    type GuestCheckoutEmailProps,
} from "@/lib/emails/GuestCheckoutEmail";

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
            from: `Rentals Manager <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: "Reset Your Password - Rentals Manager",
            html: emailHtml,
        });

        return result;
    } catch (error) {
        throw error;
    }
}

/**
 * Guest-facing email, so it goes out under the property's name rather than
 * "Rentals Manager". Never throws: a failed email must not fail a checkout.
 */
export async function notifyGuestOfCheckout({
    to,
    ...props
}: GuestCheckoutEmailProps & { to: string }): Promise<{ sent: boolean }> {
    // Characters that would break the "Name <address>" header
    const senderName = props.propertyName.replace(/["\\<>\r\n]/g, "").trim() || "Rentals Manager";

    try {
        const { error } = await resend.emails.send({
            from: `"${senderName}" <${process.env.EMAIL_FROM}>`,
            to,
            subject: `You've been checked out - ${props.propertyName}`,
            react: GuestCheckoutEmail(props),
        });

        if (error) {
            console.error("Failed to send guest checkout email:", error);
            return { sent: false };
        }

        return { sent: true };
    } catch (error) {
        console.error("Error sending guest checkout email:", error);
        return { sent: false };
    }
}
