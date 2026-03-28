-- AlterTable
ALTER TABLE "keyword_automations" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "keyword_automations_userId_idx" ON "keyword_automations"("userId");

-- AddForeignKey
ALTER TABLE "keyword_automations" ADD CONSTRAINT "keyword_automations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
