-- AlterTable
ALTER TABLE "public"."item_issues" ADD COLUMN     "checkoutReportId" INTEGER;

-- CreateIndex
CREATE INDEX "item_issues_checkoutReportId_idx" ON "public"."item_issues"("checkoutReportId");

-- AddForeignKey
ALTER TABLE "public"."item_issues" ADD CONSTRAINT "item_issues_checkoutReportId_fkey" FOREIGN KEY ("checkoutReportId") REFERENCES "public"."checkout_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

