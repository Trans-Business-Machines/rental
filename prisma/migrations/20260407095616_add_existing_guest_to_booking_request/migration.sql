-- AlterTable
ALTER TABLE "public"."booking_requests" ADD COLUMN     "existingGuestId" INTEGER,
ALTER COLUMN "guestFirstName" DROP NOT NULL,
ALTER COLUMN "guestLastName" DROP NOT NULL,
ALTER COLUMN "guestEmail" DROP NOT NULL,
ALTER COLUMN "guestPhone" DROP NOT NULL,
ALTER COLUMN "guestDateOfBirth" DROP NOT NULL,
ALTER COLUMN "guestNationality" DROP NOT NULL,
ALTER COLUMN "guestIdType" DROP NOT NULL,
ALTER COLUMN "guestIdType" DROP DEFAULT,
ALTER COLUMN "idDocumentFilename" DROP NOT NULL,
ALTER COLUMN "idDocumentOriginalName" DROP NOT NULL,
ALTER COLUMN "idDocumentMimeType" DROP NOT NULL,
ALTER COLUMN "idDocumentFileSize" DROP NOT NULL,
ALTER COLUMN "idDocumentUrl" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "booking_requests_existingGuestId_idx" ON "public"."booking_requests"("existingGuestId");

-- AddForeignKey
ALTER TABLE "public"."booking_requests" ADD CONSTRAINT "booking_requests_existingGuestId_fkey" FOREIGN KEY ("existingGuestId") REFERENCES "public"."guests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
