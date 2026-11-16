"use client";

import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Calendar days are picked in the viewer's local calendar; send them as plain yyyy-MM-dd
export const toDay = (date?: Date) => (date ? format(date, "yyyy-MM-dd") : undefined);

export function DateRangeField({
  id,
  label,
  value,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  disabled?: boolean;
}) {
  const text = value?.from
    ? value.to
      ? `${format(value.from, "d MMM yyyy")} – ${format(value.to, "d MMM yyyy")}`
      : `From ${format(value.from, "d MMM yyyy")}`
    : "Any date";

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id={id}
              variant="outline"
              disabled={disabled}
              className={cn(
                "flex-1 justify-start font-normal",
                !value?.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="size-4" />
              {text}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={value}
              onSelect={onChange}
              defaultMonth={value?.from}
              numberOfMonths={2}
              captionLayout="dropdown"
            />
          </PopoverContent>
        </Popover>
        {value?.from && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            onClick={() => onChange(undefined)}
            aria-label={`Clear ${label.toLowerCase()}`}
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
