"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import type { BookingStatus } from "@/lib/types/types";

interface Guest {
  isCheckedIn: boolean;
  id: number;
  email: string;
  bookings: {
    id: number;
    status: BookingStatus;
  }[];
  firstName: string;
  lastName: string;
}

interface GuestComboboxProps {
  guests: Guest[];
  value: string;
  onValueChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

function GuestCombobox({
  guests,
  value,
  onValueChange,
  disabled,
  error,
}: GuestComboboxProps) {
  // Define state to track popover open state
  const [open, setOpen] = useState(false);

  // Find the selected guestu
  const selectedGuest = guests.find((guest) => guest.id.toString() === value);

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between cursor-pointer",
              !value && "text-muted-foreground",
              error && "border-red-400"
            )}
          >
            {selectedGuest ? (
              <span className="capitalize">
                {selectedGuest.firstName} {selectedGuest.lastName}
              </span>
            ) : (
              "Select guest..."
            )}
            <ChevronsUpDown className="ml-2 size-4  shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0 w-[var(--radix-popover-trigger-width)]"
          align="start"
        >
          <Command>
            <CommandInput
              placeholder="Search guest by name or email"
              className="h-9"
            />
            <CommandList className="max-h-[200px] md:max-h-[300px] lg:max-h-[400px]">
              <CommandEmpty>No guests found.</CommandEmpty>
              <CommandGroup heading="Only verified guests appear.">
                {guests.map((guest) => {
                  const guestId = guest.id.toString();
                  const fullName = `${guest.firstName} ${guest.lastName}`;
                  let guestStatus = "";

                  if (guest.isCheckedIn) {
                    const bookingStatus = guest.bookings[0].status;
                    guestStatus =
                      bookingStatus === "pending"
                        ? "booked"
                        : bookingStatus.replace("_", " ");
                  }

                  return (
                    <CommandItem
                      key={guest.id}
                      value={guestId}
                      disabled={guest.isCheckedIn}
                      keywords={[
                        guest.firstName.toLowerCase(),
                        guest.lastName.toLowerCase(),
                        guest.email.toLowerCase(),
                        fullName.toLowerCase(),
                      ]}
                      onSelect={(currentValue) => {
                        onValueChange(currentValue);
                        setOpen(false);
                      }}
                      className="flex flex-col items-start disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div className="flex items-center w-full">
                        <div className="flex-1">
                          <p className="font-medium flex gap-4 items-center">
                            <span>{fullName}</span>
                            {guest.isCheckedIn && (
                              <span className="text-sm text-muted-foreground capitalize">
                                ({guestStatus})
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {guest.email}
                          </p>
                        </div>
                        <Check
                          className={cn(
                            "ml-2 size-4",
                            value === guestId ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
    </div>
  );
}

export { GuestCombobox };
