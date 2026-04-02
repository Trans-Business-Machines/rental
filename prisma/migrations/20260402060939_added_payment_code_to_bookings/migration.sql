/*
  Warnings:

  - Added the required column `paymentCode` to the `booking_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMethod` to the `booking_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentCode` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Made the column `paymentMethod` on table `bookings` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."booking_requests" ADD COLUMN     "paymentCode" TEXT NOT NULL,
ADD COLUMN     "paymentMethod" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."bookings" ADD COLUMN     "paymentCode" TEXT NOT NULL,
ALTER COLUMN "paymentMethod" SET NOT NULL;
