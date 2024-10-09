-- AlterTable
ALTER TABLE "action_logs" ADD COLUMN     "targetId" INTEGER;

-- AddForeignKey
ALTER TABLE "action_logs" ADD CONSTRAINT "action_logs_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
