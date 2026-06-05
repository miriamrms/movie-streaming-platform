/*
  Warnings:

  - Made the column `duration` on table `History` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "History" ALTER COLUMN "duration" SET NOT NULL,
ALTER COLUMN "duration" SET DEFAULT 120;
