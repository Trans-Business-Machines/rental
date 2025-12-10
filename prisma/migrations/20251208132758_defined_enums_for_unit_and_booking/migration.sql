/*
  Warnings:

  - The `status` column on the `bookings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `units` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."Unit_Status" AS ENUM ('booked', 'reserved', 'maintenance', 'available', 'occupied');

-- CreateEnum
CREATE TYPE "public"."Booking_Status" AS ENUM ('pending', 'reserved', 'checked_in', 'checked_out', 'cancelled');

-- AlterTable
ALTER TABLE "public"."bookings" DROP COLUMN "status",
ADD COLUMN     "status" "public"."Booking_Status" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "public"."units" DROP COLUMN "status",
ADD COLUMN     "status" "public"."Unit_Status" NOT NULL DEFAULT 'available';
