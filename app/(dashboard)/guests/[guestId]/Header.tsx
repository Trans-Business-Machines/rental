"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, SquarePen, Trash2 } from "lucide-react";
import { GuestEditDialog } from "@/components/GuestEditDialog";
import { useDeleteGuest } from "@/hooks/useGuests";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Guest } from "@/lib/types/types";

function Header({ guest }: { guest: Guest }) {
  const deleteMutation = useDeleteGuest();
  const router = useRouter();

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

      <div className="flex gap-2 items-center">
        <GuestEditDialog guest={guest}>
          <Button className="cursor-pointer">
            <SquarePen className="size-4" />
            <span>Edit Guest</span>
          </Button>
        </GuestEditDialog>
        <Button
          size="default"
          variant="destructive"
          disabled={deleteMutation.isPending}
          onClick={async () => {
            await deleteMutation.mutateAsync(guest.id);
            router.push("/guests");
          }}
          className="flex items-center gap-2 cursor-pointer hover:bg-red-500"
        >
          <Trash2 className="size-4" />
          <span> Delete Guest</span>
        </Button>
      </div>
    </header>
  );
}

export default Header;
