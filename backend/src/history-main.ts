// test.ts
import historyRepository from './repositories/history-repository'; 
import { HistoryModel } from "./models/history-model";
import historyService from './services/history-service';

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
    id_movie: "1",
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
    id_movie: "1",
    duration: 145,
    watched_at: "2026-05-14",
    last_position: 145,
    is_completed: true,
    is_hidden: false,
  },
{
    id_user: "1",
    id_movie: "1",
    duration: 145,
    watched_at: "2026-05-14",
    last_position: 145,
    is_completed: true,
    is_hidden: false,
  },
];

async function main() {
  console.log("Iniciando o teste...");
  
  for (const record of database) {
    const novoHistorico = await historyRepository.upsert(record);
    console.log(`Histórico criado/atualizado: User ${novoHistorico.id_user} | Filme ${novoHistorico.id_movie}`);
  }
  
  try {
    const user1History = await historyRepository.getUserHistory("1");
    console.log("Histórico do user 1:", JSON.stringify(user1History, null, 2));
  } catch (err) {
    console.error("Erro ao buscar histórico:", err);
  }
}


async function runServiceTests() {
  console.log("🎬 Iniciando os testes do HistoryService...\n");

  const id_user_1 = "1";
  const id_user_2 = "2";
  const id_movie = "1"; // Usando apenas o filme que existe no banco!

  try {
    // ====================================================================
    console.log("=== 1. Testando processVideoProgress (Inserindo progresso) ===");
    // User 1 assiste 60 min de um filme de 120 min (deve calcular 50% e is_completed: false)
    await historyService.processVideoProgress(id_user_1, id_movie, 120, 90);
    console.log(`✅ Progresso de 50% salvo para o User 1.`);

    // User 2 assiste 118 min de um filme de 120 min (deve calcular ~98% e is_completed: true)
    await historyService.processVideoProgress(id_user_2, id_movie, 120, 118);
    console.log(`✅ Progresso de 98% salvo para o User 2.\n`);

    // ====================================================================
    console.log("=== 2. Testando showUserHistory (Transformação com Map) ===");
    const user1History = await historyService.showUserHistory(id_user_1);
    console.log("Histórico do User 1 (verifique se a property percentage_watched é '50%'):");
    console.log(user1History, "\n");

    const user2History = await historyService.showUserHistory(id_user_2);
    console.log("Histórico do User 2 (verifique se is_completed é true e percentage_watched é '98%'):");
    console.log(user2History, "\n");

    // ====================================================================
    console.log("=== 3. Testando hideMovie (Esconder um filme específico) ===");
    // Precisamos passar um objeto Date válido que já exista no banco. 
    // Vamos pegar a data exata em que o filme do User 1 foi salvo.
    const watchedAtUser1 = new Date(user1History[0].watched_at);
    await historyService.hideMovie(id_user_1, id_movie, watchedAtUser1);
    console.log(`✅ O filme foi ocultado com sucesso para o User 1.`);
    
    // Verificando se realmente sumiu
    const user1HistoryAfterHide = await historyService.showUserHistory(id_user_1);
    console.log(`Histórico do User 1 após hideMovie (Deve retornar array vazio []):`, user1HistoryAfterHide, "\n");

    // ====================================================================
    console.log("=== 4. Testando hideAllFromHistory (Sucesso) ===");
    // O User 2 ainda tem histórico ativo, vamos limpar tudo
    await historyService.hideAllFromHistory(id_user_2);
    console.log(`✅ Todo o histórico do User 2 foi ocultado.`);
    
    const user2HistoryAfterHideAll = await historyService.showUserHistory(id_user_2);
    console.log(`Histórico do User 2 após hideAll (Deve retornar array vazio []):`, user2HistoryAfterHideAll, "\n");

    // ====================================================================
    console.log("=== 5. Testando Tratamento de Erro (Scenario 6: Histórico Vazio) ===");
    try {
      // Como o User 1 já está com o histórico limpo (escondemos no passo 3), deve dar erro.
      await historyService.hideAllFromHistory(id_user_1);
    } catch (error: any) {
      console.log(`✅ Erro capturado perfeitamente pelo Service! Mensagem: "${error.message}"\n`);
    }

    console.log("🎉 Todos os testes do Service foram executados com sucesso!");

  } catch (err) {
    console.error("❌ Ops! Ocorreu um erro inesperado durante a execução dos testes:", err);
  }
}

// Executa a função
runServiceTests();