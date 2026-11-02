import { approvedIconPath } from '$lib/content/visualAssets';
import { beforeEach, expect, it } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { saveTaskDefinition } from './taskDefinitionService';
import {
  createJourneyBackup,
  restoreJourneyBackup,
  validateBackup,
} from './backupDataService';
import { saveRoutine } from './routineService';
import { selectNextOccurrence } from '$lib/journey/homePriority';
import { makeOccurrence } from './occurrenceService';

beforeEach(async () => {
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  await initializeJourney();
});

it('salva ícone opcional, preserva em edição parcial e mantém no backup sem alterar saldo ou esquema', async () => {
  const before = await db.profile.get(1);
  const id = await saveTaskDefinition({
    title: 'Missão visual',
    requestId: 'icon-create',
    iconKey: 'exercicio',
  });
  const first = (await db.tasks.get(id))!;
  await saveTaskDefinition({
    title: first.title,
    requestId: 'icon-edit',
    editId: id,
    expectedRevision: first.definitionRevision,
  });
  expect((await db.tasks.get(id))?.iconKey).toBe('exercicio');
  const backup = await createJourneyBackup();
  await restoreJourneyBackup(backup);
  expect((await db.tasks.get(id))?.iconKey).toBe('exercicio');
  expect(db.verno).toBe(6);
  expect((await db.profile.get(1))?.gold).toBe(before?.gold);
  expect((await db.profile.get(1))?.totalXpEarned).toBe(before?.totalXpEarned);
  expect(await db.activityEvents.count()).toBe(0);
  const current = (await db.tasks.get(id))!;
  await saveTaskDefinition({
    title: current.title,
    requestId: 'icon-clear',
    editId: id,
    expectedRevision: current.definitionRevision,
    iconKey: null,
  });
  expect((await db.tasks.get(id))?.iconKey).toBeNull();
});

it('recusa caminho arbitrário e vincula missão recém-criada a rotina preservando ícone e plano anterior', async () => {
  await expect(
    saveTaskDefinition({
      title: 'Inválida',
      requestId: 'invalid-icon',
      iconKey: '../../outside',
    }),
  ).rejects.toThrow('ícone');
  const id = await saveTaskDefinition({
    title: 'Criada na rotina',
    requestId: 'inline-create',
    iconKey: 'estudo',
    plannedDate: '2026-11-01',
  });
  await saveRoutine({
    id: 'inline-routine',
    name: 'Minha rotina',
    days: [1, 3],
    startDate: '2026-11-01',
    entries: [{ taskId: id, time: '09:00' }],
  });
  expect((await db.tasks.get(id))?.iconKey).toBe('estudo');
  expect(
    (await db.routines.get('inline-routine'))?.entries[0].previousPlan
      .plannedDate,
  ).toBe('2026-11-01');
  expect(await db.activityEvents.count()).toBe(0);
});

it('prioriza escolha manual, execução e horário sem mudar a ordem nem a identidade das ocorrências', async () => {
  const id = await saveTaskDefinition({
    title: 'Escolha',
    requestId: 'priority-create',
    plannedDate: '2026-11-01',
  });
  const task = (await db.tasks.get(id))!;
  const first = {
    ...makeOccurrence(task, '2026-11-01'),
    id: 'first',
    taskId: 1,
    plannedTime: '08:00',
  };
  const active = {
    ...first,
    id: 'active',
    taskId: 2,
    status: 'partial' as const,
    value: 0.5,
    plannedTime: '10:00',
  };
  const manual = { ...first, id: 'manual', taskId: 3, plannedTime: null };
  const rows = [manual, first, active];
  expect(selectNextOccurrence(rows, 3)?.id).toBe('manual');
  expect(selectNextOccurrence(rows)?.id).toBe('active');
  expect(selectNextOccurrence([manual, first])?.id).toBe('first');
  expect(rows.map((row) => row.id)).toEqual(['manual', 'first', 'active']);
});

it('backups sem ícone continuam válidos e restauram dados e saldos sem migração', async () => {
  const id = await saveTaskDefinition({
    title: 'Sem ícone',
    requestId: 'old-icon',
  });
  const backup = JSON.parse(JSON.stringify(await createJourneyBackup()));
  delete backup.data.tasks[0].iconKey;
  await restoreJourneyBackup(backup);
  expect((await db.tasks.get(id))?.iconKey).toBeUndefined();
  expect(db.verno).toBe(6);
  const restored = JSON.parse(JSON.stringify(await createJourneyBackup()));
  expect(restored.data).toEqual(backup.data);
});

it.each(['../../outside', 'toString', '', 42, { key: 'estudo' }])(
  'recusa ícone inválido %j no backup antes de escrever no banco',
  async (iconKey) => {
    await saveTaskDefinition({
      title: 'Preservada',
      requestId: 'preserved-icon',
      iconKey: 'estudo',
    });
    const before = await createJourneyBackup();
    const invalid = JSON.parse(JSON.stringify(before));
    invalid.data.tasks[0].iconKey = iconKey;
    expect(() => validateBackup(invalid)).toThrow('ícone');
    await expect(restoreJourneyBackup(invalid)).rejects.toThrow('ícone');
    expect((await createJourneyBackup()).data).toEqual(before.data);
    expect(await db.recoverySnapshots.count()).toBe(0);
  },
);

it('ícone ausente ou desconhecido usa somente o livro aprovado e resoluções distribuídas', () => {
  const fallback = '/art/approved/navigation/Missoes_64.png';
  expect(approvedIconPath(undefined)).toBe(fallback);
  expect(approvedIconPath(null)).toBe(fallback);
  expect(approvedIconPath('../../outside')).toBe(fallback);
  expect(approvedIconPath('toString')).toBe(fallback);
  expect(approvedIconPath('estudo', 256)).toBe(
    '/art/approved/icons/estudo/128.png',
  );
});
