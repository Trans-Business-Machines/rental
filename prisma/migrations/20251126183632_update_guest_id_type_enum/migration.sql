/*
  Warnings:

  - The `idType` column on the `guests` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `nationality` on table `guests` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dateOfBirth` on table `guests` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."IdType" AS ENUM ('national_id', 'Passport');

-- AlterTable
ALTER TABLE "public"."guests" ALTER COLUMN "nationality" SET NOT NULL,
DROP COLUMN "idType",
ADD COLUMN     "idType" "public"."IdType" NOT NULL DEFAULT 'national_id',
ALTER COLUMN "dateOfBirth" SET NOT NULL;
