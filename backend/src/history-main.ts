// test.ts
import historyRepository from './repositories/history-repository'; 
import { HistoryModel } from "./models/history-model";

const database: HistoryModel[] = [
  {
    id_user: "1",
    id_movie: "1",
    duration: 105,
    watched_at: "2026-05-14",
    last_position: 60,
    is_completed: false,
    is_hidden: false,
  },
  {
    id_user: "1",
    id_movie: "2",
    duration: 90,
    watched_at: "2026-05-14",
    last_position: 88,
    is_completed: true,
    is_hidden: false,
  },
  {
    id_user: "2",
    id_movie: "1",
    duration: 120,
    watched_at: "2026-05-14",
    last_position: 88,
    is_completed: false,
    is_hidden: false,
  },
  {
    id_user: "2",
    id_movie: "4",
    duration: 145,
    watched_at: "2026-05-14",
    last_position: 145,
    is_completed: true,
    is_hidden: false,
  },
{
    id_user: "1",
    id_movie: "3",
    duration: 145,
    watched_at: "2026-05-14",
    last_position: 145,
    is_completed: true,
    is_hidden: false,
  },
];

async function main() {
  console.log("Iniciando o teste...");
  /*
  for (const record of database) {
    const novoHistorico = await historyRepository.create(record);
    console.log(`Histórico criado/atualizado: User ${novoHistorico.id_user} | Filme ${novoHistorico.id_movie}`);
  }
  */
  try {
    const user1History = await historyRepository.getUserHistory("1");
    console.log("Histórico do user 1:", JSON.stringify(user1History, null, 2));
  } catch (err) {
    console.error("Erro ao buscar histórico:", err);
  }
}

main();