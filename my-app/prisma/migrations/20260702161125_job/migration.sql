-- CreateEnum
CREATE TYPE "public"."JobState" AS ENUM ('active', 'paused', 'completed');

-- CreateEnum
CREATE TYPE "public"."JobModality" AS ENUM ('remote', 'hybrid', 'onSite');

-- CreateEnum
CREATE TYPE "public"."JobSchedule" AS ENUM ('partTime', 'fullTime');

-- CreateTable
CREATE TABLE "public"."Job" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "salary" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "applicationLimit" INTEGER,
    "state" "public"."JobState" NOT NULL DEFAULT 'active',
    "modality" "public"."JobModality" NOT NULL,
    "schedule" "public"."JobSchedule" NOT NULL,
    "locationId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Job" ADD CONSTRAINT "Job_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Job" ADD CONSTRAINT "Job_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
