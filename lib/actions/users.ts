import { render } from "@react-email/components";
import { randomBytes } from "node:crypto";
import { auth } from "../auth";
import { InviteUserEmail } from "../emails/InviteUserEmail";
import { prisma } from "../prisma";
import resend from "../emailClient";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://rentalsmanager.app" as const;

export async function createInvitation({
	email,
	role,
	invitedById,
	name
}: {
	name: string,
	email: string;
	role: string;
	invitedById?: string;
}) {
	// Check if invitation or user already exists
	const existingUser = await prisma.user.findUnique({ where: { email } });

	// if there is an existing user throw error
	if (existingUser) throw new Error("A user with this email already exists.");


	// Check if there is an exisitng invite already sent that has not being accepted
	const existingInvite = await prisma.invitation.findUnique({
		where: { email },
	});


	// if so throw an error
	if (existingInvite && !existingInvite.acceptedAt)
		throw new Error("An invitation has already been sent to this email.");

	// Generate an invitation token
	const token = randomBytes(32).toString("hex");

	// Create invitation 
	const invitation = await prisma.invitation.create({
		data: {
			name,
			email,
			role,
			token,
			invitedById,
		},
	});

	// Send invite email
	await sendInviteEmail({ name, email, token, invitedById });
	return invitation;
}

async function sendInviteEmail({
	name,
	email,
	token,
	invitedById,
}: {
	name: string;
	email: string;
	token: string;
	invitedById?: string | null;
}) {
	let invitedByName = "An admin";

	if (invitedById) {
		const inviter = await prisma.user.findUnique({
			where: { id: invitedById ?? undefined },
		});
		if (inviter) invitedByName = inviter.name;
	}

	const inviteLink = `${APP_URL}/invite?token=${token}`;

	const emailHtml = await Promise.resolve(
		render(InviteUserEmail({ name: name || "", inviteLink, invitedByName }))
	);

	await resend.emails.send({
		from: `RentalsManager <${process.env.RESEND_FROM}>`,
		to: email,
		subject: "You're invited to join Rentals Manager",
		html: emailHtml,
	});
}

export async function resendInvitation(email: string) {

	const invitation = await prisma.invitation.findUnique({ where: { email } });

	if (!invitation) throw new Error("No invitation found for this email.");

	if (invitation.acceptedAt)
		throw new Error("This invitation has already been accepted.");

	await sendInviteEmail({
		name: invitation.name || "there",
		email: invitation.email,
		token: invitation.token,
		invitedById: invitation.invitedById,
	});
	return invitation;
}

export async function acceptInvitation({
	token,
	password,
	name,
}: {
	token: string;
	password: string;
	name: string;
}) {
	const invitation = await prisma.invitation.findUnique({ where: { token } });
	if (!invitation) throw new Error("Invalid or expired invitation token.");
	if (invitation.acceptedAt) throw new Error("Invitation already accepted.");
	// Create user using better-auth
	const user = await auth.api.createUser({
		body: {
			name,
			email: invitation.email,
			password,
			role: invitation.role as "user" | "admin",
			data: { emailVerified: true },
		},
	});
	// Mark invitation as accepted and save name
	await prisma.invitation.update({
		where: { id: invitation.id },
		data: { acceptedAt: new Date(), userId: user.user.id, name },
	});
	return user;
}

export async function getInvitationByToken(token: string) {
	return prisma.invitation.findUnique({
		where: { token },
		select: { name: true, email: true, acceptedAt: true },
	});
}
