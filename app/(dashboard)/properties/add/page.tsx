import { Button } from "@/components/ui/button";
import { NewPropertyForm } from "./new-property-form";
import { ArrowLeft } from "lucide-react";
import { getServerSession } from "@/lib/check-permissions";
import { redirect } from "next/navigation";
import { UnauthorizedUI } from "../unauthorized-ui";
import Link from "next/link";
import type { Role } from "@/lib/types/types";

export default async function AddPropertyPage() {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  if (!["superAdmin"].includes(user.role as Role)) {
    return <UnauthorizedUI />;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <Link href="/properties">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4 mr-1" />
            Back to Properties
          </Button>
        </Link>
        <div>
          <h1 className="font-bold text-lg md:text-2xl">Add New Property</h1>
          <p className="text-muted-foreground">Create a new rental property.</p>
        </div>
      </div>

      <div className="w-12/12">
        <NewPropertyForm />
      </div>
    </section>
  );
}
