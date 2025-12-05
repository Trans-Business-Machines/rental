-- AlterTable
ALTER TABLE "public"."bookings" ALTER COLUMN "status" SET DEFAULT 'completed';

-- AlterTable
ALTER TABLE "public"."guests" ALTER COLUMN "verificationStatus" SET DEFAULT 'pending';
