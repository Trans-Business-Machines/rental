/*
  Warnings:

  - You are about to drop the column `depositDeduction` on the `checkout_reports` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."checkout_reports" DROP COLUMN "depositDeduction";

-- AlterTable
ALTER TABLE "public"."payment_settings" ADD COLUMN     "notes" TEXT;
