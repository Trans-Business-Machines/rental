import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

/** Neutral, informational note inside dialogs and forms — blue, not a warning. */
export function InfoBanner({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-2 rounded-md border border-blue-500/50 bg-blue-500/10 p-3 text-xs text-blue-700 dark:text-blue-300",
        className,
      )}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
