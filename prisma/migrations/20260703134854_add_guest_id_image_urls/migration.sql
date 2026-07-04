/*
  Warnings:

  - You are about to drop the column `idNumber` on the `guests` table. All the data in the column will be lost.
  - You are about to drop the column `passportNumber` on the `guests` table. All the data in the column will be lost.
  - You are about to drop the column `guestId` on the `media` table. All the data in the column will be lost.
  - You are about to drop the `tenants` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."media" DROP CONSTRAINT "media_guestId_fkey";

-- DropForeignKey
ALTER TABLE "public"."tenants" DROP CONSTRAINT "tenants_propertyId_fkey";

-- DropIndex
DROP INDEX "public"."media_guestId_key";

-- AlterTable
ALTER TABLE "public"."guests" DROP COLUMN "idNumber",
DROP COLUMN "passportNumber",
ADD COLUMN     "idBackUrl" TEXT,
ADD COLUMN     "idFrontUrl" TEXT,
ADD COLUMN     "passportUrl" TEXT;

-- AlterTable
ALTER TABLE "public"."media" DROP COLUMN "guestId";

-- DropTable
DROP TABLE "public"."tenants";
