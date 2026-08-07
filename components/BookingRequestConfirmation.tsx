"use client";

import { format } from "date-fns";
import {
  User,
  Mail,
  Phone,
  Cake,
  Globe,
  IdCard,
  MessageSquare,
  Building2,
  DoorOpen,
  Calendar,
  Clock,
  Users,
  Target,
  CreditCard,
  FileText,
  UserCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  formatPrice,
  formatDiscount,
  hasDiscount,
  getDurationLabel,
  calculateTotalNights,
  calculateVAT,
} from "@/lib/utils";
import type { BookingRequestFormData } from "@/lib/schemas/booking-requests";
import type {
  PriceDuration,
  UnitTypePricing,
  GuestSearchResult,
} from "@/lib/types/types";

interface BookingRequestConfirmationProps {
  guestType: "existing" | "new";
  selectedGuest: GuestSearchResult | null;
  formData: BookingRequestFormData;
  frontImagePreview: string | null;
  backImagePreview: string | null;
  passportImagePreview: string | null;
  selectedPricing: UnitTypePricing | null;
  period: number;
  propertyName: string;
  unitName: string;
  savings: number;
  paymentCode: string;
}

export function BookingRequestConfirmation({
  guestType,
  selectedGuest,
  formData,
  frontImagePreview,
  backImagePreview,
  passportImagePreview,
  selectedPricing,
  period,
  propertyName,
  unitName,
  savings,
  paymentCode,
}: BookingRequestConfirmationProps) {
  const isCustomDuration = selectedPricing?.duration === "custom";

  const totalNights = isCustomDuration
    ? period
    : calculateTotalNights(
        formData.priceDuration as PriceDuration,
        period,
        selectedPricing?.fromDate,
        selectedPricing?.toDate,
      );

  const guestName =
    guestType === "existing" && selectedGuest
      ? `${selectedGuest.firstName} ${selectedGuest.lastName}`
      : `${formData.guestFirstName} ${formData.guestLastName}`;

  const guestEmail =
    guestType === "existing" && selectedGuest
      ? selectedGuest.email
      : formData.guestEmail;

  const guestPhone =
    guestType === "existing" && selectedGuest
      ? selectedGuest.phone
      : formData.guestPhone;

  const isNationalId = formData.guestIdType === "national_id";
  const hasImages = isNationalId
    ? frontImagePreview && backImagePreview
    : passportImagePreview;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Review Your Booking Request</h2>
        <p className="text-sm text-muted-foreground">
          Please review all details before submitting. You can go back to make
          changes if needed.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Guest Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="size-4 text-primary" />
              Guest Information
              {guestType === "existing" && (
                <Badge
                  variant="secondary"
                  className="ml-auto border-medium-jungle bg-medium-jungle text-white"
                >
                  <UserCheck className="size-3 mr-1" />
                  Existing Guest
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <User className="size-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Full Name</p>
                <p className="font-medium">{guestName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="size-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">{guestEmail}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="size-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium">{guestPhone}</p>
              </div>
            </div>

            {guestType === "new" && (
              <>
                <Separator />

                <div className="flex items-start gap-3">
                  <Cake className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Date of Birth
                    </p>
                    <p className="font-medium">
                      {formData.guestDateOfBirth
                        ? format(new Date(formData.guestDateOfBirth), "PPP")
                        : "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Globe className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Nationality</p>
                    <p className="font-medium">
                      {formData.guestNationality || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <IdCard className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {isNationalId ? "National ID Number" : "Passport Number"}
                    </p>
                    <p className="font-medium">
                      {formData.guestIdNumber ||
                        formData.guestPassportNumber ||
                        "-"}
                    </p>
                  </div>
                </div>

                {formData.guestNotes && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <MessageSquare className="size-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Notes</p>
                        <p className="text-sm">{formData.guestNotes}</p>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* ID Document / Existing Guest Card */}
        {guestType === "new" ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="size-4 text-primary" />
                {isNationalId ? "National ID Images" : "Passport Image"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasImages ? (
                isNationalId ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <p className="text-sm font-medium text-muted-foreground">
                        Front
                      </p>
                      <div className="relative h-10/12  w-full overflow-hidden rounded-lg border bg-muted">
                        <img
                          src={frontImagePreview!}
                          alt="National ID Front"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-sm font-medium text-muted-foreground">
                        Back
                      </p>
                      <div className="relative h-10/12  w-full overflow-hidden rounded-lg border bg-muted">
                        <img
                          src={backImagePreview!}
                          alt="National ID Back"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border bg-muted">
                    <img
                      src={passportImagePreview!}
                      alt="Passport"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <FileText className="size-12 mb-2 opacity-50" />
                  <p>No document uploaded</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <UserCheck className="size-4 text-primary" />
                Existing Guest
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <UserCheck className="size-8 text-primary" />
                </div>
                <p className="font-medium text-lg">{guestName}</p>
                <p className="text-sm text-muted-foreground">{guestEmail}</p>
                <p className="text-sm text-muted-foreground">{guestPhone}</p>
                <p className="text-xs text-muted-foreground mt-4">
                  This guest is already registered in the system. Their ID
                  document is on file.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Property & Unit */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="size-4 text-primary" />
              Property & Unit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Building2 className="size-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Property</p>
                <p className="font-medium">{propertyName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DoorOpen className="size-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Unit</p>
                <p className="font-medium">{unitName}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <Calendar className="size-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Check-in</p>
                <p className="font-medium">
                  {formData.checkInDate
                    ? format(new Date(formData.checkInDate), "EEE, MMM d, yyyy")
                    : "-"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="size-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Check-out</p>
                <p className="font-medium">
                  {formData.checkOutDate
                    ? format(
                        new Date(formData.checkOutDate),
                        "EEE, MMM d, yyyy 'at' h:mm a",
                      )
                    : "-"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="size-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="font-medium">
                  {totalNights} night{totalNights !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="size-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Guests</p>
                <p className="font-medium">
                  {formData.numberOfGuests} guest
                  {formData.numberOfGuests !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {formData.purpose && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <Target className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Purpose of Stay
                    </p>
                    <p className="font-medium capitalize">{formData.purpose}</p>
                  </div>
                </div>
              </>
            )}

            {formData.specialRequests && (
              <div className="flex items-start gap-3">
                <MessageSquare className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Special Requests
                  </p>
                  <p className="text-sm">{formData.specialRequests}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="size-4 text-primary" />
              Pricing Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rate Type</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {getDurationLabel(formData.priceDuration)}
                  </span>
                  {hasDiscount(selectedPricing?.discountRate) && (
                    <Badge
                      variant="secondary"
                      className="text-xs text-green-600 bg-green-100"
                    >
                      {formatDiscount(selectedPricing?.discountRate)}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Unit Price</span>
                <div className="text-right">
                  {hasDiscount(selectedPricing?.discountRate) && (
                    <span className="text-xs text-muted-foreground line-through mr-2">
                      {formatPrice(selectedPricing?.price || 0)}
                    </span>
                  )}
                  <span className="font-medium">
                    {formatPrice(formData.unitPrice || 0)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">
                  &times; {totalNights} {totalNights === 1 ? "night" : "nights"}
                </span>
              </div>

              {hasDiscount(selectedPricing?.discountRate) && savings > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>You Save</span>
                  <span className="font-medium">-{formatPrice(savings)}</span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {formatPrice((formData.unitPrice || 0) * period)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">VAT (16%)</span>
                <span className="font-medium">
                  {formatPrice(
                    calculateVAT((formData.unitPrice || 0) * period),
                  )}
                </span>
              </div>

              <Separator />

              <div className="flex justify-between items-center pt-2 text-sm md:text-xl">
                <span className="font-semibold">Total Amount (incl. VAT)</span>
                <span className="font-bold text-primary">
                  {formatPrice(formData.totalAmount || 0)}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 text-base font-medium">
                <span>Payment Code</span>
                <span className="text-primary">{paymentCode}</span>
              </div>

              <div className="flex justify-between items-center pt-2 text-base font-medium">
                <span>Payment Method</span>
                <span className="text-primary capitalize">
                  {formData.paymentMethod === "mpesa_till"
                    ? "Mpesa Paybill"
                    : formData.paymentMethod.replace("_", " ")}
                </span>
              </div>
            </div>

            <div className="p-5 rounded-lg bg-azure/20 border border-azure">
              <p className="text-xs text-azure">
                By submitting this request, you confirm that all details are
                accurate. An administrator will review and approve or reject
                this booking request.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
