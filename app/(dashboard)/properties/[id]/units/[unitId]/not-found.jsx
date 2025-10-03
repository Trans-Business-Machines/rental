"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

function NotFound() {
  const router = useRouter();

  return (
    <section className="space-y-6 min-h-screen flex items-center justify-center">
      <header className="flex flex-col items-center gap-2">
        <h2 className="text-lg md:text-2xl lg:text-3xl text-chart-5">
          404 - unit not found
        </h2>
        <Button onClick={() => router.back()}>Go back</Button>
      </header>
    </section>
  );
}

export default NotFound;
