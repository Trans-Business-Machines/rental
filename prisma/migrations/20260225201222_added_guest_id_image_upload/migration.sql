/*
  Warnings:

  - A unique constraint covering the columns `[guestId]` on the table `media` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."media" ADD COLUMN     "guestId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "media_guestId_key" ON "public"."media"("guestId");

-- AddForeignKey
ALTER TABLE "public"."media" ADD CONSTRAINT "media_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "public"."guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
