import { getGuestById } from "@/lib/actions/guests";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Shield,
  Home,
  User,
  Mail,
  AlertCircle,
  Phone,
  IdCard,
  Book,
  Flag,
  MapPin,
  Briefcase,
  Users,
  FileText,
} from "lucide-react";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import Header from "./Header";

interface GuestDetailsPageProps {
  params: Promise<{ guestId: string | number }>;
}

const getVerificationColor = (status: string) => {
  switch (status) {
    case "verified":
      return "bg-chart-2/10 text-chart-2 border-chart-2/20";
    case "pending":
      return "bg-chart-3/10 text-chart-3 border-chart-3/20";
    case "rejected":
      return "bg-destructive/10 text-destructive border-destructive/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

async function GuestDetailsPage({ params }: GuestDetailsPageProps) {
  const { guestId } = await params;

  // Ensure that guest Id is a number
  const id = typeof guestId === "string" ? Number(guestId) : guestId;

  const guest = await getGuestById(id);

  // show not found page if no guest is found.
  if (!guest) {
    notFound();
  }

  return (
    <section className="space-y-6 pb-4">
      <Header guest={guest} />

      {/* Guest status banner */}
      <Card className="border-l-4 border-l-chart-1">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-chart-1/10 capitalize text-chart-1 text-2xl font-semibold">
                  {guest.firstName[0]}
                  {guest.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {guest.firstName} {guest.lastName}
                </h2>
                {guest.verificationStatus && (
                  <Badge
                    variant="secondary"
                    className={`${getVerificationColor(guest.verificationStatus)} capitalize mt-2`}
                  >
                    {guest.verificationStatus}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {guest.blacklisted && (
                <Badge variant="destructive" className="gap-2 w-fit">
                  <Flag className="h-3 w-3" />
                  Blacklisted
                </Badge>
              )}
              {guest.rating && (
                <div className="text-center p-3 rounded-lg bg-chart-4/10">
                  <p className="text-2xl font-bold text-chart-4">
                    {guest.rating.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guest Details */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="size-5 text-chart-2" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <article className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-lg bg-chart-2/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="size-5 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Email Address
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {guest.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-lg bg-chart-3/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="size-5 text-chart-3" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Phone Number
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {guest.phone}
                    </p>
                  </div>
                </div>

                {guest.address && (
                  <div className="flex items-start gap-3 md:col-span-2">
                    <div className="size-10 rounded-lg bg-chart-4/10 flex items-center justify-center flex-shrink-0">
                      <Home className="size-5 text-chart-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Address
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {guest.address}
                        {guest.city && `, ${guest.city}`}
                        {guest.country && `, ${guest.country}`}
                      </p>
                    </div>
                  </div>
                )}
              </article>
            </CardContent>
          </Card>

          {/* Identification Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="size-5 text-chart-5" />
                Identification Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {guest.idType && (
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-lg bg-chart-5/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="size-5 text-chart-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        ID Type
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {guest.idType}
                      </p>
                    </div>
                  </div>
                )}

                {guest.idNumber && (
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-lg bg-chart-1/10 flex items-center justify-center flex-shrink-0">
                      <IdCard className="size-5 text-chart-1" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        ID Number
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {guest.idNumber}
                      </p>
                    </div>
                  </div>
                )}

                {guest.passportNumber && (
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-lg bg-chart-2/10 flex items-center justify-center flex-shrink-0">
                      <Book className="size-5 text-chart-2" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Passport Number
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {guest.passportNumber}
                      </p>
                    </div>
                  </div>
                )}

                {guest.nationality && (
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-lg bg-chart-3/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="size-5 text-chart-3" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Nationality
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {guest.nationality}
                      </p>
                    </div>
                  </div>
                )}

                {guest.dateOfBirth && (
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-chart-4/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-chart-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Date of Birth
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {format(new Date(guest.dateOfBirth), "PPP")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          {(guest.occupation || guest.employer) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="size-5 text-chart-3" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {guest.occupation && (
                    <div className="flex items-start gap-3">
                      <div className="size-10 rounded-lg bg-chart-3/10 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="size-5 text-chart-3" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Occupation
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {guest.occupation}
                        </p>
                      </div>
                    </div>
                  )}

                  {guest.employer && (
                    <div className="flex items-start gap-3">
                      <div className="size-10 rounded-lg bg-chart-4/10 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="size-5 text-chart-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Employer
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {guest.employer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Emergency Contact */}
          {(guest.emergencyContactName || guest.emergencyContactPhone) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="size-5 text-destructive" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {guest.emergencyContactName && (
                    <div className="flex items-start gap-3">
                      <div className="size-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                        <User className="size-5 text-destructive" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Contact Name
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {guest.emergencyContactName}
                        </p>
                      </div>
                    </div>
                  )}

                  {guest.emergencyContactRelation && (
                    <div className="flex items-start gap-3">
                      <div className="size-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                        <Users className="size-5 text-destructive" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Relationship
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {guest.emergencyContactRelation}
                        </p>
                      </div>
                    </div>
                  )}

                  {guest.emergencyContactPhone && (
                    <div className="flex items-start gap-3 md:col-span-2">
                      <div className="size-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                        <Phone className="size-5 text-destructive" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Contact Phone
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {guest.emergencyContactPhone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {guest.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="size-5 text-chart-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground leading-relaxed">
                  {guest.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Statistics & Summary */}
        <div className="space-y-6">
          {/* Stay Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="size-5 text-chart-2" />
                Stay Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium text-muted-foreground">
                    Total Stays
                  </span>
                  <span className="text-2xl font-bold text-chart-2">
                    {guest.totalStays || 0}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium text-muted-foreground">
                    Total Nights
                  </span>
                  <span className="text-2xl font-bold text-chart-3">
                    {guest.totalNights || 0}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium text-muted-foreground">
                    Total Spent
                  </span>
                  <span className="text-2xl font-bold text-chart-4">
                    ${(guest.totalSpent || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <Separator />

              {guest.lastStay && (
                <div className="text-center p-3 rounded-lg bg-chart-1/10">
                  <p className="text-xs text-muted-foreground mb-1">
                    Last Stay
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {format(new Date(guest.lastStay), "MMM dd, yyyy")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Registration Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="size-5 text-chart-5" />
                Registration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {guest.registrationDate && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Registered On
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {format(
                      new Date(guest.registrationDate),
                      "MMM d, yyyy, hh:mm a"
                    )}
                  </p>
                </div>
              )}

              {guest.createdAt && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Created</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(guest.createdAt), "MMM d, yyyy, hh:mm a")}
                  </p>
                </div>
              )}

              {guest.updatedAt && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Last Updated
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(guest.updatedAt), "MMM d, yyyy, hh:mm a")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default GuestDetailsPage;
