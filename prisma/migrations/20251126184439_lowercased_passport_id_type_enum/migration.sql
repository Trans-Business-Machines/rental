/*
  Warnings:

  - The values [Passport] on the enum `IdType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."IdType_new" AS ENUM ('national_id', 'passport');
ALTER TABLE "public"."guests" ALTER COLUMN "idType" DROP DEFAULT;
ALTER TABLE "public"."guests" ALTER COLUMN "idType" TYPE "public"."IdType_new" USING ("idType"::text::"public"."IdType_new");
ALTER TYPE "public"."IdType" RENAME TO "IdType_old";
ALTER TYPE "public"."IdType_new" RENAME TO "IdType";
DROP TYPE "public"."IdType_old";
ALTER TABLE "public"."guests" ALTER COLUMN "idType" SET DEFAULT 'national_id';
COMMIT;
