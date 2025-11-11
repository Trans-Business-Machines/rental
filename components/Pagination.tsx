"use client";

import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: string | number;
  totalPages: string | number;
  handlePageChange: (page: number) => void;
  hasNext: boolean;
  hasPrev: boolean;
}

function Pagination({
  currentPage,
  totalPages,
  handlePageChange,
  hasNext,
  hasPrev,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between pt-4 w-full">
      <p className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          disabled={!hasPrev}
          className="px-2 bg-transparent cursor-pointer disabled:bg-gray-200 hover:ring-1 hover:ring-primary capitalize group hover:text-primary"
          onClick={() => handlePageChange(Math.max(Number(currentPage) - 1, 0))}
        >
          <ChevronLeft className="size-4 group-hover:text-primary" />
          previous
        </Button>
        <Button
          variant="outline"
          disabled={!hasNext}
          className="px-2 bg-transparent cursor-pointer disabled:bg-gray-200 hover:ring-1 hover:ring-primary capitalize group hover:text-primary"
          onClick={() =>
            handlePageChange(
              Math.min(Number(currentPage) + 1, Number(totalPages))
            )
          }
        >
          next
          <ChevronRight className="size-4 group-hover:text-primary" />
        </Button>
      </div>
    </div>
  );
}

export default Pagination;
