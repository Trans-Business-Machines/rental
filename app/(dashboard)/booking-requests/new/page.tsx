import { BookingRequestForm } from "@/components/BookingRequestForm";
import { getServerSession } from "@/lib/check-permissions";
import { redirect } from "next/navigation";
import { UnauthorizedUI } from "./unauthorized-ui";
import type { Role } from "@/lib/types/types";

export default async function NewRequest() {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  const userRole = user.role as Role;

  if (userRole !== "agent") {
    return <UnauthorizedUI />;
  }

  return <BookingRequestForm />;
}
