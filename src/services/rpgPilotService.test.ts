import { beforeEach, describe, expect, it } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { createQuickTask } from './journeyService';
import { completeTask, undoTask } from './taskService';
import {
  advanceChapterTwo,
  advancePilot,
  chapterTwoProgress,
  initializeChapterTwoProgress,
  readPilot,
  unlockChapterTwo,
} from './rpgPilotService';
import { CHAPTER_TWO_XP } from '$lib/content/pilot';
import {
  createJourneyBackup,
  restoreJourneyBackup,
  validateBackup,
} from './backupDataService';

beforeEach(async () => {
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  await initializeJourney();
});

async function finishFirst() {
  for (let i = 0; i < 5; i++) await advancePilot(i);
  await advancePilot(5, 'help');
  expect((await readPilot()).scene).toBe(6);
}

async function completeReal(title = 'Atividade real') {
  const id = await createQuickTask({ title, requestId: crypto.randomUUID() });
  await completeTask(id);
  return id;
}

describe('capítulos experimentais', () => {
  it('permite terminar a história inicial sem pedir tarefas no meio', async () => {
    for (let i = 0; i < 5; i++) await advancePilot(i);
    expect((await db.activityEvents.count())).toBe(0);
    await expect(advancePilot(5)).rejects.toThrow('Escolha');
    await advancePilot(5, 'follow');
    expect(await readPilot()).toMatchObject({
      scene: 6,
      choice: 'follow',
      chapterOneEndXp: 0,
    });
    expect(await db.activityEvents.count()).toBe(0);
  });

  it('conta apenas XP posterior ao primeiro capítulo, e não número de tarefas', async () => {
    await completeReal('Atividade anterior');
    await finishFirst();
    const finished = await readPilot();
    const base = (await db.profile.get(1))!.totalXpEarned;
    expect(finished.chapterOneEndXp).toBe(base);
    expect(chapterTwoProgress(finished, base).earned).toBe(0);
    await expect(unlockChapterTwo()).rejects.toThrow('ainda não');

    await completeReal('Uma atividade nova');
    expect(chapterTwoProgress(finished, (await db.profile.get(1))!.totalXpEarned).earned).toBeGreaterThan(0);
    // We do not assume a fixed reward multiplier, only the published XP threshold.
    while ((await db.profile.get(1))!.totalXpEarned - base < CHAPTER_TWO_XP) {
      await completeReal('Mais uma atividade');
    }
    await unlockChapterTwo();
    expect((await readPilot()).chapterTwoUnlocked).toBe(true);
  });

  it('estorno antes do desbloqueio não conta, após desbloquear não retira o capítulo', async () => {
    await finishFirst();
    const id = await completeReal('Pode ser desfeito');
    await undoTask(id);
    expect(chapterTwoProgress(await readPilot(), (await db.profile.get(1))!.totalXpEarned).earned).toBe(0);
    await expect(unlockChapterTwo()).rejects.toThrow('ainda não');
    const ids: number[] = [];
    while ((await db.profile.get(1))!.totalXpEarned < CHAPTER_TWO_XP)
      ids.push(await completeReal('Outra atividade'));
    await unlockChapterTwo();
    await advanceChapterTwo(0);
    // The chapter remains accessible, even if the reward is later reversed.
    await undoTask(ids[ids.length - 1]);
    expect(await readPilot()).toMatchObject({
      chapterTwoUnlocked: true,
      chapterTwoScene: 1,
    });
  });

  it('migrates the old completed pilot without charging previous XP', async () => {
    await completeReal('Antes da atualização');
    const previousXp = (await db.profile.get(1))!.totalXpEarned;
    await db.profile.update(1, { rpgPilot: { scene: 6, choice: 'help' } });
    expect((await readPilot()).chapterOneEndXp).toBeUndefined();
    await expect(unlockChapterTwo()).rejects.toThrow('Ative primeiro');
    await initializeChapterTwoProgress();
    expect(await readPilot()).toMatchObject({ chapterOneEndXp: previousXp });
    expect(chapterTwoProgress(await readPilot(), previousXp).earned).toBe(0);
    await initializeChapterTwoProgress();
    expect((await readPilot()).chapterOneEndXp).toBe(previousXp);
  });

  it('guarda a escolha e o capítulo 2 no backup; protege contra cliques repetidos', async () => {
    await finishFirst();
    while ((await db.profile.get(1))!.totalXpEarned < CHAPTER_TWO_XP)
      await completeReal('Missão');
    await unlockChapterTwo();
    await advanceChapterTwo(0);
    await advanceChapterTwo(0);
    expect((await readPilot()).chapterTwoScene).toBe(1);
    const backup = await createJourneyBackup();
    expect(() => validateBackup(backup)).not.toThrow();
    await restoreJourneyBackup(backup);
    expect(await readPilot()).toMatchObject({
      scene: 6,
      choice: 'help',
      chapterTwoUnlocked: true,
      chapterTwoScene: 1,
    });
  });
});
