"use client";

import { useEffect, useRef } from "react";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InfiniteScrollSentinelProps {
  loaded: number;
  total: number | null;
  noun: string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isError: boolean;
  fetchNextPage: () => void;
}

/**
 * Sits under an infinitely scrolling list and asks for the next batch once
 * it comes within a screen of the viewport, so rows are usually ready
 * before the user reaches the bottom.
 */
export function InfiniteScrollSentinel({
  loaded,
  total,
  noun,
  hasNextPage,
  isFetchingNextPage,
  isError,
  fetchNextPage,
}: InfiniteScrollSentinelProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || !hasNextPage || isError) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "100% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, isError, fetchNextPage]);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center gap-2 py-6 text-sm text-muted-foreground"
    >
      {isFetchingNextPage ? (
        <span className="flex items-center gap-2">
          <Loader className="size-4 animate-spin" />
          Loading more {noun}
        </span>
      ) : isError ? (
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={() => fetchNextPage()}
        >
          Couldn&apos;t load more {noun}. Try again
        </Button>
      ) : null}

      {total !== null && total > 0 && (
        <span>
          {hasNextPage
            ? `Showing ${loaded} of ${total} ${noun}`
            : `All ${total} ${noun} loaded`}
        </span>
      )}
    </div>
  );
}
