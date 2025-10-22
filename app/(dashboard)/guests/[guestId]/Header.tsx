"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, SquarePen } from "lucide-react";
import type { Guest } from "@/lib/types/types";
import { GuestEditDialog } from "@/components/GuestEditDialog";
import Link from "next/link";

function Header({ guest }: { guest: Guest }) {
  return (
    <header className="flex items-center justify-between py-2">
      <div className="flex gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/guests">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>

        <div>
          <h2 className="text-lg capitalize md:text-2xl font-bold tracking-tight text-foreground">
            Guest profile
          </h2>
          <p className="text-muted-foreground text-sm">
            Complete guest information and history
          </p>
        </div>
      </div>

      <div className="space-x-2">
        <GuestEditDialog guest={guest}>
          <Button className="cursor-pointer">
            <SquarePen className="size-4" />
            <span>Edit Guest</span>
          </Button>
        </GuestEditDialog>
      </div>
    </header>
  );
}

export default Header;
