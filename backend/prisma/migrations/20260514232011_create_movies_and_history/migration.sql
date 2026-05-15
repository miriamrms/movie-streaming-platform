-- CreateTable
CREATE TABLE "History" (
    "id_user" TEXT NOT NULL,
    "id_movie" TEXT NOT NULL,
    "watched_at" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "last_position" INTEGER NOT NULL DEFAULT 0,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "History_pkey" PRIMARY KEY ("id_user","id_movie","watched_at")
);
