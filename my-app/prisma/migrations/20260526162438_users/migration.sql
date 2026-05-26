-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('common', 'admin', 'superAdmin');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "description" TEXT,
    "pic" TEXT NOT NULL,
    "picPublicId" TEXT,
    "state" BOOLEAN NOT NULL DEFAULT true,
    "visibility" BOOLEAN NOT NULL DEFAULT true,
    "rol" "UserRole" NOT NULL DEFAULT 'common',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
