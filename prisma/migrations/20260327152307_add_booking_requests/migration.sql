-- CreateEnum
CREATE TYPE "public"."BookingRequestStatus" AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

-- AlterTable
ALTER TABLE "public"."bookings" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedById" TEXT,
ADD COLUMN     "requestedById" TEXT;

-- CreateTable
CREATE TABLE "public"."booking_requests" (
    "id" SERIAL NOT NULL,
    "requestedById" TEXT NOT NULL,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "status" "public"."BookingRequestStatus" NOT NULL DEFAULT 'pending',
    "rejectionReason" TEXT,
    "guestFirstName" TEXT NOT NULL,
    "guestLastName" TEXT NOT NULL,
    "guestEmail" TEXT NOT NULL,
    "guestPhone" TEXT NOT NULL,
    "guestDateOfBirth" TEXT NOT NULL,
    "guestNationality" TEXT NOT NULL,
    "guestIdType" "public"."IdType" NOT NULL DEFAULT 'national_id',
    "guestIdNumber" TEXT,
    "guestPassportNumber" TEXT,
    "guestNotes" TEXT,
    "idDocumentFilename" TEXT NOT NULL,
    "idDocumentOriginalName" TEXT NOT NULL,
    "idDocumentMimeType" TEXT NOT NULL,
    "idDocumentFileSize" INTEGER NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "unitId" INTEGER NOT NULL,
    "checkInDate" TIMESTAMP(3) NOT NULL,
    "checkOutDate" TIMESTAMP(3) NOT NULL,
    "numberOfGuests" INTEGER NOT NULL,
    "priceDuration" "public"."PriceDuration" NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "period" INTEGER NOT NULL DEFAULT 1,
    "discountRate" DOUBLE PRECISION,
    "totalAmount" INTEGER NOT NULL,
    "purpose" TEXT,
    "specialRequests" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."booking_requests" ADD CONSTRAINT "booking_requests_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."booking_requests" ADD CONSTRAINT "booking_requests_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."booking_requests" ADD CONSTRAINT "booking_requests_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."booking_requests" ADD CONSTRAINT "booking_requests_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
