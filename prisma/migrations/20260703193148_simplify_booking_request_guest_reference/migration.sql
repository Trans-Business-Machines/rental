/*
  Warnings:

  - You are about to drop the column `existingGuestId` on the `booking_requests` table. All the data in the column will be lost.
  - You are about to drop the column `guestDateOfBirth` on the `booking_requests` table. All the data in the column will be lost.
  - You are about to drop the column `guestEmail` on the `booking_requests` table. All the data in the column will be lost.
  - You are about to drop the column `guestFirstName` on the `booking_requests` table. All the data in the column will be lost.
  - You are about to drop the column `guestIdNumber` on the `booking_requests` table. All the data in the column will be lost.
  - You are about to drop the column `guestIdType` on the `booking_requests` table. All the data in the column will be lost.
  - You are about to drop the column `guestLastName` on the `booking_requests` table. All the data in the column will be lost.
  - You are about to drop the column `guestNationality` on the `booking_requests` table. All the data in the column will be lost.
  - You are about to drop the column `guestNotes` on the `booking_requests` table. All the data in the column will be lost.
  - You are about to drop the column `guestPassportNumber` on the `booking_requests` table. All the data in the column will be lost.
  - You are about to drop the column `guestPhone` on the `booking_requests` table. All the data in the column will be lost.
  - You are about to drop the column `idDocumentFileSize` on the `booking_requests` table. All the data in the column will be lost.
  - You are about to drop the column `idDocumentFilename` on the `booking_requests` table. All the data in the column will be lost.
  - You are about to drop the column `idDocumentMimeType` on the `booking_requests` table. All the data in the column will be lost.
  - You are about to drop the column `idDocumentOriginalName` on the `booking_requests` table. All the data in the column will be lost.
  - You are about to drop the column `idDocumentUrl` on the `booking_requests` table. All the data in the column will be lost.
  - Added the required column `guestId` to the `booking_requests` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."booking_requests" DROP CONSTRAINT "booking_requests_existingGuestId_fkey";

-- DropIndex
DROP INDEX "public"."booking_requests_existingGuestId_idx";

-- DropIndex
DROP INDEX "public"."booking_requests_guestEmail_key";

-- AlterTable
ALTER TABLE "public"."booking_requests" DROP COLUMN "existingGuestId",
DROP COLUMN "guestDateOfBirth",
DROP COLUMN "guestEmail",
DROP COLUMN "guestFirstName",
DROP COLUMN "guestIdNumber",
DROP COLUMN "guestIdType",
DROP COLUMN "guestLastName",
DROP COLUMN "guestNationality",
DROP COLUMN "guestNotes",
DROP COLUMN "guestPassportNumber",
DROP COLUMN "guestPhone",
DROP COLUMN "idDocumentFileSize",
DROP COLUMN "idDocumentFilename",
DROP COLUMN "idDocumentMimeType",
DROP COLUMN "idDocumentOriginalName",
DROP COLUMN "idDocumentUrl",
ADD COLUMN     "guestId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."guests" ADD COLUMN     "idNumber" TEXT,
ADD COLUMN     "passportNumber" TEXT;

-- AddForeignKey
ALTER TABLE "public"."booking_requests" ADD CONSTRAINT "booking_requests_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "public"."guests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
