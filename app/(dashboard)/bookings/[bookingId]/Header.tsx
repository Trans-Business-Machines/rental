"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, SquarePen } from "lucide-react";
import Link from "next/link";
import { BookingEditDialog } from "../../dashboard/_components/booking-edit-dialog";
import type { Booking } from "@/lib/types/types";

function Header({ booking }: { booking: Booking }) {
  return (
    <header className="flex items-center justify-between py-2">
      <div className="flex gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/bookings">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>

        <div>
          <h2 className="text-lg md:text-2xl font-bold tracking-tight text-foreground">
            Booking Details
          </h2>
          <p className="text-muted-foreground text-sm">
            View complete booking details
          </p>
        </div>
      </div>

      <div className="space-x-2">
        <Button variant="outline" className="cursor-pointer">
          <Download className="size-4" />
          <span>Export</span>
        </Button>
        <BookingEditDialog booking={booking}>
          <Button className="cursor-pointer">
            <SquarePen className="size-4" />
            <span>Edit Booking</span>
          </Button>
        </BookingEditDialog>
      </div>
    </header>
  );
}

export default Header;
