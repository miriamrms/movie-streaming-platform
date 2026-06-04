import { Before, Given, Then, When } from '@cucumber/cucumber';
import assert from 'assert';
import { PrismaClient } from '../../src/generated/prisma/client';
import historyService from '../../src/services/history-service';

const prisma = new PrismaClient();

interface World {
  userId?: string;
  lastServiceResult?: any;
  lastServiceError?: any;
}

function toIso(dateStr: string) {
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

async function ensureMovie(title: string) {
  const map = (global as any).TEST_MOVIES || {};
  if (map[title]) return map[title];

  const created = await prisma.movie.create({ data: { title } });
  map[title] = created.id;
  (global as any).TEST_MOVIES = map;
  return created.id;
}

async function createHistoryRecord(params: {
  userId: string;
  title: string;
  dateIso: string;
  lastPosition: number;
  duration?: number;
  isHidden?: boolean;
}) {
  const movieId = await ensureMovie(params.title);

  return prisma.history.create({
    data: {
      id_user: params.userId,
      id_movie: movieId,
      duration: params.duration ?? 100,
      watched_at: new Date(`${params.dateIso}T00:00:00Z`),
      last_position: params.lastPosition,
      is_completed: params.lastPosition >= (params.duration ?? 100) * 0.95,
      is_hidden: params.isHidden ?? false,
    },
  });
}

async function withMockedToday(dateIso: string, action: () => Promise<void>) {
  const RealDate = Date;
  const fixedDate = new RealDate(`${dateIso}T12:00:00Z`);

  class MockDate extends RealDate {
    constructor(...args: any[]) {
      if (args.length === 0) {
        super(fixedDate.getTime());
        return;
      }

      super(...(args as [any]));
    }

    static now() {
      return fixedDate.getTime();
    }

    static parse(value: string) {
      return RealDate.parse(value);
    }

    static UTC(...args: any[]) {
      return RealDate.UTC(...(args as [number, number?, number?, number?, number?, number?, number?]));
    }
  }

  (globalThis as any).Date = MockDate;

  try {
    await action();
  } finally {
    (globalThis as any).Date = RealDate;
  }
}

Before(async function (this: World) {
  this.userId = 'test-user-1';
  this.lastServiceResult = undefined;
  this.lastServiceError = undefined;

  await prisma.history.deleteMany();
  await prisma.movie.deleteMany();

  await ensureMovie('Casablanca');
  await ensureMovie('Tempos Modernos');
  await ensureMovie('Cidadão Kane');
});

Given('que o usuário está logado', function (this: World) {
  this.userId = this.userId || 'test-user-1';
});

// 
Given('o sistema não possui nenhum registro de histórico para o filme {string} no dia {string}', async function (this: World, title: string, date: string) {
  const movieId = await ensureMovie(title);

  await prisma.history.deleteMany({
    where: {
      id_user: this.userId as string,
      id_movie: movieId,
      watched_at: new Date(`${toIso(date)}T00:00:00Z`),
    },
  });
});

Given('o sistema possui um registro de histórico para o filme {string} no dia {string}', async function (this: World, title: string, date: string) {
  await createHistoryRecord({
    userId: this.userId as string,
    title,
    dateIso: toIso(date),
    lastPosition: 100,
  });
});

Given('o sistema possui um registro de histórico para o filme {string} no dia {string} com tempo assistido de {string} minutos', async function (this: World, title: string, date: string, watchedMinutes: string) {
  await createHistoryRecord({
    userId: this.userId as string,
    title,
    dateIso: toIso(date),
    lastPosition: Number(watchedMinutes),
  });
});

Given('o sistema possui um registro de histórico para o filme {string} no dia {string} com tempo assistido de {string} minutos e duração de {string} minutos', async function (this: World, title: string, date: string, watchedMinutes: string, durationMinutes: string) {
  await createHistoryRecord({
    userId: this.userId as string,
    title,
    dateIso: toIso(date),
    lastPosition: Number(watchedMinutes),
    duration: Number(durationMinutes),
  });
});

Given('o histórico do usuário está completamente vazio no sistema', async function (this: World) {
  await prisma.history.deleteMany({ where: { id_user: this.userId as string } });
});

Given('o histórico do usuário está vazio', async function (this: World) {
  await prisma.history.deleteMany({ where: { id_user: this.userId as string } });
});

When('eu envio uma requisição para salvar o progresso do filme {string} com tempo assistido de {string} minutos e duração de {string} minutos no dia {string}', async function (this: World, title: string, watchedMinutes: string, durationMinutes: string, date: string) {
  const movieId = await ensureMovie(title);

  try {
    await withMockedToday(toIso(date), async () => {
      this.lastServiceResult = await historyService.processVideoProgress(
        this.userId as string,
        movieId,
        Number(durationMinutes),
        Number(watchedMinutes),
      );
    });
    this.lastServiceError = undefined;
  } catch (error: any) {
    this.lastServiceError = error;
    this.lastServiceResult = undefined;
  }
});

When('eu solicito esconder o registro do filme {string} do dia {string}', async function (this: World, title: string, date: string) {
  const movieId = await ensureMovie(title);

  try {
    await historyService.hideMovie(
      this.userId as string,
      movieId,
      new Date(`${toIso(date)}T00:00:00Z`),
    );
    this.lastServiceError = undefined;
  } catch (error: any) {
    this.lastServiceError = error;
  }
});

When('eu solicito esconder todo o histórico do usuário', async function (this: World) {
  try {
    await historyService.hideAllFromHistory(this.userId as string);
    this.lastServiceError = undefined;
  } catch (error: any) {
    this.lastServiceError = error;
  }
});

Then('deve existir um novo registro para o filme {string} no dia {string}', async function (this: World, title: string, date: string) {
  const movieId = await ensureMovie(title);
  const record = await prisma.history.findFirst({
    where: {
      id_user: this.userId as string,
      id_movie: movieId,
      watched_at: new Date(`${toIso(date)}T00:00:00Z`),
    },
  });

  assert.ok(record, `Registro para ${title} no dia ${date} não encontrado`);
});

Then('ele deve ter o tempo assistido de {string} minutos e duração de {string} minutos', async function (this: World, watchedMinutes: string, durationMinutes: string) {
  const record = await prisma.history.findFirst({
    where: { id_user: this.userId as string },
    orderBy: { watched_at: 'desc' },
  });

  assert.ok(record, 'Nenhum registro encontrado');
  assert.strictEqual(record?.last_position, Number(watchedMinutes));
  assert.strictEqual(record?.duration, Number(durationMinutes));
});

Then('deve existir apenas um registro para o filme {string} no dia {string}', async function (this: World, title: string, date: string) {
  const movieId = await ensureMovie(title);
  const records = await prisma.history.findMany({
    where: {
      id_user: this.userId as string,
      id_movie: movieId,
      watched_at: new Date(`${toIso(date)}T00:00:00Z`),
    },
  });

  assert.strictEqual(records.length, 1, `Esperado 1 registro e encontrei ${records.length}`);
});

Then('deve ter o tempo assistido atualizado de {string} minutos', async function (this: World, watchedMinutes: string) {
  const record = await prisma.history.findFirst({
    where: { id_user: this.userId as string },
    orderBy: { watched_at: 'desc' },
  });

  assert.ok(record, 'Nenhum registro encontrado');
  assert.strictEqual(record?.last_position, Number(watchedMinutes));
});

Then('deve existir um novo registro para o filme {string} no dia {string} com tempo assistido de {string} minutos', async function (this: World, title: string, date: string, watchedMinutes: string) {
  const movieId = await ensureMovie(title);
  const record = await prisma.history.findFirst({
    where: {
      id_user: this.userId as string,
      id_movie: movieId,
      watched_at: new Date(`${toIso(date)}T00:00:00Z`),
    },
  });

  assert.ok(record, `Registro para ${title} no dia ${date} não encontrado`);
  assert.strictEqual(record?.last_position, Number(watchedMinutes));
});

Then('o registro do filme {string} no dia {string} deve permanecer com o tempo assistido de {string} minutos', async function (this: World, title: string, date: string, watchedMinutes: string) {
  const movieId = await ensureMovie(title);
  const record = await prisma.history.findFirst({
    where: {
      id_user: this.userId as string,
      id_movie: movieId,
      watched_at: new Date(`${toIso(date)}T00:00:00Z`),
    },
  });

  assert.ok(record, `Registro para ${title} no dia ${date} não encontrado`);
  assert.strictEqual(record?.last_position, Number(watchedMinutes));
});

Then('o registro do filme {string} no dia {string} passa a constar internamente como oculto no sistema', async function (this: World, title: string, date: string) {
  const movieId = await ensureMovie(title);
  const record = await prisma.history.findFirst({
    where: {
      id_user: this.userId as string,
      id_movie: movieId,
      watched_at: new Date(`${toIso(date)}T00:00:00Z`),
    },
  });

  assert.ok(record, `Registro para ${title} no dia ${date} não encontrado`);
  assert.strictEqual(record?.is_hidden, true);
});

Then('os registros de {string} e {string} passam a constar internamente como ocultos no sistema', async function (this: World, title1: string, title2: string) {
  const movieId1 = await ensureMovie(title1);
  const movieId2 = await ensureMovie(title2);

  const records = await prisma.history.findMany({
    where: {
      id_user: this.userId as string,
      id_movie: { in: [movieId1, movieId2] },
    },
  });

  assert.ok(records.length >= 2, 'Esperava ao menos dois registros para ocultar');
  assert.ok(records.every((record) => record.is_hidden === true), 'Nem todos os registros foram ocultados');
});

Then('o servidor retorna uma resposta de erro notificando que a operação é inválida', function (this: World) {
  assert.ok(this.lastServiceError, 'Era esperado um erro, mas nenhuma exceção foi capturada');
  assert.ok(
    String(this.lastServiceError.message || '').includes('Seu histórico já está vazio.'),
    `Mensagem de erro inesperada: ${this.lastServiceError.message}`,
  );
});

Then('o histórico do usuário permanece completamente vazio no sistema', async function (this: World) {
  const records = await prisma.history.findMany({
    where: { id_user: this.userId as string },
  });

  assert.strictEqual(records.length, 0);
});

// -----------------------------------------------------------------------------
// GUI placeholders
// -----------------------------------------------------------------------------
// Os cenários abaixo devem ser implementados quando a UI estiver pronta.
// Eles não pertencem a este arquivo de backend/service.
//
// Scenario: Visualizar Histórico Completo
// Scenario: Registrar múltiplas visualizações do mesmo filme
// Scenario: Adicionar novo filme ao histórico
// Scenario: Ocultar filme do histórico
// Scenario: Esconder histórico Completo
// Scenario: Esconder histórico completo quando histórico está vazio
// Scenario: Histórico Vazio
