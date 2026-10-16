-- AlterTable
ALTER TABLE "public"."inventory_assignments" ADD COLUMN     "writtenOffQuantity" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- Before this column, a write-off was implied: whatever a closed
-- assignment never got back. Make that explicit so old rows read the same.
UPDATE "public"."inventory_assignments"
SET "writtenOffQuantity" = quantity - "returnedQuantity"
WHERE status = 'closed' AND "returnedQuantity" < quantity;

-- Returned and written off together can't exceed what was sent out.
-- Same constraint name so handleError's message mapping still matches.
ALTER TABLE "public"."inventory_assignments"
  DROP CONSTRAINT chk_returned_not_exceeding;

ALTER TABLE "public"."inventory_assignments"
  ADD CONSTRAINT chk_returned_not_exceeding
  CHECK (
    "returnedQuantity" >= 0
    AND "writtenOffQuantity" >= 0
    AND "returnedQuantity" + "writtenOffQuantity" <= quantity
  );
