/*
  Warnings:

  - The primary key for the `History` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "History" DROP CONSTRAINT "History_pkey",
ALTER COLUMN "watched_at" SET DATA TYPE DATE,
ADD CONSTRAINT "History_pkey" PRIMARY KEY ("id_user", "id_movie", "watched_at");
