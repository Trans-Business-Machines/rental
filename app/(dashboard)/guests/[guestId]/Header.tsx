"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, SquarePen, Archive } from "lucide-react";
import { GuestEditDialog } from "@/components/GuestEditDialog";
import { useSoftDeleteGuest } from "@/hooks/useGuests";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertDialog } from "@/components/AlertDialog";
import type { Guest } from "@/lib/types/types";

function Header({ guest }: { guest: Guest }) {
  const { mutateAsync, isPending } = useSoftDeleteGuest();
  const router = useRouter();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [guestToArchive, setGuestToArchive] = useState<number | null>(null);

  const handleClick = (id: number) => {
    setGuestToArchive(id);
    setDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (guestToArchive) {
      await mutateAsync(guestToArchive);
      setGuestToArchive(null);
      setDialogOpen(false);
      router.push("/guests");
    }
  };

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
          disabled={isPending}
          onClick={() => handleClick(guest.id)}
          className="bg-orange-500 hover:bg-orange-600 flex items-center gap-2 cursor-pointer"
        >
          <Archive className="size-4" />
          <span> Archive Guest</span>
        </Button>
      </div>

      <AlertDialog
        action="archive"
        item="guest"
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        actionFn={handleConfirm}
        statement="Once a guest is archived only a super admin can restore this guest."
        isLoading={isPending}
      />
    </header>
  );
}

export default Header;
