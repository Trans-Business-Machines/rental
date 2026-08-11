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
  Info,
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
import { GuestVerificationGate } from "@/components/GuestVerificationGate";
import {
  useBookingRequest,
  useApproveBookingRequest,
  useRejectBookingRequest,
  useCancelBookingRequest,
} from "@/hooks/useBookingRequests";
import {
  cn,
  formatPrice,
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
  const guest = bookingRequest.guest;
  const guestName = `${guest.firstName} ${guest.lastName}`;
  const isNationalId = guest.idType === "national_id";

  const isPending = bookingRequest.status === "pending";
  const isAgent = userRole === "agent";
  const canApproveReject = userRole === "superAdmin" && isPending;
  const isAdminViewOnly = userRole === "admin" && isPending;
  const canCancel = isAgent && isPending;

  const isGuestPending = guest.verificationStatus === "pending";
  const isGuestVerified = guest.verificationStatus === "verified";
  const isGuestRejected = guest.verificationStatus === "rejected";

  const status = bookingRequest.status;

  const identifier = isNationalId ? guest.idNumber : guest.passportNumber;
  const maskedID =
    identifier === null || identifier === undefined
      ? "None"
      : maskIdNumber(identifier as string, userRole);

  // Calculate pricing details
  const totalNights = calculateTotalNights(
    bookingRequest.priceDuration as PriceDuration,
    bookingRequest.period,
  );

  const subtotal = bookingRequest.unitPrice * bookingRequest.period;

  const originalUnitPrice = hasDiscount(bookingRequest.discountRate)
    ? bookingRequest.unitPrice / (1 - bookingRequest.discountRate!)
    : bookingRequest.unitPrice;

  const originalSubtotal = originalUnitPrice * bookingRequest.period;
  const discountAmount = originalSubtotal - subtotal;

  // Determine which ID images to show
  const hasIdImages = isNationalId
    ? guest.idFrontUrl && guest.idBackUrl
    : guest.passportUrl;

  return (
    <div className="container w-full py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer bg-primary py-2 px-4"
            onClick={() => router.push("/booking-requests")}
          >
            <ArrowLeft className="size-5 text-white" />
          </Button>
          <div>
            <h1 className="text-lg md:text-2xl font-bold">
              View Booking Request Details
            </h1>
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
          <span>Request {status}</span>
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
              <User className="size-5 hidden md:inline-flex" />
              Guest Information
              <Badge
                className={cn(
                  "py-[1px] px-4 rounded-md capitalize border text-white ml-auto",
                  guest.verificationStatus === "pending" &&
                    "border-princeton-orange bg-princeton-orange",
                  guest.verificationStatus === "verified" &&
                    "border-medium-jungle bg-medium-jungle",
                  guest.verificationStatus === "rejected" &&
                    "border-lipstick-red bg-lipstick-red",
                )}
              >
                {guest.verificationStatus === "pending"
                  ? "Pending Verification"
                  : guest.verificationStatus}
              </Badge>
            </CardTitle>
            <CardDescription>Guest details for this booking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <User className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium capitalize">{guestName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">
                    {maskEmail(guest.email, userRole)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">
                    {maskPhone(guest.phone, userRole)}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Cake className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">
                    {guest.dateOfBirth
                      ? format(new Date(guest.dateOfBirth), "PPP")
                      : "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Nationality</p>
                  <p className="font-medium">{guest.nationality || "-"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <IdCard className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">ID Type</p>
                  <p className="font-medium">
                    {isNationalId ? "National ID" : "Passport"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <IdCard className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isNationalId ? "National ID Number" : "Passport Number"}
                  </p>
                  <p className="font-medium">{maskedID}</p>
                </div>
              </div>

              {guest.notes && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <MessageSquare className="size-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="text-sm">{guest.notes}</p>
                    </div>
                  </div>
                </>
              )}

              {/* Link to guest profile */}
              {userRole !== "agent" && (
                <>
                  <Separator />
                  <Link
                    href={`/guests/${guest.id}`}
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

        {/* ID Document Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IdCard className="size-5" />
              {isNationalId ? "National ID Images" : "Passport Image"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasIdImages ? (
              isNationalId ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">
                      Front
                    </p>
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border bg-muted">
                      <Image
                        src={guest.idFrontUrl!}
                        alt="National ID Front"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">
                      Back
                    </p>
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border bg-muted">
                      <Image
                        src={guest.idBackUrl!}
                        alt="National ID Back"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border bg-muted">
                  <Image
                    src={guest.passportUrl!}
                    alt="Passport"
                    fill
                    className="object-contain"
                  />
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <FileText className="size-12 mb-2 opacity-50" />
                <p>Document not available</p>
              </div>
            )}
          </CardContent>
        </Card>

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
      {(canApproveReject || canCancel || isAdminViewOnly) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Request Actions
            </CardTitle>
            <CardDescription>
              {isAgent
                ? "You can cancel the request and provide a valid reason."
                : !canApproveReject
                  ? "This request requires super admin review."
                  : isGuestPending
                    ? "Review the guest's identity above, then verify or reject them below before you can act on this request."
                    : isGuestRejected
                      ? "This guest's identity was rejected, so this request can only be rejected."
                      : "You can either approve or reject this booking request."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {canApproveReject && isGuestPending && (
              <GuestVerificationGate requestId={bookingRequest.id} guest={guest} />
            )}
            {canApproveReject && isGuestVerified && (
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
            {canApproveReject && isGuestRejected && (
              <Button
                variant="destructive"
                onClick={() => setRejectDialogOpen(true)}
                className="cursor-pointer w-full md:w-4/12"
              >
                <XCircle className="size-5 mr-2" />
                Reject Request
              </Button>
            )}
            {isAdminViewOnly && (
              <div className="w-full flex items-start gap-3 p-4 rounded-lg bg-muted border">
                <Info className="size-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">
                    Super admin approval required
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Only super administrators can approve or reject booking
                    requests. Please contact a super admin to review this
                    request.
                  </p>
                </div>
              </div>
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
            guestName={`${guest.firstName} ${guest.lastName}`}
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
