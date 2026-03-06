import { House } from "lucide-react";

function AppSkeleton() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background to-slate-50 flex flex-col items-center justify-center gap-6">
      {/* Animated Logo Container */}
      <div className="relative flex items-center justify-center">
        {/* Outer glow ring */}
        <div className="absolute size-20 rounded-2xl bg-azure/20 animate-[pulse_2s_ease-in-out_infinite]" />

        {/* Middle ring */}
        <div className="absolute size-16 rounded-xl bg-azure/30 animate-[pulse_2s_ease-in-out_infinite_200ms]" />

        {/* Logo */}
        <div className="relative size-14 rounded-xl bg-azure grid place-items-center shadow-lg shadow-azure/25">
          <House className="text-white size-8" />
        </div>
      </div>

      {/* Brand name with fade in */}
      <div className="text-center space-y-1 animate-[fadeIn_0.5s_ease-in-out]">
        <p className="text-sm text-muted-foreground">
          Loading your workspace...
        </p>
      </div>

      {/* Loading dots */}
      <div className="flex gap-1.5">
        <div className="size-2 rounded-full bg-azure animate-[bounce_1s_ease-in-out_infinite]" />
        <div className="size-2 rounded-full bg-azure animate-[bounce_1s_ease-in-out_infinite_150ms]" />
        <div className="size-2 rounded-full bg-azure animate-[bounce_1s_ease-in-out_infinite_300ms]" />
      </div>
    </div>
  );
}

export { AppSkeleton };
