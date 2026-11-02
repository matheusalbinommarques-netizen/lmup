import { beforeEach, expect, it, vi } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import {
  ensureCamp,
  executeCamp,
  settleCampProduction,
  type CampCommand,
} from './campService';
import { campVersion, validateCampState } from '$lib/camp/campState';
import {
  createJourneyBackup,
  restoreJourneyBackup,
  validateBackup,
} from './backupDataService';
import { completeTask, undoTask } from './taskService';
const time = 1800000000000;
let sequence = 0;
beforeEach(async () => {
  vi.restoreAllMocks();
  sequence = 0;
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  await initializeJourney();
  await ensureCamp(time);
});
const state = async () => (await db.profile.get(1))!.camp!;
async function action(command: CampCommand, now = time) {
  return executeCamp(
    command,
    `test-${++sequence}`,
    campVersion(await state()),
    now,
  );
}
async function build(
  id = 'sawmill-3',
  sprite: 'sawmill' | 'quarry' | 'mine' = 'sawmill',
  x = 1008,
  y = 848,
  now = time,
) {
  await action(
    {
      type: 'build',
      building: {
        id,
        name: id,
        purpose: 'Produção',
        sprite,
        x,
        y,
        status: 'building',
        rotation: 0,
      },
    },
    now,
  );
  return id;
}
async function producer() {
  const id = await build();
  await action({ type: 'complete', id });
  return id;
}
it('inicia uma única vez, sem importar ouro/XP fictícios nem criar schema novo', async () => {
  const before = await db.profile.get(1);
  await ensureCamp(time + 1000);
  const after = await db.profile.get(1);
  expect(after).toEqual(before);
  expect(after!.gold).toBe(0);
  expect(after!.totalXpEarned).toBe(0);
  expect(db.verno).toBe(6);
  expect(after!.camp!.inventory).not.toHaveProperty('gold');
  expect(after!.camp!.inventory).not.toHaveProperty('xp');
  expect(await db.productivityAudit.count()).toBe(1);
  expect((await createJourneyBackup()).meta.formatVersion).toBe(4);
});
it('cobra construção uma vez; replay idêntico é seguro e colisão/ID repetido não cobram', async () => {
  const command: CampCommand = {
    type: 'build',
    building: {
      id: 'wood',
      name: 'Serraria',
      purpose: 'Madeira',
      sprite: 'sawmill',
      x: 1008,
      y: 848,
      status: 'building',
    },
  };
  const version = campVersion(await state());
  await executeCamp(command, 'same', version, time);
  const first = await state();
  await executeCamp(command, 'same', version, time + 5000);
  expect(await state()).toEqual(first);
  expect(first.inventory).toMatchObject({ wood: 4, stone: 4, iron: 9 });
  await expect(action(command)).rejects.toThrow('já foi');
  await expect(build('overlap', 'sawmill')).rejects.toThrow('sobrepõe');
  expect(await state()).toEqual(first);
});
it('saldo insuficiente, custo não confirmado e payload inválido mantêm estado inteiro', async () => {
  await producer();
  const before = await state();
  await expect(build('second', 'sawmill', 400, 700)).rejects.toThrow(
    'insuficientes',
  );
  expect(await state()).toEqual(before);
  await expect(
    action({
      type: 'move',
      id: 'hall',
      point: { x: NaN, y: 500 },
      rotation: 0,
    }),
  ).rejects.toThrow('inválido');
  expect(await state()).toEqual(before);
});
it('move e espelha; limites, colisões e remoção do salão não alteram os dados', async () => {
  await action({
    type: 'move',
    id: 'forge',
    point: { x: 1050, y: 1100 },
    rotation: 180,
  });
  expect((await state()).buildings.find((b) => b.id === 'forge')).toMatchObject(
    { x: 1050, rotation: 180 },
  );
  const before = await state();
  await expect(
    action({ type: 'move', id: 'forge', point: { x: 0, y: 0 }, rotation: 0 }),
  ).rejects.toThrow('inválido');
  await expect(
    action({
      type: 'move',
      id: 'forge',
      point: { x: 830, y: 617 },
      rotation: 0,
    }),
  ).rejects.toThrow('inválido');
  await expect(action({ type: 'remove', id: 'hall' })).rejects.toThrow('salão');
  expect(await state()).toEqual(before);
});
it('conclui, produz frações exatamente uma vez e resiste ao relógio retrocedendo', async () => {
  const id = await producer();
  await settleCampProduction(time + 5000);
  expect((await state()).inventory.wood).toBe(4);
  expect(
    (await state()).buildings.find((b) => b.id === id)!.production!.carry,
  ).toBeCloseTo(0.5);
  await settleCampProduction(time + 10000);
  expect((await state()).inventory.wood).toBe(5);
  const before = await state();
  await settleCampProduction(time - 10000);
  await settleCampProduction(time + 10000);
  expect(await state()).toEqual(before);
  await expect(action({ type: 'complete', id }, time + 10000)).rejects.toThrow(
    'já está',
  );
});
it('intervalos longos saturam o armazém sem acumular excedente para depois do consumo', async () => {
  await producer();
  const now = time + 86400000 * 90;
  await settleCampProduction(now);
  expect((await state()).inventory.wood).toBe(100);
  await action({ type: 'craft', id: 'forge' }, now);
  expect((await state()).inventory.wood).toBe(98);
  await settleCampProduction(now);
  expect((await state()).inventory.wood).toBe(98);
  await expect(action({ type: 'remove', id: 'store' }, now)).rejects.toThrow(
    'excedentes',
  );
});
it('trabalhadores são exclusivos e a mudança de taxa liquida o intervalo anterior primeiro', async () => {
  const id = await producer();
  await settleCampProduction(time + 40000);
  await build('other', 'quarry', 400, 700, time + 40000);
  await action({ type: 'complete', id: 'other' }, time + 40000);
  await action({ type: 'worker', id, workerId: 'lia' }, time + 40000);
  const before = await state();
  await expect(
    action({ type: 'worker', id: 'other', workerId: 'lia' }, time + 40000),
  ).rejects.toThrow('designado');
  expect(await state()).toEqual(before);
  await settleCampProduction(time + 45000);
  expect((await state()).inventory.wood).toBe(3);
  await settleCampProduction(time + 100000);
  await action({ type: 'remove', id }, time + 100000);
  await action({ type: 'worker', id: 'other', workerId: 'lia' }, time + 100000);
  const wood = (await state()).inventory.wood;
  await settleCampProduction(time + 3600000);
  expect((await state()).inventory.wood).toBe(wood);
});
it('pedreira, mina e armazém reaproveitam produção, custos e capacidade', async () => {
  await producer();
  let now = time + 3600000;
  await settleCampProduction(now);
  await build('quarry', 'quarry', 400, 700, now);
  await action({ type: 'complete', id: 'quarry' }, now);
  now += 3600000;
  await settleCampProduction(now);
  expect((await state()).inventory.stone).toBe(100);
  await build('mine', 'mine', 1500, 1150, now);
  await action({ type: 'complete', id: 'mine' }, now);
  now += 3600000;
  await settleCampProduction(now);
  expect((await state()).inventory.iron).toBe(94);
  await action({ type: 'upgrade', id: 'store' }, now);
  expect((await state()).buildings.find((b) => b.id === 'store')!.level).toBe(
    2,
  );
  now += 3600000;
  await settleCampProduction(now);
  expect((await state()).inventory.wood).toBe(200);
});
it('fabricação é atômica, idempotente e não cria equipamento, ouro, comida ou XP', async () => {
  const version = campVersion(await state());
  const command: CampCommand = { type: 'craft', id: 'forge' };
  await Promise.all([
    executeCamp(command, 'craft', version, time),
    executeCamp(command, 'craft', version, time),
  ]);
  const profile = (await db.profile.get(1))!;
  expect(profile.camp!.inventory).toMatchObject({
    wood: 10,
    stone: 7,
    iron: 6,
    trainingSword: 1,
  });
  expect(profile.gold).toBe(0);
  expect(profile.food).toBe(0);
  expect(profile.totalXpEarned).toBe(0);
  expect(await db.ownedShopItems.count()).toBe(0);
  await expect(
    executeCamp({ type: 'remove', id: 'forge' }, 'craft', version, time),
  ).rejects.toThrow('outros dados');
});
it('duas intenções concorrentes com a mesma revisão não sobrescrevem uma à outra', async () => {
  const version = campVersion(await state());
  const results = await Promise.allSettled([
    executeCamp({ type: 'craft', id: 'forge' }, 'tab-a', version, time),
    executeCamp({ type: 'craft', id: 'forge' }, 'tab-b', version, time),
  ]);
  expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
  expect((await state()).inventory.trainingSword).toBe(1);
});
it('falha ao registrar recibo aborta também estoque e fabricação', async () => {
  const before = await state(),
    count = await db.productivityAudit.count();
  vi.spyOn(db.productivityAudit, 'add').mockRejectedValueOnce(
    Error('disco indisponível'),
  );
  await expect(action({ type: 'craft', id: 'forge' })).rejects.toThrow('disco');
  expect(await state()).toEqual(before);
  expect(await db.productivityAudit.count()).toBe(count);
});
it('backup restaura estruturas/estoque e recibos; rejeita intenção de aba anterior', async () => {
  await producer();
  await settleCampProduction(time + 10000);
  const saved = await state(),
    backup = await createJourneyBackup();
  await restoreJourneyBackup(backup);
  const restored = await state();
  expect(restored.inventory).toEqual(saved.inventory);
  expect(restored.buildings).toEqual(saved.buildings);
  expect(restored.epoch).not.toBe(saved.epoch);
  await expect(
    executeCamp(
      { type: 'craft', id: 'forge' },
      'stale',
      campVersion(saved),
      time + 10000,
    ),
  ).rejects.toThrow('restaurado');
});
it.each([
  'negative',
  'shadow-gold',
  'worker',
  'carry',
  'collision',
  'missing-ledger',
])(
  'recusa backup %s antes de alterar banco ou cópias de recuperação',
  async (kind) => {
    await producer();
    const before = await state(),
      backup = JSON.parse(JSON.stringify(await createJourneyBackup())),
      camp = backup.data.profile.camp;
    if (kind === 'negative') camp.inventory.wood = -1;
    if (kind === 'shadow-gold') camp.inventory.gold = 1000;
    if (kind === 'worker')
      camp.buildings.find(
        (b: { id: string }) => b.id === 'sawmill-3',
      ).production.workerId = 'unknown';
    if (kind === 'carry')
      camp.buildings.find(
        (b: { id: string }) => b.id === 'sawmill-3',
      ).production.carry = 10;
    if (kind === 'collision') {
      camp.buildings[1].x = camp.buildings[0].x;
      camp.buildings[1].y = camp.buildings[0].y;
    }
    if (kind === 'missing-ledger') backup.data.productivityAudit = [];
    await expect(restoreJourneyBackup(backup)).rejects.toThrow();
    expect(await state()).toEqual(before);
    expect(await db.recoverySnapshots.count()).toBe(0);
  },
);
it('backup anterior sem campo camp continua aceito e não recebe dados do laboratório', async () => {
  const backup = JSON.parse(JSON.stringify(await createJourneyBackup()));
  delete backup.data.profile.camp;
  backup.data.productivityAudit = [];
  validateBackup(backup);
  await restoreJourneyBackup(backup);
  expect((await db.profile.get(1))!.camp).toBeUndefined();
  expect((await ensureCamp(time)).camp!.inventory.trainingSword).toBe(0);
});
it('missões reais e estornos preservam o acampamento e sua economia original', async () => {
  const id = await db.tasks.add({
    title: 'Atividade real',
    xp: 50,
    rarity: 'common',
    completed: false,
    createdAt: new Date(),
    areaId: 0,
  });
  const camp = await state();
  await Promise.all([completeTask(id), action({ type: 'craft', id: 'forge' })]);
  const rewarded = (await db.profile.get(1))!;
  expect(rewarded.gold).toBeGreaterThan(0);
  expect(rewarded.totalXpEarned).toBeGreaterThan(0);
  expect(rewarded.camp!.inventory.trainingSword).toBe(1);
  await undoTask(id);
  const undone = (await db.profile.get(1))!;
  expect(undone.gold).toBe(rewarded.gold);
  expect(undone.totalXpEarned).toBe(rewarded.totalXpEarned);
  expect(undone.rewardDebt).toEqual({
    xp: rewarded.totalXpEarned,
    gold: rewarded.gold,
    food: rewarded.food,
  });
  expect(undone.camp).toEqual(rewarded.camp);
  expect(camp.inventory.trainingSword).toBe(0);
  validateCampState(undone.camp);
});

it('preserva a rota inicial de produção ao construir ou fabricar sem materiais renováveis', async () => {
  const before = await state();
  await expect(build('early-quarry', 'quarry', 400, 700)).rejects.toThrow(
    'iniciar a produção',
  );
  expect(await state()).toEqual(before);
  await action({ type: 'craft', id: 'forge' });
  const once = await state();
  await expect(action({ type: 'craft', id: 'forge' })).rejects.toThrow(
    'iniciar a produção',
  );
  expect(await state()).toEqual(once);
  await producer();
  expect((await state()).buildings.some((b) => b.sprite === 'sawmill')).toBe(
    true,
  );
});

it('falha na provisão não deixa estado ou materiais parcialmente inicializados', async () => {
  await db.profile.update(1, { camp: undefined });
  await db.productivityAudit.clear();
  vi.spyOn(db.productivityAudit, 'add').mockRejectedValueOnce(Error('falha'));
  await expect(ensureCamp(time)).rejects.toThrow('falha');
  expect((await db.profile.get(1))!.camp).toBeUndefined();
  expect(await db.productivityAudit.count()).toBe(0);
});
it('falha durante restauração conserva o acampamento e o backup de entrada intactos', async () => {
  const backup = await createJourneyBackup(),
    input = structuredClone(backup),
    before = await state();
  vi.spyOn(db.profile, 'put').mockRejectedValueOnce(Error('gravação falhou'));
  await expect(restoreJourneyBackup(backup)).rejects.toThrow('gravação falhou');
  expect(await state()).toEqual(before);
  expect(backup).toEqual(input);
  expect(await db.recoverySnapshots.count()).toBe(0);
});

it('estoque corrompido não é modificado por produção ou nova operação', async () => {
  const camp = await state();
  camp.inventory.wood = -1;
  await db.profile.update(1, { camp });
  await expect(settleCampProduction(time + 10000)).rejects.toThrow('inválido');
  await expect(
    executeCamp(
      { type: 'craft', id: 'forge' },
      'corrupt',
      campVersion(camp),
      time,
    ),
  ).rejects.toThrow('inválido');
  expect((await state()).inventory.wood).toBe(-1);
  expect((await db.profile.get(1))!.gold).toBe(0);
});
