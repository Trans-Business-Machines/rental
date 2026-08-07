"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, SquarePen, Archive, ShieldAlert } from "lucide-react";
import { GuestEditDialog } from "@/components/GuestEditDialog";
import { useSoftDeleteGuest } from "@/hooks/useGuests";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertDialog } from "@/components/AlertDialog";
import { shouldDisableDelete } from "@/lib/utils";
import type { Guest } from "@/lib/types/types";

interface HeaderProps {
  guest: Guest;
  returnTo?: string;
}

// Only allow same-app relative paths — guards against an open redirect via returnTo.
function isSafeReturnPath(path?: string): path is string {
  return !!path && path.startsWith("/") && !path.startsWith("//");
}

function Header({ guest, returnTo }: HeaderProps) {
  const { mutateAsync, isPending: isArchivePending } = useSoftDeleteGuest();
  const router = useRouter();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [guestToArchive, setGuestToArchive] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const safeReturnTo = isSafeReturnPath(returnTo) ? returnTo : undefined;

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

  const handleReviewed = () => {
    if (safeReturnTo) {
      router.push(safeReturnTo);
    }
  };

  return (
    <header className="flex flex-col gap-3 py-2">
      {safeReturnTo && (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-princeton-orange bg-princeton-orange/10 text-princeton-orange">
          <ShieldAlert className="size-5 shrink-0 mt-0.5" />
          <p className="text-sm">
            Review <strong className="capitalize">{guest.firstName} {guest.lastName}</strong>&apos;s
            details below, then click <strong>Edit Guest</strong> to either
            verify or reject their identity. Once you save, you&apos;ll be
            returned to the booking request to continue.
          </p>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:justify-between gap-3">
        <div className="flex gap-0">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/guests">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>

          <div>
            <h2 className="text-lg capitalize md:text-2xl font-bold tracking-normal text-foreground">
              Guest profile
            </h2>
            <p className="text-muted-foreground text-sm">
              Complete guest information and history
            </p>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <Button
            className="cursor-pointer"
            onClick={() => setEditDialogOpen(true)}
          >
            <SquarePen className="size-4" />
            <span>Edit Guest</span>
          </Button>
          <GuestEditDialog
            guest={guest}
            isDialogOpen={editDialogOpen}
            setIsDialogOpen={setEditDialogOpen}
            onReviewed={handleReviewed}
          />

          <Button
            size="default"
            variant="destructive"
            disabled={shouldDisableDelete(guest) || isArchivePending}
            onClick={() => handleClick(guest.id)}
            className="bg-lipstick-red hover:bg-crimson-red flex items-center gap-2 cursor-pointer"
          >
            <Archive className="size-4" />
            <span> Archive Guest</span>
          </Button>
        </div>
      </div>

      <AlertDialog
        action="archive"
        item="guest"
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        actionFn={handleConfirm}
        statement="Once a guest is archived only a super admin can restore this guest."
        isLoading={isArchivePending}
      />
    </header>
  );
}

export default Header;
