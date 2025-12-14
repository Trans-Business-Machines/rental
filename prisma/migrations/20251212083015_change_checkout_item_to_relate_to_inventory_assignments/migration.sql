/*
  Warnings:

  - You are about to drop the column `inventoryItemId` on the `checkout_items` table. All the data in the column will be lost.
  - The `condition` column on the `checkout_items` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `inventoryAssignmentId` to the `checkout_items` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."CheckoutItemStatus" AS ENUM ('good', 'damaged', 'missing');

-- DropForeignKey
ALTER TABLE "public"."checkout_items" DROP CONSTRAINT "checkout_items_inventoryItemId_fkey";

-- AlterTable
ALTER TABLE "public"."checkout_items" DROP COLUMN "inventoryItemId",
ADD COLUMN     "inventoryAssignmentId" INTEGER NOT NULL,
DROP COLUMN "condition",
ADD COLUMN     "condition" "public"."CheckoutItemStatus" NOT NULL DEFAULT 'good';

-- AddForeignKey
ALTER TABLE "public"."checkout_items" ADD CONSTRAINT "checkout_items_inventoryAssignmentId_fkey" FOREIGN KEY ("inventoryAssignmentId") REFERENCES "public"."inventory_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
