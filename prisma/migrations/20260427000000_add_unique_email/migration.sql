-- AlterTable: add unique constraint on users.email
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
