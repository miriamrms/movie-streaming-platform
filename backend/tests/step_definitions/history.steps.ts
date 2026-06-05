import { Before, Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';
import request from 'supertest';
import app from '../../src/index';
import { PrismaClient } from '../../src/generated/prisma/client';

const prisma = new PrismaClient();

// =============================================================================
// INTERFACES E UTILITÁRIOS
// =============================================================================

interface World {
  userId?: string;
  response?: request.Response;
  currentMovieId?: string;
}

function toIso(dateStr: string) {
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

async function executeWithMockedDate(dateIso: string, action: () => Promise<void>) {
  const RealDate = Date;
  const fixedDate = new RealDate(`${dateIso}T12:00:00Z`);
  class MockDate extends RealDate {
    constructor(...args: any[]) {
      if (args.length === 0) { super(fixedDate.getTime()); return; }
      super(...(args as [any]));
    }
    static now() { return fixedDate.getTime(); }
  }
  (globalThis as any).Date = MockDate;
  try { await action(); } finally { (globalThis as any).Date = RealDate; }
}

// =============================================================================
// SETUP: Isolamento de Testes
// =============================================================================
Before(async function (this: World) {
  this.userId = undefined;
  this.response = undefined;
  this.currentMovieId = undefined;

  await prisma.history.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.user.deleteMany(); 
});


// =============================================================================
// PASSOS COMPARTILHADOS / GENÉRICOS
// =============================================================================

// Trata a frase "Given que o usuário está logado" genérica (Sem ID específico)
Given('que o usuário está logado', async function (this: World) {
  this.userId = 'user-default';
  await prisma.user.upsert({
    where: { id: this.userId },
    update: {},
    create: { id: this.userId, email: `${this.userId}@test.com`, name: 'Usuário Padrão' },
  });
});

// Trata a frase "Given que o usuário 'ID' está logado" com ID específico
Given('que o usuário {string} está logado', async function (this: World, userId: string) {
  this.userId = userId;
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, email: `${userId}@test.com`, name: userId },
  });
});

Given('que o usuário {string} está cadastrado no sistema', async function (this: World, userId: string) {
  this.userId = userId;
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, email: `${userId}@test.com`, name: userId },
  });
});

Then('o status da resposta deve ser {string}', function (this: World, status: string) {
  assert.strictEqual(this.response?.status, Number(status));
});


// =============================================================================
// CENÁRIO: Ocultar todo o histórico quando não existem registros
// =============================================================================

Given('o histórico do usuário está completamente vazio no sistema', async function (this: World) {
  // Garantido pelo Before(), mas reforçamos a limpeza para a semântica do cenário
  await prisma.history.deleteMany({ where: { userId: this.userId! } });
});

When('eu solicito esconder todo o histórico do usuário', async function (this: World) {
  // Chamamos a rota PATCH de hide-all da sua API
  this.response = await request(app)
    .patch('/history/hide-all') // Ajuste se a rota base do app tiver prefixo (ex: /api/history/hide-all)
    .send({ id_user: this.userId });
});

Then('o servidor retorna uma resposta de erro notificando que a operação é inválida', function (this: World) {
  assert.strictEqual(
    this.response?.status, 
    400, 
    `Esperava erro 400 (Bad Request), mas recebeu ${this.response?.status}`
  );
  assert.ok(
    this.response?.body.error?.includes('Seu histórico já está vazio.'),
    `Mensagem de erro inesperada: ${this.response?.body.error}`
  );
});

Then('o histórico do usuário permanece completamente vazio no sistema', async function (this: World) {
  const records = await prisma.history.count({
    where: { userId: this.userId! }
  });
  assert.strictEqual(records, 0, `O histórico deveria estar vazio, mas possui ${records} registros.`);
});


// =============================================================================
// CENÁRIO: Atualizar progresso de filme reassistido no mesmo dia
// =============================================================================

Given('o sistema possui um registro de histórico para o filme {string} no dia {string} com tempo assistido de {string} minutos', async function (this: World, title: string, dateStr: string, watchedMinutes: string) {
  const movie = await prisma.movie.create({
    data: { title: title, genres: "Drama" }
  });
  this.currentMovieId = movie.id; 

  await prisma.history.create({
    data: {
      userId: this.userId!,
      movieId: movie.id,
      duration: 120,
      last_position: Number(watchedMinutes),
      watchedAt: new Date(`${toIso(dateStr)}T00:00:00Z`),
      is_completed: false,
      is_hidden: false
    }
  });
});

When('eu envio uma requisição para salvar o progresso do filme {string} com tempo assistido de {string} minutos no dia {string}', async function (this: World, title: string, watchedMinutes: string, dateStr: string) {
  await executeWithMockedDate(toIso(dateStr), async () => {
    this.response = await request(app)
      .post('/history/progress')
      .send({
        id_user: this.userId,
        id_movie: this.currentMovieId,
        duration: 120,
        last_position: Number(watchedMinutes)
      });
  });
});

Then('deve existir apenas um registro para o filme {string} no dia {string}', async function (this: World, title: string, dateStr: string) {
  const records = await prisma.history.findMany({
    where: {
      userId: this.userId!,
      movieId: this.currentMovieId,
      watchedAt: new Date(`${toIso(dateStr)}T00:00:00Z`)
    }
  });
  assert.strictEqual(records.length, 1, `Falha na restrição: Esperava apenas 1 registro (Upsert), mas o banco criou ${records.length}.`);
});

Then('deve ter o tempo assistido atualizado de {string} minutos', async function (this: World, expectedMinutes: string) {
  const historyRecord = await prisma.history.findFirst({
    where: { userId: this.userId!, movieId: this.currentMovieId },
    orderBy: { watchedAt: 'desc' }
  });
  assert.ok(historyRecord, "O registro de histórico não foi encontrado.");
  assert.strictEqual(historyRecord!.last_position, Number(expectedMinutes));
});


// =============================================================================
// CENÁRIOS RESTANTES: Salvar progresso e Obter Histórico
// =============================================================================

Given('o filme de id {string} está disponível no catálogo', async function (movieId: string) {
  await prisma.movie.upsert({
    where: { id: movieId },
    update: {},
    create: { id: movieId, title: `Filme ${movieId}`, genres: 'Drama' },
  });
});

Given('o usuário assistiu ao filme de id {string} no dia {string}', async function (this: World, movieId: string, date: string) {
  await prisma.movie.upsert({
    where: { id: movieId },
    update: {},
    create: { id: movieId, title: `Filme ${movieId}`, genres: 'Drama' },
  });

  await prisma.history.create({
    data: {
      userId: this.userId!,
      movieId,
      watchedAt: new Date(`${toIso(date)}T00:00:00Z`),
      duration: 120,
      last_position: 120,
      is_completed: true,
      is_hidden: false,
    },
  });
});

Given('o usuário não assistiu nenhum outro filme', async function () {
  // Garantido pelo Before()
});

When('uma requisição {string} for enviada para {string} com o filme de id {string} e tempo assistido {int} minutos', async function (this: World, method: string, endpoint: string, movieId: string, watchedMinutes: number) {
  this.response = await request(app)
    .post(endpoint)
    .send({
      id_user: this.userId,
      id_movie: movieId,
      duration: 120,
      last_position: watchedMinutes,
    });
});

When('uma requisição {string} for enviada para o endpoint de histórico do usuário {string}', async function (this: World, method: string, userId: string) {
  this.response = await request(app).get(`/history/${userId}`);
});

Then('o registro de progresso para o filme de id {string} deve ser atualizado para {int} minutos', async function (this: World, movieId: string, watchedMinutes: number) {
  const history = await prisma.history.findFirst({
    where: { userId: this.userId!, movieId },
    orderBy: { watchedAt: 'desc' },
  });
  assert.ok(history, 'O registro de histórico não foi criado no banco de dados.');
  assert.strictEqual(history!.last_position, watchedMinutes);
});

Then('o registro do filme de id {string} deve constar na lista', function (this: World, movieId: string) {
  const items = this.response?.body.data || [];
  const found = items.some((item: any) => item.movieId === movieId || item.id_movie === movieId);
  assert.ok(found, `O filme ${movieId} não foi retornado na resposta da API.`);
});

Then('nenhum outro filme deve constar na lista', function (this: World) {
  const items = this.response?.body.data || [];
  assert.strictEqual(items.length, 1, `Esperava retornar exatamente 1 filme, mas retornou ${items.length}`);
});