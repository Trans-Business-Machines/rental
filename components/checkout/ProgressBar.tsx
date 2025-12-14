import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface ProgressBarProps {
  currentStep: number;
}

export function ProgressBar({ currentStep }: ProgressBarProps) {
  const steps = [
    { number: 1, label: "Inspector details" },
    { number: 2, label: "Inspection" },
    { number: 3, label: "Summary" },
  ];

  // Calculate the progress width percentage
  // Step 1: 0% (starts at first circle)
  // Step 2: 50% (reaches second circle center)
  // Step 3: 100% (reaches third circle center)
  const progressWidth = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="w-full py-4 px-2">
      <div className="relative flex items-start justify-between w-full">
        {/* Background line - spans from center of first to center of last step */}
        <div className="absolute top-4 md:top-6 left-4 right-4 md:left-6 md:right-6 h-1 bg-muted rounded-full" />

        {/* Active progress line */}
        <div
          className="absolute top-4 md:top-6 left-4 md:left-6 h-1 bg-chart-1 rounded-full transition-all duration-300"
          style={{
            width: `calc(${progressWidth}% - ${progressWidth === 100 ? "0px" : progressWidth === 0 ? "0px" : "0px"})`,
          }}
        />

        {/* Steps */}
        {steps.map((step, index) => {
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          const isFirst = index === 0;
          const isLast = index === steps.length - 1;

          return (
            <div
              key={step.number}
              className={cn(
                "flex flex-col gap-2 z-10",
                isFirst && "items-start",
                isLast && "items-end",
                !isFirst && !isLast && "items-center"
              )}
            >
              <div
                className={cn(
                  "size-8 md:size-12 rounded-full flex items-center justify-center font-semibold transition-all bg-background flex-shrink-0",
                  isActive
                    ? "bg-chart-1 text-white shadow-lg shadow-chart-1/30"
                    : isCompleted
                      ? "bg-chart-1 text-white"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="size-4 md:size-6" />
                ) : (
                  step.number
                )}
              </div>
              <div className="text-center">
                <p
                  className={cn(
                    "text-[10px] md:text-sm font-medium truncate max-w-[60px] md:max-w-none",
                    isActive
                      ? "text-chart-1"
                      : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
