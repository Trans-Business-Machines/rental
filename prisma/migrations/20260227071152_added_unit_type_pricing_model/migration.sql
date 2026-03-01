/*
  Warnings:

  - You are about to drop the column `rent` on the `units` table. All the data in the column will be lost.
  - Added the required column `unitPrice` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."PriceDuration" AS ENUM ('one_night', 'weekly');

-- AlterTable
ALTER TABLE "public"."bookings" ADD COLUMN     "priceDuration" "public"."PriceDuration" NOT NULL DEFAULT 'one_night',
ADD COLUMN     "unitPrice" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."units" DROP COLUMN "rent";

-- CreateTable
CREATE TABLE "public"."unit_type_pricing" (
    "id" SERIAL NOT NULL,
    "unitType" TEXT NOT NULL,
    "duration" "public"."PriceDuration" NOT NULL,
    "price" INTEGER NOT NULL,
    "hours" INTEGER,
    "nights" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unit_type_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unit_type_pricing_unitType_duration_key" ON "public"."unit_type_pricing"("unitType", "duration");
