import { beforeEach, describe, it, expect, vi } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { readRefugeSnapshot } from './refugeQuery';
import { completeTask, undoTask } from './taskService';
import { calculateReward } from './rewardService';
import {
  createJourneyBackup,
  validateBackup,
  restoreJourneyBackup,
} from './backupDataService';
beforeEach(async () => {
  vi.restoreAllMocks();
  await db.transaction('rw', db.tables, async () => {
    await Promise.all(db.tables.map((table) => table.clear()));
  });
  await initializeJourney();
});
async function cross() {
  await db.profile.update(1, {
    totalXpEarned: 2490,
    ecoGoldClaimedUpToStage: 1,
  });
  const id = await db.tasks.add({
    title: 'Cruzar uma transformação',
    xp: 50,
    rarity: 'common',
    completed: false,
    status: 'available',
    createdAt: new Date().toISOString(),
  });
  const event = await completeTask(id);
  return { id, event };
}
describe('memória das transformações', () => {
  it('separa o início de marcos ainda não alcançados e não grava ao consultar', async () => {
    const before = await createJourneyBackup();
    const view = await readRefugeSnapshot();
    expect(view.milestones.map((row) => row.rewardStatus)).toEqual([
      'initial',
      'locked',
      'locked',
      'locked',
    ]);
    expect((await createJourneyBackup()).data).toEqual(before.data);
  });
  it('liga o prêmio registrado ao recibo ativo, sem ler missões e logs para montar o Refúgio', async () => {
    const { event } = await cross();
    const tasks = vi.spyOn(db.tasks, 'toArray'),
      logs = vi.spyOn(db.xpLogs, 'toArray');
    const row = (await readRefugeSnapshot()).milestones[1];
    expect(row).toMatchObject({
      rewardStatus: 'recorded',
      reached: true,
      markedReceived: true,
      inconsistent: false,
    });
    expect(row.source?.id).toBe(event?.id);
    expect(tasks).not.toHaveBeenCalled();
    expect(logs).not.toHaveBeenCalled();
  });
  it('mantém o prêmio único e a referência ao recibo após correção', async () => {
    const { id } = await cross();
    await undoTask(id);
    const row = (await readRefugeSnapshot()).milestones[1];
    expect(row).toMatchObject({
      rewardStatus: 'recorded',
      reached: true,
      markedReceived: true,
    });
    expect(row.source?.reversedAt).toBeTruthy();
  });
  it('não trata XP alcançado sem prêmio marcado como recompensa recebida', async () => {
    await db.profile.update(1, {
      totalXpEarned: 2600,
      ecoGoldClaimedUpToStage: 1,
    });
    const view = await readRefugeSnapshot();
    expect(view.milestones[1]).toMatchObject({
      rewardStatus: 'pending',
      reached: true,
      markedReceived: false,
    });
    expect((await db.profile.get(1))?.gold).toBe(0);
    expect(await db.activityEvents.count()).toBe(0);
  });
  it('identifica recebimento legado sem fabricar data, evento ou crédito', async () => {
    await db.profile.update(1, {
      totalXpEarned: 8000,
      ecoGoldClaimedUpToStage: 3,
    });
    const view = await readRefugeSnapshot();
    expect(view.milestones[2]).toMatchObject({
      rewardStatus: 'legacy',
      reached: true,
      source: undefined,
    });
    expect(await db.activityEvents.count()).toBe(0);
  });
  it('preserva a marca de prêmio anterior mesmo com XP atual abaixo do marco', async () => {
    await db.profile.update(1, {
      totalXpEarned: 2490,
      ecoGoldClaimedUpToStage: 2,
    });
    expect((await readRefugeSnapshot()).milestones[1]).toMatchObject({
      rewardStatus: 'legacy',
      reached: false,
      markedReceived: true,
    });
  });
  it('detecta recibo e marcador incoerentes e recusa o backup sem alterar o destino', async () => {
    await cross();
    await db.profile.update(1, { ecoGoldClaimedUpToStage: 1 });
    const invalid = await createJourneyBackup();
    const view = await readRefugeSnapshot();
    expect(view.milestones[1].inconsistent).toBe(true);
    expect(
      calculateReward(1, view.profile, view.mods, view.buffs).awarded.map(
        (stage) => stage.id,
      ),
    ).toContain(2);
    expect(() => validateBackup(invalid)).toThrow(
      'marcos recebidos não correspondem',
    );
    const before = await db.profile.get(1),
      recoveries = await db.recoverySnapshots.count();
    await expect(restoreJourneyBackup(invalid)).rejects.toThrow(
      'marcos recebidos não correspondem',
    );
    expect(await db.profile.get(1)).toEqual(before);
    expect(await db.recoverySnapshots.count()).toBe(recoveries);
  });
  it('aceita correção com débito e mantém o marco registrado', async () => {
    const { id } = await cross();
    await undoTask(id);
    const reversed = await createJourneyBackup();
    expect(() => validateBackup(reversed)).not.toThrow();
    await db.profile.update(1, { ecoGoldClaimedUpToStage: 2 });
    expect((await readRefugeSnapshot()).milestones[1].rewardStatus).toBe(
      'recorded',
    );
    const legacy = await createJourneyBackup();
    expect(() => validateBackup(legacy)).not.toThrow();
  });
  it('consulta recursos no limite sem simular ganho nem falhar por falta de margem para prêmio', async () => {
    await db.profile.update(1, { gold: Number.MAX_SAFE_INTEGER });
    expect((await readRefugeSnapshot()).profile.gold).toBe(
      Number.MAX_SAFE_INTEGER,
    );
  });
});
