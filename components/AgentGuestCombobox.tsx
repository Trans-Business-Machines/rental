"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, UserPlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn, maskEmail } from "@/lib/utils";
import { useDebouncedCallback } from "use-debounce";
import { useSearchGuestsForBooking } from "@/hooks/useGuests";
import type { GuestSearchResult } from "@/lib/types/types";

interface GuestComboboxProps {
  value: GuestSearchResult | null;
  onSelect: (guest: GuestSearchResult | null) => void;
  onAddNew: () => void;
  disabled?: boolean;
  error?: string;
}

const statusLabels: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" }
> = {
  pending: { label: "Pending", variant: "secondary" },
  reserved: { label: "Reserved", variant: "default" },
  checked_in: { label: "Checked In", variant: "destructive" },
};

export function GuestCombobox({
  value,
  onSelect,
  onAddNew,
  disabled = false,
  error,
}: GuestComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const debouncedSetSearch = useDebouncedCallback((query: string) => {
    setDebouncedSearch(query);
  }, 300);

  const { data: guests = [], isLoading } =
    useSearchGuestsForBooking(debouncedSearch);

  useEffect(() => {
    setDebouncedSearch("");
  }, []);

  const handleSearchChange = (query: string) => {
    setSearch(query);
    debouncedSetSearch(query);
  };

  const handleSelect = (guest: GuestSearchResult) => {
    if (guest.activeBookingStatus) return;
    onSelect(guest);
    setOpen(false);
  };

  const handleClear = () => {
    onSelect(null);
  };

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
              "w-full justify-between font-normal h-auto min-h-10",
              !value && "text-muted-foreground",
              error && "border-destructive",
            )}
          >
            {value ? (
              <div className="flex flex-col items-start">
                <span className="font-medium">
                  {value.firstName} {value.lastName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {maskEmail(value.email, "agent")}
                </span>
              </div>
            ) : (
              "Search for a guest..."
            )}
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0 w-[var(--radix-popover-trigger-width)]"
          align="start"
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search by name, email, or phone..."
              value={search}
              onValueChange={handleSearchChange}
            />
            <CommandList>
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : guests.length === 0 ? (
                <CommandEmpty>
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      No guests found
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setOpen(false);
                        onAddNew();
                      }}
                    >
                      <UserPlus className="size-4 mr-2" />
                      Add New Guest
                    </Button>
                  </div>
                </CommandEmpty>
              ) : (
                <>
                  <CommandGroup heading="Only verified guests will appear">
                    {guests.map((guest) => {
                      const hasActiveBooking = !!guest.activeBookingStatus;
                      const statusInfo = guest.activeBookingStatus
                        ? statusLabels[guest.activeBookingStatus]
                        : null;

                      return (
                        <CommandItem
                          key={guest.id}
                          value={guest.id.toString()}
                          onSelect={() => handleSelect(guest)}
                          disabled={hasActiveBooking}
                          className={cn(
                            "flex items-center justify-between py-3",
                            hasActiveBooking && "opacity-50 cursor-not-allowed",
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Check
                              className={cn(
                                "size-4",
                                value?.id === guest.id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            <div>
                              <p className="font-medium">
                                {guest.firstName} {guest.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {maskEmail(guest.email, "agent")}
                              </p>
                            </div>
                          </div>

                          {hasActiveBooking && statusInfo && (
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={statusInfo.variant}
                                className="text-xs"
                              >
                                {statusInfo.label}
                              </Badge>
                              <span className="text-xs text-muted-foreground max-w-[80px] truncate">
                                {guest.activeBookingUnit}
                              </span>
                            </div>
                          )}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>

                  <CommandSeparator />

                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setOpen(false);
                        onAddNew();
                      }}
                      className="text-primary"
                    >
                      <UserPlus className="size-4 mr-2" />
                      Add New Guest
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {error && !value && <p className="text-sm text-destructive">{error}</p>}

      {value && (
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div>
            <p className="font-medium">
              {value.firstName} {value.lastName}
            </p>
            <p className="text-sm text-muted-foreground">
              {maskEmail(value.email, "agent")}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
