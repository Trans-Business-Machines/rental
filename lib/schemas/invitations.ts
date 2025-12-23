import { z } from "zod";


export const userInvitationSchema = z.object({
    invitedById: z.string(),
    name: z.string().min(3, "Name should have at least 3 characters."),
    email: z.string().email("Please enter a valid email address."),
    role: z.enum(["user", "admin"], {
        required_error: "Please select a role.",
        invalid_type_error: "Role must either be an admin or user.",
    }),
});


export type UserInvitationType = z.infer<typeof userInvitationSchema>