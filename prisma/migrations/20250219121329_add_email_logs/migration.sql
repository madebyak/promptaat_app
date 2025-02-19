-- AlterTable
ALTER TABLE "saved_prompts" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "verification_code" TEXT,
ADD COLUMN     "verification_code_expires" TIMESTAMP(3),
ALTER COLUMN "last_email_sent_at" SET DATA TYPE TIMESTAMP(3);

-- CreateTable
CREATE TABLE "email_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "email_logs_user_id_created_at_idx" ON "email_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "email_logs_type_created_at_idx" ON "email_logs"("type", "created_at");

-- AddForeignKey
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
