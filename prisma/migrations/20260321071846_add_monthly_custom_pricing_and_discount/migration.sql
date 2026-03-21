-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."PriceDuration" ADD VALUE 'monthly';
ALTER TYPE "public"."PriceDuration" ADD VALUE 'custom';

-- DropIndex
DROP INDEX "public"."unit_type_pricing_unitType_duration_key";

-- AlterTable
ALTER TABLE "public"."bookings" ADD COLUMN     "discountRate" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."unit_type_pricing" ADD COLUMN     "discountRate" DOUBLE PRECISION,
ADD COLUMN     "fromDate" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "toDate" TIMESTAMP(3),
ALTER COLUMN "nights" DROP NOT NULL;
