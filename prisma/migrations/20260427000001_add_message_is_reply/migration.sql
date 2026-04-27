-- AlterTable: add is_reply flag to messages
ALTER TABLE "messages" ADD COLUMN "is_reply" BOOLEAN NOT NULL DEFAULT false;
