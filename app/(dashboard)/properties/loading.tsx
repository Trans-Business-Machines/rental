import { Loader2 } from "lucide-react";

export default function PropertyLoader() {
  return (
    <section className="min-h-screen grid place-items-center">
      <div className="flex flex-col gap-2 items-center justify-center text-muted-foreground">
        <Loader2 className="size-6 text-primary md:size-10 animate-spin" />
        <p>Loading properties. . .</p>
      </div>
    </section>
  );
}
