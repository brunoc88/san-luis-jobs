/*
  Warnings:

  - The values [completed] on the enum `JobState` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."JobState_new" AS ENUM ('active', 'paused', 'finished');
ALTER TABLE "public"."Job" ALTER COLUMN "state" DROP DEFAULT;
ALTER TABLE "public"."Job" ALTER COLUMN "state" TYPE "public"."JobState_new" USING ("state"::text::"public"."JobState_new");
ALTER TYPE "public"."JobState" RENAME TO "JobState_old";
ALTER TYPE "public"."JobState_new" RENAME TO "JobState";
DROP TYPE "public"."JobState_old";
ALTER TABLE "public"."Job" ALTER COLUMN "state" SET DEFAULT 'active';
COMMIT;
