"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  User,
  Building2,
  DoorOpen,
  CreditCard,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  Hourglass,
  Mail,
  Phone,
  Globe,
  IdCard,
  Cake,
  Users,
  MessageSquare,
  Target,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ApproveRequestDialog } from "@/components/ApproveRequestDialog";
import { RejectRequestDialog } from "@/components/RejectRequestDialog";
import { CancelRequestDialog } from "@/components/CancelRequestDialog";
import {
  useBookingRequest,
  useApproveBookingRequest,
  useRejectBookingRequest,
  useCancelBookingRequest,
} from "@/hooks/useBookingRequests";
import {
  cn,
  formatPrice,
  formatFileSize,
  formatDiscount,
  hasDiscount,
  getDurationLabel,
  getPeriodLabel,
  getPeriodLabelSingular,
  calculateTotalNights,
  formatDateInTimezone,
  calculateVAT,
  maskPhone,
  maskEmail,
  maskIdNumber,
  formatDateKE,
} from "@/lib/utils";
import { BookingRequestDetailsSkeleton } from "@/components/BookingRequestDetailsSkeleton";
import type { PriceDuration, Role } from "@/lib/types/types";

interface BookingRequestDetailsProps {
  requestId: number;
  userRole: Role;
}

export function BookingRequestDetails({
  requestId,
  userRole,
}: BookingRequestDetailsProps) {
  const router = useRouter();
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const { data, isLoading, isError } = useBookingRequest(requestId);

  // Mutations for dialog control
  const approveMutation = useApproveBookingRequest();
  const rejectMutation = useRejectBookingRequest();
  const cancelMutation = useCancelBookingRequest();

  if (isLoading) {
    return <BookingRequestDetailsSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="container max-w-5xl py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="size-12 text-destructive mb-4" />
            <h2 className="text-lg font-semibold mb-2">Request Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The booking request you&apos;re looking for doesn&apos;t exist or
              you don&apos;t have permission to view it.
            </p>
            <Button onClick={() => router.push("/booking-requests")}>
              <ArrowLeft className="size-4 mr-2" />
              Back to Requests
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const bookingRequest = data;

  // Determine if this is an existing guest request
  const isExistingGuest = !!bookingRequest.existingGuestId;

  // Get guest display info based on type
  const guestName = isExistingGuest
    ? `${bookingRequest.existingGuest?.firstName} ${bookingRequest.existingGuest?.lastName}`
    : `${bookingRequest.guestFirstName} ${bookingRequest.guestLastName}`;

  const guestEmail = isExistingGuest
    ? bookingRequest.existingGuest?.email
    : bookingRequest.guestEmail;

  const guestPhone = isExistingGuest
    ? bookingRequest.existingGuest?.phone
    : bookingRequest.guestPhone;

  const isPending = bookingRequest.status === "pending";
  const isAgent = userRole === "agent";
  const canApproveReject =
    ["user", "admin", "superAdmin"].includes(userRole) && isPending;
  const canCancel = isAgent && isPending;

  const status = bookingRequest.status;

  // Calculate pricing details using utils
  const totalNights = calculateTotalNights(
    bookingRequest.priceDuration as PriceDuration,
    bookingRequest.period,
  );

  // unitPrice is already the discounted price
  const subtotal = bookingRequest.unitPrice * bookingRequest.period;

  // Calculate original price before discount (if discount exists)
  const originalUnitPrice = hasDiscount(bookingRequest.discountRate)
    ? bookingRequest.unitPrice / (1 - bookingRequest.discountRate!)
    : bookingRequest.unitPrice;

  const originalSubtotal = originalUnitPrice * bookingRequest.period;
  const discountAmount = originalSubtotal - subtotal;
  const identifier =
    bookingRequest.guestIdNumber || bookingRequest.guestPassportNumber;

  const maskedID =
    identifier === null ? "None" : maskIdNumber(identifier as string, userRole);

  return (
    <div className="container w-full py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer"
            onClick={() => router.push("/booking-requests")}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">View Booking Request Details</h1>
            <p className="text-muted-foreground">
              Submitted{" "}
              {format(new Date(bookingRequest.createdAt), "PPP 'at' p")}
            </p>
          </div>
        </div>
        <Badge
          className={cn(
            "capitalize border py-2 px-8 text-sm",
            status === "pending" &&
              "border-princeton-orange bg-princeton-orange/10 text-princeton-orange",
            status === "cancelled" &&
              "border-lipstick-red bg-lipstick-red/10 text-lipstick-red",
            status === "rejected" &&
              "border-red-500 bg-red-500/10 text-red-500",
            status === "approved" &&
              "border-medium-jungle bg-medium-jungle/10 text-medium-jungle",
          )}
        >
          {status}
        </Badge>
      </div>

      {/* Rejection Reason */}
      {bookingRequest.status === "rejected" &&
        bookingRequest.rejectionReason && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-destructive flex items-center gap-2">
                <XCircle className="size-5" />
                Rejection Reason
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-lipstick-red">
                {bookingRequest.rejectionReason}
              </p>
            </CardContent>
          </Card>
        )}

      {/* Cancellation Reason */}
      {bookingRequest.status === "cancelled" && bookingRequest.cancelReason && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-destructive flex items-center gap-2">
              <Ban className="size-5" />
              Cancellation Reason
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-lipstick-red">
              {bookingRequest.cancelReason}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Guest Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-5" />
              Guest Information
              {isExistingGuest && (
                <Badge variant="secondary" className="ml-auto">
                  <UserCheck className="size-3 mr-1" />
                  Existing Guest
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {isExistingGuest
                ? "Existing guest selected for this booking"
                : "Details of the guest for this booking"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <User className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{guestName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">
                    {maskEmail(guestEmail as string, userRole)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">
                    {maskPhone(guestPhone as string, userRole)}
                  </p>
                </div>
              </div>

              {/* Only show extended details for new guests */}
              {!isExistingGuest && (
                <>
                  <Separator />

                  <div className="flex items-start gap-3">
                    <Cake className="size-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Date of Birth
                      </p>
                      <p className="font-medium">
                        {bookingRequest.guestDateOfBirth
                          ? format(
                              new Date(bookingRequest.guestDateOfBirth),
                              "PPP",
                            )
                          : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Globe className="size-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Nationality
                      </p>
                      <p className="font-medium">
                        {bookingRequest.guestNationality || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <IdCard className="size-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {bookingRequest.guestIdType === "national_id"
                          ? "National ID Number"
                          : "Passport Number"}
                      </p>
                      <p className="font-medium">{maskedID}</p>
                    </div>
                  </div>

                  {bookingRequest.guestNotes && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-3">
                        <MessageSquare className="size-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Notes</p>
                          <p className="text-sm">{bookingRequest.guestNotes}</p>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Link to existing guest profile */}
              {userRole !== "agent" &&
                isExistingGuest &&
                bookingRequest.existingGuestId && (
                  <>
                    <Separator />
                    <Link
                      href={`/guests/${bookingRequest.existingGuestId}`}
                      className="text-sm text-primary hover:underline flex items-center gap-2"
                    >
                      <UserCheck className="size-4" />
                      View Full Guest Profile
                    </Link>
                  </>
                )}
            </div>
          </CardContent>
        </Card>

        {/* ID Document - Only show for new guests */}
        {!isExistingGuest &&
          (bookingRequest.status === "pending" ||
            bookingRequest.status === "approved") && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IdCard className="size-5" />
                  {bookingRequest.guestIdType === "passport"
                    ? "Passport image"
                    : "National ID image "}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {bookingRequest.idDocumentUrl ? (
                  <>
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border bg-muted">
                      <Image
                        src={bookingRequest.idDocumentUrl}
                        alt="ID Document"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">File Name</span>
                        <span className="font-medium truncate max-w-[200px]">
                          {bookingRequest.idDocumentOriginalName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">File Size</span>
                        <span className="font-medium">
                          {bookingRequest.idDocumentFileSize
                            ? formatFileSize(bookingRequest.idDocumentFileSize)
                            : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <span className="font-medium">
                          {bookingRequest.idDocumentMimeType
                            ? bookingRequest.idDocumentMimeType
                                .split("/")[1]
                                .toUpperCase()
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <FileText className="size-12 mb-2 opacity-50" />
                    <p>Document not available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        {/* Existing Guest Card */}
        {isExistingGuest && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="size-5" />
                Existing Guest
              </CardTitle>
              <CardDescription>
                This booking is for a registered guest
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <UserCheck className="size-8 text-primary" />
                </div>
                <p className="font-medium text-lg">{guestName}</p>
                <p className="text-sm text-muted-foreground">
                  {maskEmail(guestEmail as string, userRole)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {maskPhone(guestPhone as string, userRole)}
                </p>
                <p className="text-xs text-muted-foreground mt-4">
                  This guest is already registered in the system. Their ID
                  document is on file.
                </p>
                {userRole !== "agent" && bookingRequest.existingGuestId && (
                  <Link
                    href={`/guests/${bookingRequest.existingGuestId}`}
                    className="mt-4"
                  >
                    <Button variant="outline" size="sm">
                      <UserCheck className="size-4 mr-2" />
                      View Guest Profile
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Property & Unit */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5" />
              Property & Unit
            </CardTitle>
            <CardDescription>Selected accommodation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="size-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Property</p>
                <Link
                  href={`/properties/${bookingRequest.property.id}`}
                  className="font-medium hover:underline"
                >
                  {bookingRequest.property.name}
                </Link>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DoorOpen className="size-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Unit</p>
                <Link
                  href={`/units/${bookingRequest.unit.id}`}
                  className="font-medium hover:underline"
                >
                  {bookingRequest.unit.name}
                </Link>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <Calendar className="size-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Check in</p>
                <p className="font-medium">
                  {formatDateKE(new Date(bookingRequest.checkInDate))}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="size-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Check out</p>
                <p className="font-medium">
                  {formatDateInTimezone(new Date(bookingRequest.checkOutDate))}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="size-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">
                  {totalNights} night{totalNights !== 1 ? "s" : ""}{" "}
                  <span className="text-muted-foreground">
                    ({bookingRequest.period}{" "}
                    {getPeriodLabelSingular(bookingRequest.priceDuration)}
                    {bookingRequest.period !== 1 ? "s" : ""})
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="size-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Guests</p>
                <p className="font-medium">
                  {bookingRequest.numberOfGuests} guest
                  {bookingRequest.numberOfGuests !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {bookingRequest.purpose && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <Target className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Purpose of Stay
                    </p>
                    <p className="text-sm capitalize">
                      {bookingRequest.purpose}
                    </p>
                  </div>
                </div>
              </>
            )}

            {bookingRequest.specialRequests && (
              <div className="flex items-start gap-3">
                <MessageSquare className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Special Requests
                  </p>
                  <p className="text-sm">{bookingRequest.specialRequests}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-5" />
              Pricing Details
            </CardTitle>
            <CardDescription>Cost breakdown for this booking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rate Type</span>
                <span className="font-medium">
                  {getDurationLabel(bookingRequest.priceDuration)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Unit Price</span>
                <div className="text-right">
                  {hasDiscount(bookingRequest.discountRate) && (
                    <span className="text-muted-foreground line-through mr-2">
                      {formatPrice(originalUnitPrice)}
                    </span>
                  )}
                  <span className="font-medium">
                    {formatPrice(bookingRequest.unitPrice)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {getPeriodLabel(bookingRequest.priceDuration)}
                </span>
                <span className="font-medium">
                  &times; {bookingRequest.period} ({totalNights} night
                  {totalNights !== 1 ? "s" : ""})
                </span>
              </div>

              <Separator />

              {hasDiscount(bookingRequest.discountRate) && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Original Subtotal
                    </span>
                    <span className="text-muted-foreground line-through">
                      {formatPrice(originalSubtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm text-green-600">
                    <span className="flex items-center gap-2">
                      Discount
                      <Badge
                        variant="secondary"
                        className="text-xs bg-green-100 text-green-700"
                      >
                        {formatDiscount(bookingRequest.discountRate)}
                      </Badge>
                    </span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">VAT (16%)</span>
                <span className="font-medium">
                  {formatPrice(calculateVAT(subtotal))}
                </span>
              </div>

              <Separator />

              <div className="flex justify-between text-sm md:text-lg font-semibold">
                <span>Total (incl. VAT)</span>
                <span className="text-primary">
                  {formatPrice(bookingRequest.totalAmount)}
                </span>
              </div>

              <div className="flex justify-between text-base font-medium">
                <span>Payment Code</span>
                <span className="text-primary">
                  {bookingRequest.paymentCode}
                </span>
              </div>
              <div className="flex justify-between text-base font-medium">
                <span>Payment Method</span>
                <span className="text-primary capitalize">
                  {bookingRequest.paymentMethod === "mpesa_till"
                    ? "Mpesa paybill"
                    : bookingRequest.paymentMethod.replace("_", " ")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-5" />
            Request History
          </CardTitle>
          <CardDescription>Timeline of this booking request</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Created */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="size-4 text-primary" />
                </div>
                <div className="flex-1 w-px bg-border mt-2" />
              </div>
              <div className="pb-4">
                <p className="font-medium">Request Submitted</p>
                <p className="text-sm text-muted-foreground">
                  {formatDateInTimezone(new Date(bookingRequest.createdAt))}
                </p>
                <p className="text-sm mt-1">
                  Submitted by{" "}
                  <span className="font-medium">
                    {bookingRequest.requestedBy.name}
                  </span>
                  <span className="text-muted-foreground">
                    {" "}
                    ({bookingRequest.requestedBy.email})
                  </span>
                </p>
              </div>
            </div>

            {/* Reviewed */}
            {bookingRequest.reviewedAt && bookingRequest.reviewedBy && (
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`size-8 rounded-full flex items-center justify-center ${
                      bookingRequest.status === "approved"
                        ? "bg-green-100 text-green-600"
                        : bookingRequest.status === "rejected"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {bookingRequest.status === "approved" ? (
                      <CheckCircle2 className="size-4" />
                    ) : bookingRequest.status === "rejected" ? (
                      <XCircle className="size-4" />
                    ) : (
                      <Ban className="size-4" />
                    )}
                  </div>
                </div>
                <div>
                  <p className="font-medium">
                    {bookingRequest.status === "approved"
                      ? "Request Approved"
                      : bookingRequest.status === "rejected"
                        ? "Request Rejected"
                        : "Request Cancelled"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateInTimezone(new Date(bookingRequest.reviewedAt))}
                  </p>
                  <p className="text-sm mt-1">
                    By{" "}
                    <span className="font-medium">
                      {bookingRequest.reviewedBy.name}
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      ({bookingRequest.reviewedBy.email})
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Pending indicator */}
            {bookingRequest.status === "pending" && (
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="size-8 rounded-full bg-secondary flex items-center justify-center">
                    <Hourglass className="size-4 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">
                    Awaiting Review
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This request is pending approval
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {(canApproveReject || canCancel) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Request Actions
            </CardTitle>
            <CardDescription>
              {isAgent
                ? "You can cancel the request and provide a valid reason."
                : "You can either approve or reject this booking request."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {canApproveReject && (
              <>
                <Button
                  onClick={() => setApproveDialogOpen(true)}
                  className="cursor-pointer w-full md:w-4/12"
                >
                  <CheckCircle2 className="size-5 mr-2" />
                  Approve Request
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setRejectDialogOpen(true)}
                  className="cursor-pointer w-full md:w-4/12"
                >
                  <XCircle className="size-5 mr-2" />
                  Reject Request
                </Button>
              </>
            )}
            {canCancel && (
              <Button
                variant="destructive"
                onClick={() => setCancelDialogOpen(true)}
                className="cursor-pointer"
              >
                <Ban className="size-5 mr-2" />
                Cancel Request
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      {isPending && (
        <>
          <ApproveRequestDialog
            requestId={bookingRequest.id}
            isExistingGuest={isExistingGuest}
            guestId={bookingRequest.id}
            idDocumentFilename={bookingRequest.idDocumentFilename ?? undefined}
            idDocumentOriginalName={
              bookingRequest.idDocumentOriginalName ?? undefined
            }
            idDocumentMimeType={bookingRequest.idDocumentMimeType ?? undefined}
            idDocumentFileSize={bookingRequest.idDocumentFileSize ?? undefined}
            open={approveDialogOpen}
            onOpenChange={(open) => {
              if (!approveMutation.isPending) {
                setApproveDialogOpen(open);
              }
            }}
            mutation={approveMutation}
          />
          <RejectRequestDialog
            requestId={bookingRequest.id}
            idDocumentFilename={bookingRequest.idDocumentFilename ?? undefined}
            open={rejectDialogOpen}
            onOpenChange={(open) => {
              if (!rejectMutation.isPending) {
                setRejectDialogOpen(open);
              }
            }}
            mutation={rejectMutation}
          />
          <CancelRequestDialog
            requestId={bookingRequest.id}
            idDocumentFilename={bookingRequest.idDocumentFilename ?? undefined}
            open={cancelDialogOpen}
            onOpenChange={(open) => {
              if (!cancelMutation.isPending) {
                setCancelDialogOpen(open);
              }
            }}
            mutation={cancelMutation}
          />
        </>
      )}
    </div>
  );
}
