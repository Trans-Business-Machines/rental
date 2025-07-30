/*
  Warnings:

  - You are about to drop the column `condition` on the `inventory_items` table. All the data in the column will be lost.
  - You are about to drop the column `lastInspected` on the `inventory_items` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `inventory_items` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `inventory_items` table. All the data in the column will be lost.
  - You are about to drop the column `propertyId` on the `inventory_items` table. All the data in the column will be lost.
  - You are about to drop the column `purchaseDate` on the `inventory_items` table. All the data in the column will be lost.
  - You are about to drop the column `serialNumber` on the `inventory_items` table. All the data in the column will be lost.
  - You are about to drop the column `unitId` on the `inventory_items` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "inventory_items" DROP CONSTRAINT "inventory_items_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "inventory_items" DROP CONSTRAINT "inventory_items_unitId_fkey";

-- AlterTable
ALTER TABLE "inventory_items" DROP COLUMN "condition",
DROP COLUMN "lastInspected",
DROP COLUMN "location",
DROP COLUMN "notes",
DROP COLUMN "propertyId",
DROP COLUMN "purchaseDate",
DROP COLUMN "serialNumber",
DROP COLUMN "unitId";
