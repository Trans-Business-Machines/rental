
// lib/services/email.ts
interface SendPasswordResetEmailParams {
    email: string;
    resetLink: string;
    name?: string;
}

export async function sendPasswordResetEmail({
    email,
    resetLink,
    name,
}: SendPasswordResetEmailParams) {
    const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/send-reset-email`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, resetLink, name }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to send email");
    }

    return data;
}