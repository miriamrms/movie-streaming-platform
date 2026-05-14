import { HistoryModel } from "../models/history-model";

// Camada responsável pela interação com o data 
const database: HistoryModel[] = [
  {
    id_user: 33839293822,
    id_movie: 1,
    duration: 105,
    watched_at: "14-05-2026",
    last_position: 60,
    is_completed: false,
    is_hidden: false,
  },
  {
    id_user: 33839293822,
    id_movie: 2,
    duration: 90,
    watched_at: "14-05-2026",
    last_position: 88,
    is_completed: true,
    is_hidden: false,
  },
  {
    id_user: 33839293822,
    id_movie: 3,
    duration: 120,
    watched_at: "14-05-2026",
    last_position: 88,
    is_completed: false,
    is_hidden: false,
  },
  {
    id_user: 33839293822,
    id_movie: 4,
    duration: 145,
    watched_at: "14-05-2026",
    last_position: 145,
    is_completed: true,
    is_hidden: false,
  },
];

// Fetch em todos o histórico do usuário
export const getUserHistory = async (id_user: number): Promise<HistoryModel[]> => {
  return database.filter(record => record.id_user == id_user);
};

// Insere um novo record no histórico
export const insertHistoryRecord = async (history: HistoryModel) => {
  database.push(history);
};

// Esconde todo o historico
export const hideAllHistoryRecords = async (id_user: number): Promise<void> => {
  database.forEach(record => {
    if (record.id_user == id_user) {
        record.is_hidden = true;
    }
  });
};

// Esconde um record do histórico
export const hideHistoryRecord = async (id_user: number, id_movie: number, watched_at: string): Promise<void> => {
    const index = database.findIndex(record =>
        record.id_user === id_user &&
        record.id_movie === id_movie &&
        record.watched_at === watched_at
    );
    if(index !== -1) {
        database[index].is_hidden = true;
    }
};

// Atualiza um record do histórico
export const updateHistoryRecord = async (id_user: number, id_movie: number, watched_at: string, last_position: number): Promise<void> => {
    const index = database.findIndex(record =>
        record.id_user === id_user &&
        record.id_movie === id_movie &&
        record.watched_at === watched_at
    );
    if(index !== -1) {
        database[index].last_position = last_position;
        if (last_position >= database[index].duration*0.96) {
            database[index].is_completed = true;
        }
    }
};
