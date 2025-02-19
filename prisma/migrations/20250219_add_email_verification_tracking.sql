-- Add new columns for email verification tracking
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "email_verification_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "last_email_sent_at" TIMESTAMP;

-- Add index for email verification queries
CREATE INDEX IF NOT EXISTS "users_email_verified_idx" ON "users"("email", "email_verified");
