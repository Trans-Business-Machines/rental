"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Pagination from "@/components/Pagination";

interface FooterProps {
  currentPage: string | number;
  totalPages: string | number;
  hasNext: boolean;
  hasPrev: boolean;
  paramName?: string;
  preserveParams?: string[];
}

function Footer({
  currentPage,
  hasNext,
  hasPrev,
  totalPages,
  paramName = "page",
  preserveParams = [],
}: FooterProps) {
  // Get the router object and search params
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigate = (newPage: number) => {
    const params = new URLSearchParams();

    preserveParams.forEach((param) => {
      const value = searchParams.get(param);
      if (value) {
        params.set(param, value);
      }
    });

    params.set(paramName, newPage.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <footer className="absolute -bottom-14 py-4 px-5  left-0 right-0  grid place-items-center">
      <Pagination
        handlePageChange={navigate}
        currentPage={currentPage}
        totalPages={totalPages}
        hasNext={hasNext}
        hasPrev={hasPrev}
      />
    </footer>
  );
}

export { Footer };
