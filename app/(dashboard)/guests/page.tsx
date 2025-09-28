"use client";

import { GuestDialog } from "@/components/GuestDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useGuests } from "@/hooks/useGuests";
import {
  Bed,
  Clock,
  Edit,
  Eye,
  Flag,
  Mail,
  Phone,
  Search,
  Star,
  UserCheck,
  Users,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { StatCards, StatCardsProps } from "@/components/StatCards";

export default function GuestsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    () => searchParams.get("search") || ""
  );
  const initializedRef = useRef(false);

  // Get search parameters from URL
  const search = searchParams.get("search") || "";
  const nationality = searchParams.get("nationality") || "";
  const verification = searchParams.get("verification") || "";

  // React Query hook
  const {
    data: guests = [],
    isLoading,
    error,
  } = useGuests(search, nationality, verification);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "" || value === "all") {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      return params.toString();
    },
    [searchParams]
  );

  // Debounced search handler
  const debouncedSearch = useDebouncedCallback((term: string) => {
    const queryString = createQueryString("search", term);
    router.push(`/guests?${queryString}`);
  }, 300);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    debouncedSearch(value);
  };

  // Initialize search value from URL only once
  if (!initializedRef.current && search !== "") {
    setSearchValue(search);
    initializedRef.current = true;
  }

  const getVerificationColor = (status: string) => {
    switch (status) {
      case "verified":
        return "default";
      case "pending":
        return "secondary";
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

  // Statistics
  const totalGuests = guests.length;
  const verifiedGuests = guests.filter(
    (g) => g.verificationStatus === "verified"
  ).length;
  const pendingGuests = guests.filter(
    (g) => g.verificationStatus === "pending"
  ).length;
  const blacklistedGuests = guests.filter((g) => g.blacklisted).length;

  const stats: StatCardsProps[] = [
    {
      title: "Total Guests",
      value: totalGuests,
      icon: Users,
      color: "blue",
    },
    {
      title: "Verified Guests",
      value: verifiedGuests,
      icon: UserCheck,
      color: "green",
    },
    {
      title: "Pending",
      value: pendingGuests,
      icon: Clock,
      color: "orange",
    },
    {
      title: "Blacklisted",
      value: blacklistedGuests,
      icon: Flag,
      color: "red",
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-normal text-foreground">
              Guest Management
            </h1>
            <p className="text-muted-foreground">
              Manage guest registrations, bookings, and check-ins
            </p>
          </div>
          <GuestDialog />
        </div>
        <div className="text-center py-8">
          <p className="text-destructive">
            Error loading guests. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-normal text-foreground">
            Guest Management
          </h1>
          <p className="text-muted-foreground">Manage guest registrations.</p>
        </div>

        <GuestDialog />
      </div>

      {/* Statistics Cards */}
      <StatCards stats={stats} />

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search guests..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
            disabled={isLoading}
            autoFocus
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading guests...</p>
        </div>
      )}

      {/* Guests Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Spent
                    </span>
                    <span className="font-medium">
                      {formatCurrency(guest.totalSpent || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Last Stay
                    </span>
                    <span className="text-sm">
                      {formatDate(guest.lastStay || null)}
                    </span>
                  </div>
                </div>

                {/* Rating */}
                {guest.rating && (
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{guest.rating}</span>
                    <span className="text-sm text-muted-foreground">
                      rating
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Bed className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && guests.length === 0 && (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No guests found</h3>
          <p className="text-muted-foreground">
            {search
              ? "Try adjusting your search criteria"
              : "Get started by adding your first guest"}
          </p>
        </div>
      )}
    </div>
  );
}
