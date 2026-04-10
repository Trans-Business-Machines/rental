/*
  Warnings:

  - The `verificationStatus` column on the `guests` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[guestEmail]` on the table `booking_requests` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `guests` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."Guest_Verification" AS ENUM ('pending', 'verified', 'rejected');

-- AlterTable
ALTER TABLE "public"."guests" ADD COLUMN     "registeredById" TEXT,
DROP COLUMN "verificationStatus",
ADD COLUMN     "verificationStatus" "public"."Guest_Verification" DEFAULT 'pending';

-- CreateIndex
CREATE UNIQUE INDEX "booking_requests_guestEmail_key" ON "public"."booking_requests"("guestEmail");

-- CreateIndex
CREATE UNIQUE INDEX "guests_email_key" ON "public"."guests"("email");

-- AddForeignKey
ALTER TABLE "public"."guests" ADD CONSTRAINT "guests_registeredById_fkey" FOREIGN KEY ("registeredById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
