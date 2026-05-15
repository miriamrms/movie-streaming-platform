
import { HistoryModel } from "../models/history-model";
import { PrismaClient } from '../generated/prisma/client';
const prisma = new PrismaClient();

class HistoryRepository {

    async getUserHistory(id_user: string) {
        return await prisma.history.findMany({
            where: {
                id_user: id_user,
                is_hidden: false
            },
            orderBy: {
                watched_at: 'desc' // Ordena do mais recente para o mais antigo
            }
        });
    }
  
    async upsert(data: HistoryModel) {
        return await prisma.history.upsert({
            where: {
                id_user_id_movie_watched_at: {
                    id_user: data.id_user,
                    id_movie: data.id_movie,
                    watched_at: new Date(data.watched_at) 
                }
            },
            update: {
                // Se já existir hoje, atualiza a posição e o status
                last_position: data.last_position,
                is_completed: data.is_completed,
            },
            create: {
                // Se não existir hoje, cria uma nova
                id_user: data.id_user,
                id_movie: data.id_movie,
                duration: data.duration,
                watched_at: new Date(data.watched_at),
                last_position: data.last_position,
                is_completed: data.is_completed,
                is_hidden: data.is_hidden
            }
        });
    }

    async hideAllFromHistory(id_user: string) {
        return await prisma.history.updateMany({
            where: {
                id_user: id_user,
                is_hidden: false
            },
            data: {
                is_hidden: true
            }
        });
    }

    async hideFromHistory(id_user: string, id_movie: string, watched_at: Date) {
        return await prisma.history.update({
            where: {
                id_user_id_movie_watched_at: {
                id_user: id_user,
                id_movie: id_movie,
                watched_at: watched_at
                }
            },
            data: {
                is_hidden: true
            }
        });
    }
}

export default new HistoryRepository();