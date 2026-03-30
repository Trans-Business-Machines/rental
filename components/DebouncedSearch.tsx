"use client";

import { useState, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Search, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DebouncedSearchProps {
  value: string;
  onSearch: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export function DebouncedSearch({
  value,
  onSearch,
  placeholder = "Search...",
  debounceMs = 400,
  className,
}: DebouncedSearchProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isSearching, setIsSearching] = useState(false);

  // Sync input with external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const debouncedSearch = useDebouncedCallback((searchValue: string) => {
    onSearch(searchValue);
    setIsSearching(false);
  }, debounceMs);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsSearching(true);
    debouncedSearch(newValue);
  };

  const handleClear = () => {
    setInputValue("");
    setIsSearching(false);
    debouncedSearch.cancel();
    onSearch("");
  };

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleChange}
        className="pl-9 pr-9"
      />
      {isSearching ? (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground animate-spin" />
      ) : inputValue ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 size-7 hover:bg-transparent"
          onClick={handleClear}
        >
          <X className="size-4 text-muted-foreground hover:text-foreground" />
        </Button>
      ) : null}
    </div>
  );
}
