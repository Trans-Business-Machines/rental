/*
  Warnings:

  - You are about to drop the column `entityId` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `entityType` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `key` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `media` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[filename]` on the table `media` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `filePath` to the `media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileSize` to the `media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filename` to the `media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalName` to the `media` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."media" DROP COLUMN "entityId",
DROP COLUMN "entityType",
DROP COLUMN "key",
DROP COLUMN "size",
DROP COLUMN "type",
DROP COLUMN "url",
ADD COLUMN     "filePath" TEXT NOT NULL,
ADD COLUMN     "fileSize" INTEGER NOT NULL,
ADD COLUMN     "filename" TEXT NOT NULL,
ADD COLUMN     "mimeType" TEXT NOT NULL,
ADD COLUMN     "originalName" TEXT NOT NULL,
ADD COLUMN     "propertyId" INTEGER,
ADD COLUMN     "unitId" INTEGER,
ADD COLUMN     "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."properties" ADD COLUMN     "maxBathrooms" INTEGER,
ADD COLUMN     "maxBedrooms" INTEGER;

-- AlterTable
ALTER TABLE "public"."units" ADD COLUMN     "bathrooms" INTEGER,
ADD COLUMN     "maxGuests" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "media_filename_key" ON "public"."media"("filename");

-- CreateIndex
CREATE INDEX "media_propertyId_idx" ON "public"."media"("propertyId");

-- CreateIndex
CREATE INDEX "media_unitId_idx" ON "public"."media"("unitId");

-- AddForeignKey
ALTER TABLE "public"."media" ADD CONSTRAINT "media_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."media" ADD CONSTRAINT "media_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."units"("id") ON DELETE CASCADE ON UPDATE CASCADE;
