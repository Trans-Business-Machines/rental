-- DropIndex
DROP INDEX "public"."booking_requests_paymentCode_key";

-- AlterTable
ALTER TABLE "public"."booking_requests" ADD COLUMN     "cancelReason" TEXT;
