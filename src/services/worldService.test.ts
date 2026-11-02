import { beforeEach, expect, it } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { actInWorld, ensureWorld, type WorldCommand } from './worldService';
import { createJourneyBackup, restoreJourneyBackup } from './backupDataService';
import {
  returnNoticeAvailable,
  returnNotice,
  personalTasks,
} from '$lib/world/content';
import { ensureCamp, executeCamp } from './campService';
import { campVersion } from '$lib/camp/campState';
import { validateWorld } from '$lib/world/worldState';

beforeEach(async () => {
  await db.transaction('rw', db.tables, async () => {
    for (const t of db.tables) await t.clear();
  });
  await initializeJourney();
});
async function act(command: WorldCommand, id = crypto.randomUUID()) {
  const w = await ensureWorld();
  return actInWorld(command, { epoch: w.epoch, revision: w.revision }, id);
}
async function start() {
  await act({ type: 'enter', scene: 'settlement' });
  await act({ type: 'talk' });
  await act({ type: 'choose', choice: 'accept' });
}
async function evidence() {
  await act({ type: 'enter', scene: 'outskirts' });
  for (const id of ['wagon', 'bags', 'footprints'] as const) {
    await act({ type: 'inspect', id });
    await act({ type: 'collect' });
  }
  await act({ type: 'enter', scene: 'settlement' });
  await act({ type: 'talk' });
}

it('inicia Mundo separadamente e não muda recursos, identidade, piloto ou schema', async () => {
  await db.profile.update(1, {
    rpgPilot: { scene: 6, choice: 'help', chapterOneEndXp: 0 },
  });
  const before = (await createJourneyBackup()).data;
  const w = await ensureWorld();
  expect(w.quest).toBe('new');
  expect(w.discovered).toEqual(['oasis']);
  expect(await ensureWorld()).toEqual(w);
  const after = (await createJourneyBackup()).data;
  const { world, ...profile } = after.profile!;
  expect(world).toEqual(w);
  expect(profile).toEqual(before.profile);
  expect(after.tasks).toEqual(before.tasks);
  expect(db.verno).toBe(6);
});
it('bloqueia viagem e decisão sem condições e não registra pistas fora da cena', async () => {
  await expect(act({ type: 'enter', scene: 'outskirts' })).rejects.toThrow(
    'Lucan',
  );
  await expect(act({ type: 'choose', choice: 'rescue' })).rejects.toThrow(
    'conversa',
  );
  await act({ type: 'enter', scene: 'settlement' });
  await expect(act({ type: 'inspect', id: 'wagon' })).rejects.toThrow('cena');
  await act({ type: 'inspect', id: 'board' });
  await expect(act({ type: 'collect' })).rejects.toThrow('pista');
  await start();
  await expect(act({ type: 'choose', choice: 'rescue' })).rejects.toThrow(
    'disponível',
  );
});
it.each(['rescue', 'route'] as const)(
  'investigação completa com consequência %s sem efeitos econômicos',
  async (resolution) => {
    const before = await createJourneyBackup();
    await start();
    await evidence();
    const w = await act({ type: 'choose', choice: resolution });
    expect(w.quest).toBe('solved');
    expect(w.resolution).toBe(resolution);
    expect(w.clues).toEqual(['axle', 'cargo', 'tracks']);
    expect(w.journal.map((x) => x.id)).toContain('quest:solved');
    expect(w.journal.find((x) => x.id === 'quest:solved')?.text).toContain(
      personalTasks[resolution].journal,
    );
    expect(w.clues).not.toContain('manifest');
    await expect(
      act({
        type: 'choose',
        choice: resolution === 'rescue' ? 'route' : 'rescue',
      }),
    ).rejects.toThrow('disponível');
    const after = await createJourneyBackup();
    for (const name of [
      'tasks',
      'activityEvents',
      'xpLogs',
      'occurrences',
      'executionRecords',
    ])
      expect(after.data[name]).toEqual(before.data[name]);
    const { world, ...profile } = after.data.profile!;
    expect(profile).toEqual(before.data.profile);
    expect(world?.quest).toBe('solved');
  },
);
it('retoma cena, objeto e diálogo; repetir a pista e rever eventos não duplica efeitos', async () => {
  await start();
  await act({ type: 'enter', scene: 'outskirts' });
  await act({ type: 'inspect', id: 'wagon' });
  const a = await act({ type: 'collect' });
  const b = await act({ type: 'collect' });
  expect(b).toEqual(a);
  expect((await ensureWorld()).focus).toBe('wagon');
  await evidence();
  await act({ type: 'choose', choice: 'review' });
  expect((await ensureWorld()).dialogue).toBe('evidence');
  const before = await createJourneyBackup();
  expect((await ensureWorld()).journal).toHaveLength(4);
  expect((await createJourneyBackup()).data).toEqual(before.data);
});
it('operações repetidas são idempotentes e identificadores não podem representar outra escolha', async () => {
  const w = await ensureWorld(),
    expected = { epoch: w.epoch, revision: w.revision };
  const results = await Promise.all([
    actInWorld({ type: 'enter', scene: 'settlement' }, expected, 'same'),
    actInWorld({ type: 'enter', scene: 'settlement' }, expected, 'same'),
  ]);
  expect(results[0]).toEqual(results[1]);
  await expect(actInWorld({ type: 'talk' }, expected, 'same')).rejects.toThrow(
    'outra escolha',
  );
});
it('rejeita ações atrasadas de outra aba e preserva a ação que venceu', async () => {
  const w = await ensureWorld();
  await act({ type: 'enter', scene: 'settlement' });
  await expect(
    actInWorld({ type: 'enter', scene: 'settlement' }, w, 'stale'),
  ).rejects.toThrow('outra aba');
  expect((await ensureWorld()).revision).toBe(1);
});
it('backup e restauração preservam decisões, renovam a época e invalidam rascunhos anteriores', async () => {
  await start();
  await evidence();
  const solved = await act({ type: 'choose', choice: 'route' }),
    backup = await createJourneyBackup();
  await restoreJourneyBackup(backup);
  const saved = await ensureWorld();
  expect(saved.epoch).not.toBe(solved.epoch);
  expect({ ...saved, epoch: solved.epoch }).toEqual(solved);
  await expect(
    actInWorld({ type: 'talk' }, solved, 'old-epoch'),
  ).rejects.toThrow('restaurado');
  expect(backup.meta.formatVersion).toBe(4);
});
it('backup antigo sem Mundo continua válido e não inventa exploração', async () => {
  const old = await createJourneyBackup();
  await start();
  await restoreJourneyBackup(old);
  expect((await db.profile.get(1))?.world).toBeUndefined();
  expect((await ensureWorld()).quest).toBe('new');
});
it('recusa estado incoerente antes de substituir os dados', async () => {
  await start();
  const before = await createJourneyBackup(),
    invalid = structuredClone(before);
  invalid.data.profile!.world!.quest = 'solved';
  expect(() => validateWorld(invalid.data.profile!.world)).toThrow('inválido');
  await expect(restoreJourneyBackup(invalid)).rejects.toThrow('inválido');
  expect((await createJourneyBackup()).data).toEqual(before.data);
});
it('falha ao salvar reverte escolha, diário e ponto de retomada', async () => {
  await start();
  const before = await ensureWorld();
  const fail = () => {
    throw Error('Falha simulada');
  };
  db.profile.hook('updating', fail);
  try {
    await expect(
      actInWorld({ type: 'enter', scene: 'outskirts' }, before, 'rollback'),
    ).rejects.toThrow('Falha simulada');
  } finally {
    db.profile.hook('updating').unsubscribe(fail);
  }
  expect(await ensureWorld()).toEqual(before);
});

it('aviso de retorno é informação derivada, sem nova pista obrigatória ou desbloqueio indevido', async () => {
  expect(returnNoticeAvailable(await ensureWorld())).toBe(false);
  await start();
  await act({ type: 'enter', scene: 'outskirts' });
  await act({ type: 'enter', scene: 'settlement' });
  const before = await createJourneyBackup();
  expect(returnNoticeAvailable(await ensureWorld())).toBe(true);
  expect(returnNotice.text).toContain('todos os carregadores');
  expect((await createJourneyBackup()).data).toEqual(before.data);
  await act({ type: 'inspect', id: 'board' });
  expect((await ensureWorld()).clues).toEqual([]);
  await act({ type: 'talk' });
  expect((await ensureWorld()).dialogue).toBe('progress');
  await expect(act({ type: 'choose', choice: 'rescue' })).rejects.toThrow(
    'disponível',
  );
});
it('mantém conclusões e registros antigos sem migração nem reescrever o diário', async () => {
  await start();
  await evidence();
  const w = await act({ type: 'choose', choice: 'route' });
  w.journal.find((x) => x.id === 'quest:solved')!.text =
    'Registro da versão anterior, preservado.';
  await db.profile.update(1, { world: w });
  expect(await ensureWorld()).toEqual(w);
  await act({ type: 'talk' });
  const restored = await ensureWorld();
  expect(restored.resolution).toBe('route');
  expect(restored.journal).toEqual(w.journal);
});

it('restauração conjunta preserva Mundo, acampamento e recibos e invalida intenções antigas dos dois', async () => {
  await ensureCamp();
  await start();
  await evidence();
  const world = await act({ type: 'choose', choice: 'rescue' });
  const profile = (await db.profile.get(1))!,
    camp = profile.camp!;
  const backup = await createJourneyBackup();
  await restoreJourneyBackup(backup);
  const restored = (await db.profile.get(1))!;
  expect(restored.world!.epoch).not.toBe(world.epoch);
  expect(restored.camp!.epoch).not.toBe(camp.epoch);
  expect(restored).toEqual({
    ...profile,
    world: { ...world, epoch: restored.world!.epoch },
    camp: { ...camp, epoch: restored.camp!.epoch },
  });
  const after = await createJourneyBackup();
  for (const key of [
    'tasks',
    'areas',
    'activityEvents',
    'xpLogs',
    'executionRecords',
    'productivityAudit',
  ])
    expect(after.data[key]).toEqual(backup.data[key]);
  await expect(
    actInWorld({ type: 'talk' }, world, 'before:restore'),
  ).rejects.toThrow('restaurado');
  await expect(
    executeCamp(
      { type: 'complete', id: camp.buildings[0].id },
      'before:restore',
      campVersion(camp),
    ),
  ).rejects.toThrow('restaurado');
});
