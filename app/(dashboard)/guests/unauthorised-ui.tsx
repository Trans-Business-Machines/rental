import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";
import Link from "next/link";

export function UnauthorizedUI() {
  return (
    <section className="flex-1 grid place-items-center">
      <Card className="w-full max-w-md border-0 shadow-lg rounded-2xl">
        <CardContent className="pt-8 pb-8 px-8">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-crimson-red/10 rounded-full flex items-center justify-center">
              <ShieldX className="size-8 text-crimson-red" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">
                Access Denied
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                You don&apos;t have permission to access this page. Only
                administrators can manage guests information.
              </p>
            </div>

            <Button asChild className="mt-4 bg-azure hover:bg-blue-600">
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
