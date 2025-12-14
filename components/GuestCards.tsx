"use client";

//import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Mail, Phone } from "lucide-react";
import type { Guest } from "@/lib/types/types";
//import { canDeleteGuest } from "@/lib/utils";
import Link from "next/link";

interface GuestCardsProps {
  guests: Guest[];
  setIsDialogOpen: (open: boolean) => void;
  setEditGuest: (guest: Guest) => void;
}

/* 
interface GuestToDelete {
  id: number;
  firstName: string;
  lastName: string;
} */

const getVerificationColor = (status: string) => {
  switch (status) {
    case "verified":
      return "default";
    case "pending":
      return "outline";
    case "rejected":
      return "destructive";
    default:
      return "secondary";
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(amount);
};

const formatDate = (dateString: string | Date | null) => {
  if (!dateString) return "Never";
  return new Date(dateString).toLocaleDateString();
};

function GuestCards({
  guests,
  setEditGuest,
  setIsDialogOpen,
}: GuestCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {guests.map((guest) => (
        <Card key={guest.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-lg">
                    {guest.firstName[0]}
                    {guest.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">
                    {guest.firstName} {guest.lastName}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {guest.occupation || "Not specified"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <Badge
                  variant={
                    getVerificationColor(
                      guest.verificationStatus || "pending"
                    ) as "default" | "secondary" | "destructive" | "outline"
                  }
                >
                  {guest.verificationStatus || "pending"}
                </Badge>
                {guest.blacklisted && (
                  <Badge variant="destructive" className="text-xs">
                    Blacklisted
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Contact Information */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{guest.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{guest.phone}</span>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-2 bg-muted/50 rounded-lg">
                <p className="font-medium">{guest.totalStays || 0}</p>
                <p className="text-muted-foreground">Total Stays</p>
              </div>
              <div className="text-center p-2 bg-muted/50 rounded-lg">
                <p className="font-medium">{guest.totalNights || 0}</p>
                <p className="text-muted-foreground">Total Nights</p>
              </div>
            </div>

            {/* Financial Info */}
            <div className="">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Spent
                </span>
                <span className="font-medium">
                  {formatCurrency(guest.totalSpent || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Stay</span>
                <span className="text-sm">
                  {formatDate(guest.lastStay || null)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button
                size="sm"
                className="flex-1 gap-2 bg-chart-1 hover:bg-chart-1/90 cursor-pointer"
                asChild
              >
                <Link href={`/guests/${guest.id}`}>
                  <Eye className="size-4 mr-2" />
                  <span>View</span>
                </Link>
              </Button>
              <Button
                size="sm"
                className="flex-1 gap-2 bg-chart-3 hover:bg-chart-3/90 cursor-pointer"
                onClick={() => {
                  setEditGuest(guest);
                  setIsDialogOpen(true);
                }}
              >
                <Edit className="size-4 mr-2" />
                <span>Edit</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export { GuestCards };
