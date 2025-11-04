import { Resend } from "resend";

// TODO: use TBM's RESEND_API_KEY other than vincents
const resend = new Resend(process.env.RESEND_API_KEY);

export default resend;
