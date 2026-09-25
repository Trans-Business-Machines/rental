import { reconcileStock } from "@/lib/actions/inventory";
import { StockReconciliation } from "@/components/Stockreconciliation";
import { getServerSession } from "@/lib/check-permissions";
import { UnauthorizedUI } from "../unauthorized-ui";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Role } from "@/lib/types/types";

export default async function ReconcilePage() {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  const userRole = user.role as Role;

  // Correcting a balance overwrites a number people rely on, so this
  // sits above the normal inventory permission.
  if (userRole !== "admin" && userRole !== "superAdmin") {
    return <UnauthorizedUI />;
  }

  const rows = await reconcileStock();

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-0">
        <div>
          <h1 className="text-3xl font-bold tracking-normal text-foreground">
            Stock Reconciliation
          </h1>
          <p className="text-muted-foreground">
            Checks every recorded balance against the movements that produced
            it.
          </p>
        </div>

        <Button variant="outline" asChild>
          <Link href="/inventory">
            <ArrowLeft className="mr-2 size-4" />
            Back to Inventory
          </Link>
        </Button>
      </header>

      <StockReconciliation rows={rows} />
    </section>
  );
}
