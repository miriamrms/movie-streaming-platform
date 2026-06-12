-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_id_movie_fkey" FOREIGN KEY ("id_movie") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
