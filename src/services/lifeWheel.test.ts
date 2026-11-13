// Roda da Vida: avaliações parciais e opcionais, foco livre, ação por domínio.
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { saveArea } from './areaService';
import { saveTaskDefinition } from './taskDefinitionService';
import { completeTask, undoTask } from './taskService';
import {
  saveCheckin,
  setAreaDomain,
  setFocus,
  setIntention,
  wheelView,
  type WheelInput,
} from './lifeWheelService';
import {
  createJourneyBackup,
  restoreJourneyBackup,
  validateBackup,
} from './backupDataService';

const TODAY = '2026-11-13';
beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(`${TODAY}T15:00:00`));
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  await initializeJourney();
});
afterEach(() => vi.useRealTimers());

async function input(): Promise<WheelInput> {
  return {
    profile: await db.profile.get(1),
    areas: await db.areas.toArray(),
    tasks: await db.tasks.toArray(),
    events: await db.activityEvents.toArray(),
    routines: await db.routines.toArray(),
    occurrences: await db.occurrences.toArray(),
  };
}
const view = async (key: string) =>
  wheelView(await input(), TODAY).find((row) => row.key === key)!;

it('avaliação parcial: só as áreas escolhidas, com histórico e nota anterior', async () => {
  await expect(saveCheckin({})).rejects.toThrow('pelo menos uma');
  await expect(saveCheckin({ relations: 11 })).rejects.toThrow();
  await saveCheckin(
    { relations: 3, career: 7 },
    { relations: 'Quase não falo com a família', health: 'ignorada' },
    new Date('2026-10-13T12:00:00Z'),
  );
  await saveCheckin({ relations: 5 }, {}, new Date('2026-11-13T12:00:00Z'));
  const relations = await view('relations');
  expect(relations).toMatchObject({ rating: 5, previousRating: 3 });
  expect(relations.ratings.map((row) => row.value)).toEqual([3, 5]);
  expect((await view('career')).rating).toBe(7);
  expect((await view('health')).rating).toBeNull();
  // Observação de área não avaliada não é guardada.
  const checkin = (await db.profile.get(1))!.lifeWheel!.checkins[0];
  expect(checkin.notes).toEqual({ relations: 'Quase não falo com a família' });
});

it('foco em quantas áreas quiser, com intenção opcional; desligar remove', async () => {
  for (const key of ['relations', 'health', 'knowledge', 'home'] as const)
    await setFocus(key, true);
  await setIntention('relations', '  Estar mais presente na família  ');
  expect((await view('relations')).focus).toMatchObject({
    intention: 'Estar mais presente na família',
  });
  expect(
    wheelView(await input(), TODAY).filter((row) => row.focus).length,
  ).toBe(4);
  await setFocus('home', false);
  expect((await view('home')).focus).toBeNull();
  await expect(setIntention('relations', 'x'.repeat(201))).rejects.toThrow();
});

it('ação = dias com conclusão nas áreas do domínio, nos últimos 30 dias; estorno não conta', async () => {
  const family = await saveArea('Família');
  await setAreaDomain(family, 'relations');
  const call = await saveTaskDefinition({
    title: 'Ligar para minha mãe',
    requestId: crypto.randomUUID(),
    areaId: family,
  });
  const message = await saveTaskDefinition({
    title: 'Mandar mensagem para o irmão',
    requestId: crypto.randomUUID(),
    areaId: family,
  });
  // Geral sem domínio não entra em nenhuma área da vida.
  const loose = await saveTaskDefinition({
    title: 'Missão solta',
    requestId: crypto.randomUUID(),
  });
  await completeTask(call);
  await completeTask(message);
  await completeTask(loose);
  let relations = await view('relations');
  expect(relations.activeDays).toBe(1);
  expect(relations.areas).toEqual([{ id: family, nome: 'Família' }]);
  await undoTask(message);
  await undoTask(call);
  relations = await view('relations');
  expect(relations.activeDays).toBe(0);
  // Geral passa a contar quando ganha um domínio.
  await setAreaDomain(0, 'home');
  expect((await view('home')).activeDays).toBe(1);
  expect((await view('home')).areas).toEqual([{ id: 0, nome: 'Geral' }]);
});

it('janelas de 30 dias: atual e anterior', () => {
  const event = (date: string) => ({
    id: date,
    kind: 'task' as const,
    sequence: 1,
    occurredAt: `${date}T12:00:00Z`,
    date,
    taskId: 1,
    baseXp: 10,
    reward: { xp: 10, gold: 5, food: 1 },
    modifiers: { xpMultiplier: 1, goldMultiplier: 1, foodMultiplier: 1 },
    awardedStages: [],
    ecoClaimedBefore: 1,
    protectionDays: 0,
  });
  const rows = wheelView(
    {
      profile: {},
      areas: [{ id: 5, nome: 'Treino', domain: 'health' }],
      tasks: [{ id: 1, areaId: 5 } as never],
      events: [
        '2026-11-13',
        '2026-11-13',
        '2026-10-15',
        '2026-10-14',
        '2026-09-15',
        '2026-09-14',
      ].map(event),
      routines: [],
    },
    TODAY,
  );
  expect(rows.find((row) => row.key === 'health')).toMatchObject({
    activeDays: 2,
    previousActiveDays: 2,
  });
});

it('backup leva avaliações, foco e domínios; recusa formato inválido', async () => {
  const family = await saveArea('Família');
  await setAreaDomain(family, 'relations');
  await saveCheckin({ relations: 4 });
  await setIntention('relations', 'Ligar mais');
  const backup = JSON.parse(JSON.stringify(await createJourneyBackup()));
  expect(() => validateBackup(backup)).not.toThrow();
  await db.profile.update(1, { lifeWheel: undefined });
  await db.areas.update(family, { domain: null });
  await restoreJourneyBackup(backup);
  expect(await view('relations')).toMatchObject({
    rating: 4,
    focus: { intention: 'Ligar mais' },
    areas: [{ id: family, nome: 'Família' }],
  });
  backup.data.profile.lifeWheel.checkins[0].ratings.relations = 12;
  expect(() => validateBackup(backup)).toThrow('Roda da Vida');
  backup.data.profile.lifeWheel.checkins[0].ratings = { amor: 5 };
  expect(() => validateBackup(backup)).toThrow('Roda da Vida');
  backup.data.profile.lifeWheel = undefined;
  backup.data.areas[0].domain = 'amor';
  expect(() => validateBackup(backup)).toThrow('domínio de área');
});
