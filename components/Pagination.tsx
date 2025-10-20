"use client";

import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* interface PaginationProps {
  currentPage: string | number;
  totalPages: string | number;
  nextPage: (page: number) => void;
  previusPage: (page: number) => void;
} */

function Pagination() {
  return (
    <div className="flex items-center justify-between pt-4 w-full">
      <p className="text-sm text-muted-foreground">Page 1 of 1</p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="px-2 bg-transparent cursor-pointer hover:ring-1 hover:ring-primary capitalize group hover:text-primary"
        >
          <ChevronLeft className="size-4 group-hover:text-primary" />
          previous
        </Button>
        <Button
          variant="outline"
          className="px-2 bg-transparent cursor-pointer hover:ring-1 hover:ring-primary capitalize group hover:text-primary"
        >
          next
          <ChevronRight className="size-4 group-hover:text-primary" />
        </Button>
      </div>
    </div>
  );
}

export default Pagination;
