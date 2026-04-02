/*
  Warnings:

  - A unique constraint covering the columns `[paymentCode]` on the table `booking_requests` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paymentCode]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "booking_requests_paymentCode_key" ON "public"."booking_requests"("paymentCode");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_paymentCode_key" ON "public"."bookings"("paymentCode");
