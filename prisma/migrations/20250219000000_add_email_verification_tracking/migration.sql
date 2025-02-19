-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verification_attempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_email_sent_at" TIMESTAMP;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "users_email_verified_idx" ON "users"("email", "email_verified");
