/*
  Warnings:

  - You are about to drop the column `hours` on the `unit_type_pricing` table. All the data in the column will be lost.
  - Made the column `nights` on table `unit_type_pricing` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."unit_type_pricing" DROP COLUMN "hours",
ALTER COLUMN "nights" SET NOT NULL;
