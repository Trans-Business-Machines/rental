import { getServerSession } from "@/lib/check-permissions";
import { redirect } from "next/navigation";
import { UnauthorizedUI } from "./unauthotized-ui";
import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { getUnitTypePricings } from "@/lib/actions/settings";
import { SettingsTable } from "./settings-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PricingCreateDialog } from "@/components/PricingCreateDialog";

async function Settings() {
  // Get the user session
  const session = await getServerSession();

  // Redirect to login if no session
  if (!session) {
    redirect("/login");
  }

  // Authorize user has correct permissions
  const user = session.user;

  if (user.role !== "superAdmin") {
    return <UnauthorizedUI />;
  }

  // Prefetch settings on the server
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["application", "settings"] as const,
    queryFn: async () => {
      return await getUnitTypePricings();
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <section className="space-y-6">
        <header className="flex flex-col gap-3 md:gap-0 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-normal text-foreground">
              Pricing Settings
            </h1>
            <p className="text-muted-foreground">Manage unit type pricings.</p>
          </div>

          <PricingCreateDialog>
            <Button size="lg" className="px-10 cursor-pointer">
              <Plus className="text-white size-4" />
              <span>Add unit pricing</span>
            </Button>
          </PricingCreateDialog>
        </header>

        {/* pricings table goes here */}
        <SettingsTable />
      </section>
    </HydrationBoundary>
  );
}

export default Settings;
