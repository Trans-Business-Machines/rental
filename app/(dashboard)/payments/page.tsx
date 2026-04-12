import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/check-permissions";
import { PaymentsContent } from "@/components/PaymentsContent";
import type { Role } from "@/lib/types/types";

export default async function PaymentsPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  const userRole = session.user.role as Role;


  return (
    <main className="container mx-auto py-6 px-4">
      <PaymentsContent userRole={userRole} />
    </main>
  );
}
