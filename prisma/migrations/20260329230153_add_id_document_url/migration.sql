/*
  Warnings:

  - Added the required column `idDocumentUrl` to the `booking_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."booking_requests" ADD COLUMN     "idDocumentUrl" TEXT NOT NULL;
