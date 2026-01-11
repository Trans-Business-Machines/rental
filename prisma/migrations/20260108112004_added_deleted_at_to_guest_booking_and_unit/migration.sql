-- AlterTable
ALTER TABLE "public"."bookings" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."guests" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."units" ADD COLUMN     "deletedAt" TIMESTAMP(3);
