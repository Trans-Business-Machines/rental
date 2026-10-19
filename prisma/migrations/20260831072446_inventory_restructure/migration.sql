/*
  Warnings:

  - The values [custom] on the enum `PriceDuration` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `inventory_assignments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `isActive` on the `inventory_assignments` table. All the data in the column will be lost.
  - You are about to drop the column `propertyId` on the `inventory_assignments` table. All the data in the column will be lost.
  - The primary key for the `inventory_items` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `assignableOnBooking` on the `inventory_items` table. All the data in the column will be lost.
  - You are about to drop the column `currentValue` on the `inventory_items` table. All the data in the column will be lost.
  - You are about to drop the column `purchasePrice` on the `inventory_items` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `inventory_items` table. All the data in the column will be lost.
  - You are about to drop the column `supplier` on the `inventory_items` table. All the data in the column will be lost.
  - You are about to drop the column `warrantyExpiry` on the `inventory_items` table. All the data in the column will be lost.
  - The `status` column on the `inventory_items` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `checkout_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `inventory_movements` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[propertyId,itemName]` on the table `inventory_items` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `assignedById` to the `inventory_assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `inventory_assignments` table without a default value. This is not possible if the table is not empty.
  - Made the column `unitId` on table `inventory_assignments` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `propertyId` to the `inventory_items` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `category` on the `inventory_items` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."InventoryCategory" AS ENUM ('electronics', 'furniture', 'bedroom', 'cutlery', 'linens', 'kitchen_consumables', 'laundry', 'house_keeping', 'office');

-- CreateEnum
CREATE TYPE "public"."UnitOfMeasure" AS ENUM ('pieces', 'pairs', 'sets', 'kg', 'litres', 'sachets', 'packets', 'bottles', 'rolls');

-- CreateEnum
CREATE TYPE "public"."InventoryItemStatus" AS ENUM ('active', 'discontinued');

-- CreateEnum
CREATE TYPE "public"."AssignmentStatus" AS ENUM ('active', 'issued', 'partial', 'closed');

-- CreateEnum
CREATE TYPE "public"."IssueType" AS ENUM ('damaged', 'missing', 'worn_out');

-- CreateEnum
CREATE TYPE "public"."IssueResolution" AS ENUM ('pending', 'repair', 'replace', 'discard');

-- CreateEnum
CREATE TYPE "public"."IssueStatus" AS ENUM ('open', 'resolved');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."PriceDuration_new" AS ENUM ('one_night', 'weekly', 'monthly');
ALTER TABLE "public"."bookings" ALTER COLUMN "priceDuration" DROP DEFAULT;
ALTER TABLE "public"."bookings" ALTER COLUMN "priceDuration" TYPE "public"."PriceDuration_new" USING ("priceDuration"::text::"public"."PriceDuration_new");
ALTER TABLE "public"."unit_type_pricing" ALTER COLUMN "duration" TYPE "public"."PriceDuration_new" USING ("duration"::text::"public"."PriceDuration_new");
ALTER TABLE "public"."booking_requests" ALTER COLUMN "priceDuration" TYPE "public"."PriceDuration_new" USING ("priceDuration"::text::"public"."PriceDuration_new");
ALTER TYPE "public"."PriceDuration" RENAME TO "PriceDuration_old";
ALTER TYPE "public"."PriceDuration_new" RENAME TO "PriceDuration";
DROP TYPE "public"."PriceDuration_old";
ALTER TABLE "public"."bookings" ALTER COLUMN "priceDuration" SET DEFAULT 'one_night';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."checkout_items" DROP CONSTRAINT "checkout_items_checkoutReportId_fkey";

-- DropForeignKey
ALTER TABLE "public"."checkout_items" DROP CONSTRAINT "checkout_items_inventoryAssignmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."inventory_assignments" DROP CONSTRAINT "inventory_assignments_inventoryItemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."inventory_assignments" DROP CONSTRAINT "inventory_assignments_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."inventory_assignments" DROP CONSTRAINT "inventory_assignments_unitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."inventory_movements" DROP CONSTRAINT "inventory_movements_fromUnitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."inventory_movements" DROP CONSTRAINT "inventory_movements_inventoryItemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."inventory_movements" DROP CONSTRAINT "inventory_movements_toUnitId_fkey";

-- AlterTable
ALTER TABLE "public"."inventory_assignments" DROP CONSTRAINT "inventory_assignments_pkey",
DROP COLUMN "isActive",
DROP COLUMN "propertyId",
ADD COLUMN     "assignedById" TEXT NOT NULL,
ADD COLUMN     "quantity" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "returnedQuantity" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "status" "public"."AssignmentStatus" NOT NULL DEFAULT 'active',
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "inventoryItemId" SET DATA TYPE TEXT,
ALTER COLUMN "unitId" SET NOT NULL,
ADD CONSTRAINT "inventory_assignments_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "inventory_assignments_id_seq";

-- AlterTable
ALTER TABLE "public"."inventory_items" DROP CONSTRAINT "inventory_items_pkey",
DROP COLUMN "assignableOnBooking",
DROP COLUMN "currentValue",
DROP COLUMN "purchasePrice",
DROP COLUMN "quantity",
DROP COLUMN "supplier",
DROP COLUMN "warrantyExpiry",
ADD COLUMN     "availableQuantity" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "propertyId" INTEGER NOT NULL,
ADD COLUMN     "restockAt" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "unitCost" INTEGER,
ADD COLUMN     "unitOfMeasure" "public"."UnitOfMeasure" NOT NULL DEFAULT 'pieces',
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
DROP COLUMN "category",
ADD COLUMN     "category" "public"."InventoryCategory" NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "public"."InventoryItemStatus" NOT NULL DEFAULT 'active',
ADD CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "inventory_items_id_seq";

-- DropTable
DROP TABLE "public"."checkout_items";

-- DropTable
DROP TABLE "public"."inventory_movements";

-- DropEnum
DROP TYPE "public"."CheckoutItemStatus";

-- CreateTable
CREATE TABLE "public"."restock_logs" (
    "id" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "quantity" DECIMAL(12,2) NOT NULL,
    "unitCost" INTEGER,
    "receivedById" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "restock_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."item_issues" (
    "id" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "assignmentId" TEXT,
    "issueType" "public"."IssueType" NOT NULL,
    "quantityAffected" DECIMAL(12,2) NOT NULL DEFAULT 1,
    "description" TEXT NOT NULL,
    "reportedById" TEXT NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."IssueStatus" NOT NULL DEFAULT 'open',
    "resolution" "public"."IssueResolution" NOT NULL DEFAULT 'pending',
    "resolutionNotes" TEXT,
    "cost" INTEGER NOT NULL DEFAULT 0,
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."usage_logs" (
    "id" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "quantityUsed" DECIMAL(12,2) NOT NULL,
    "usedById" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "restock_logs_inventoryItemId_receivedAt_idx" ON "public"."restock_logs"("inventoryItemId", "receivedAt");

-- CreateIndex
CREATE INDEX "restock_logs_receivedById_idx" ON "public"."restock_logs"("receivedById");

-- CreateIndex
CREATE INDEX "item_issues_status_reportedAt_idx" ON "public"."item_issues"("status", "reportedAt");

-- CreateIndex
CREATE INDEX "item_issues_inventoryItemId_reportedAt_idx" ON "public"."item_issues"("inventoryItemId", "reportedAt");

-- CreateIndex
CREATE INDEX "item_issues_assignmentId_idx" ON "public"."item_issues"("assignmentId");

-- CreateIndex
CREATE INDEX "item_issues_reportedById_idx" ON "public"."item_issues"("reportedById");

-- CreateIndex
CREATE INDEX "usage_logs_inventoryItemId_usedAt_idx" ON "public"."usage_logs"("inventoryItemId", "usedAt");

-- CreateIndex
CREATE INDEX "usage_logs_usedById_idx" ON "public"."usage_logs"("usedById");

-- CreateIndex
CREATE INDEX "inventory_assignments_inventoryItemId_status_idx" ON "public"."inventory_assignments"("inventoryItemId", "status");

-- CreateIndex
CREATE INDEX "inventory_assignments_unitId_status_idx" ON "public"."inventory_assignments"("unitId", "status");

-- CreateIndex
CREATE INDEX "inventory_items_propertyId_category_idx" ON "public"."inventory_items"("propertyId", "category");

-- CreateIndex
CREATE INDEX "inventory_items_propertyId_status_idx" ON "public"."inventory_items"("propertyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_propertyId_itemName_key" ON "public"."inventory_items"("propertyId", "itemName");

-- AddForeignKey
ALTER TABLE "public"."inventory_items" ADD CONSTRAINT "inventory_items_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."restock_logs" ADD CONSTRAINT "restock_logs_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "public"."inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."restock_logs" ADD CONSTRAINT "restock_logs_receivedById_fkey" FOREIGN KEY ("receivedById") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_assignments" ADD CONSTRAINT "inventory_assignments_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "public"."inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_assignments" ADD CONSTRAINT "inventory_assignments_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_assignments" ADD CONSTRAINT "inventory_assignments_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."item_issues" ADD CONSTRAINT "item_issues_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "public"."inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."item_issues" ADD CONSTRAINT "item_issues_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "public"."inventory_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."item_issues" ADD CONSTRAINT "item_issues_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."item_issues" ADD CONSTRAINT "item_issues_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usage_logs" ADD CONSTRAINT "usage_logs_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "public"."inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usage_logs" ADD CONSTRAINT "usage_logs_usedById_fkey" FOREIGN KEY ("usedById") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE inventory_items
  ADD CONSTRAINT chk_available_qty_non_negative
  CHECK ("availableQuantity" >= 0);

ALTER TABLE inventory_assignments
  ADD CONSTRAINT chk_returned_not_exceeding
  CHECK ("returnedQuantity" >= 0 AND "returnedQuantity" <= quantity);