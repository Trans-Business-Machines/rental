import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
    console.log(process.env.RESEND_API_KEY)
    throw new Error("No resend api");
}

const resend = new Resend(process.env.RESEND_API_KEY);

export default resend;
