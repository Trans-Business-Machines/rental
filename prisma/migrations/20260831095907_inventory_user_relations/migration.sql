/*
  Warnings:

  - The values [house_keeping] on the enum `InventoryCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."InventoryCategory_new" AS ENUM ('electronics', 'furniture', 'bedroom', 'cutlery', 'linens', 'kitchen_consumables', 'laundry', 'office');
ALTER TABLE "public"."inventory_items" ALTER COLUMN "category" TYPE "public"."InventoryCategory_new" USING ("category"::text::"public"."InventoryCategory_new");
ALTER TYPE "public"."InventoryCategory" RENAME TO "InventoryCategory_old";
ALTER TYPE "public"."InventoryCategory_new" RENAME TO "InventoryCategory";
DROP TYPE "public"."InventoryCategory_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."item_issues" DROP CONSTRAINT "item_issues_resolvedById_fkey";

-- AddForeignKey
ALTER TABLE "public"."item_issues" ADD CONSTRAINT "item_issues_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
