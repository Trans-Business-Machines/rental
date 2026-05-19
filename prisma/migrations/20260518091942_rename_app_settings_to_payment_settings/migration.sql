/*
  Warnings:

  - You are about to drop the `app_settings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."app_settings";

-- CreateTable
CREATE TABLE "public"."payment_settings" (
    "id" TEXT NOT NULL,
    "paybillNumber" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_settings_paybillNumber_key" ON "public"."payment_settings"("paybillNumber");

-- CreateIndex
CREATE UNIQUE INDEX "payment_settings_accountNumber_key" ON "public"."payment_settings"("accountNumber");
