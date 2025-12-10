"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { getNationalities, cn } from "@/lib/utils";

interface NationalityComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

function NationalityCombobox({
  value,
  onValueChange,
  disabled,
  error,
}: NationalityComboboxProps) {
  // Define state to keep track of popover open state
  const [open, setOpen] = useState(false);

  // Get the world's nationalities
  const nationalities = getNationalities();

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between",
              !value && "text-muted-foreground",
              error && "border-red-400"
            )}
          >
            {value
              ? nationalities.find((nation) => nation === value)
              : "Select nationality..."}
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput className="h-9" placeholder="Select nationality." />
            <CommandList className="max-h-[200px] md:max-h-[300px] lg:max-h-[400px]">
              <CommandEmpty>No nationality found.</CommandEmpty>
              <CommandGroup>
                {nationalities.map((nationality, index) => (
                  <CommandItem
                    key={index}
                    value={nationality}
                    keywords={[nationality]}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    {nationality}
                    <Check
                      className={cn(
                        "size-4",
                        value === nationality ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

export { NationalityCombobox };
