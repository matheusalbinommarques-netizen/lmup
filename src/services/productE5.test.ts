import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { db, type Task } from './db';
import { initializeJourney } from './profileService';
import { createQuickTask, beginTask, setTaskStep } from './journeyService';
import { saveTaskDefinition } from './taskDefinitionService';
import { saveHeroProject, changeProjectStatus } from './projectService';
import { completeTask, undoTask } from './taskService';
import { configureReview } from './reviewService';
import { calendarDate, addCalendarDays, formatCalendar } from './calendar';
import {
  createJourneyBackup,
  restoreJourneyBackup,
  validateBackup,
} from './backupDataService';
import {
  invalidateHeroModifiersCache,
  buildHeroModifiersFromOwned,
} from './gearService';
import { getActiveCompanionBuffs, feedCompanion } from './companionService';
import { calculateReward } from './rewardService';
import { getProjectDifficultyInfoForTasks } from './projectRules';
import {
  ALL_ACHIEVEMENTS,
  createAchievementStats,
} from './achievementsCatalog';
import { MAX_LEVEL, getLevelStateFromTotalXp } from './progression';
beforeEach(async () => {
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  invalidateHeroModifiersCache();
  await initializeJourney();
});
afterEach(() => vi.useRealTimers());
const mission = (extra: Partial<Parameters<typeof createQuickTask>[0]> = {}) =>
  createQuickTask({
    title: 'Missão',
    requestId: crypto.randomUUID(),
    ...extra,
  });
const project = (extra: Partial<Parameters<typeof saveHeroProject>[0]> = {}) =>
  saveHeroProject({ name: 'Projeto', ...extra });
async function edit(
  id: number,
  extra: Partial<Parameters<typeof saveTaskDefinition>[0]> = {},
) {
  const task = (await db.tasks.get(id))!;
  return saveTaskDefinition({
    title: task.title,
    requestId: crypto.randomUUID(),
    editId: id,
    expectedRevision: task.definitionRevision ?? 0,
    steps: task.subtasks,
    description: task.description ?? '',
    areaId: task.areaId,
    projectId: task.projectId,
    projectStageId: task.projectStageId,
    effort: task.effort,
    ...extra,
  });
}
describe('calendário e projetos', () => {
  it('datas novas e legadas preservam o dia de calendário', () => {
    expect(calendarDate('2026-10-29')).toBe('2026-10-29');
    expect(calendarDate('2026-10-29T00:00:00.000Z')).toBe('2026-10-29');
    expect(calendarDate(new Date('2026-10-29T00:00:00Z'))).toBe('2026-10-29');
    expect(formatCalendar('2026-10-29T00:00:00Z')).toBe('29/10/2026');
    expect(addCalendarDays('2024-02-28', 1)).toBe('2024-02-29');
    expect(addCalendarDays('2026-12-31', 1)).toBe('2027-01-01');
  });
  it.each([
    '2026-02-30',
    '2026-13-01',
    '2026-00-10',
    'abc',
    '2026-10-29Tinválida',
  ])('recusa data inválida %s', (value) => {
    expect(() => calendarDate(value)).toThrow('calendário');
  });
  it('criação é idempotente e edição antiga não sobrescreve outra aba', async () => {
    const requestId = crypto.randomUUID();
    const ids = await Promise.all([1, 2].map(() => project({ requestId })));
    expect(ids[0]).toBe(ids[1]);
    await saveHeroProject(
      { name: 'Editado', targetDate: '2026-12-01' },
      ids[0],
      1,
    );
    await expect(
      saveHeroProject({ name: 'Antigo' }, ids[0], 1),
    ).rejects.toThrow('outra aba');
    expect(await db.projects.get(ids[0])).toMatchObject({
      name: 'Editado',
      targetDate: '2026-12-01',
    });
  });
  it('etapas com missões não desaparecem silenciosamente', async () => {
    const id = await project({ stages: [{ id: 'a', title: 'Primeira' }] });
    await mission({ projectId: id, projectStageId: 'a' });
    await expect(
      saveHeroProject({ name: 'Mudado', stages: [] }, id, 1),
    ).rejects.toThrow('missões');
    expect((await db.projects.get(id))?.name).toBe('Projeto');
  });
  it('conclusão e reabertura mantêm tarefas e bônus consistentes', async () => {
    const pid = await project();
    const id = await mission({ projectId: pid });
    await completeTask(id);
    expect((await db.profile.get(1))?.totalXpEarned).toBe(58);
    await changeProjectStatus(pid, 'em_andamento');
    expect(await db.profile.get(1)).toMatchObject({
      totalXpEarned: 53,
      gold: 25,
      food: 2,
    });
    expect((await db.tasks.get(id))?.completed).toBe(true);
    await changeProjectStatus(pid, 'concluido');
    await changeProjectStatus(pid, 'concluido');
    expect((await db.profile.get(1))?.totalXpEarned).toBe(58);
  });
  it('criar trabalho novo reabre sem inflar o bônus por edição de uma missão concluída', async () => {
    const pid = await project();
    const a = await mission({ projectId: pid });
    await completeTask(a);
    await edit(a, { effort: 'deep' });
    const b = await mission({ projectId: pid });
    expect((await db.profile.get(1))?.totalXpEarned).toBe(53);
    await completeTask(b);
    const bonus = (await db.activityEvents.toArray()).filter(
      (event) => event.kind === 'project' && !event.reversedAt,
    );
    expect(bonus).toHaveLength(1);
    expect(bonus[0].baseXp).toBe(10);
    expect((await db.profile.get(1))?.totalXpEarned).toBe(117);
  });
  it('saldo gasto impede reabertura e inclusão parcial de missão', async () => {
    const pid = await project();
    const id = await mission({ projectId: pid });
    await completeTask(id);
    await feedCompanion(1, 3);
    await expect(mission({ projectId: pid })).rejects.toThrow('utilizada');
    expect(await db.tasks.count()).toBe(1);
    expect((await db.projects.get(pid))?.rewardGranted).toBe(true);
  });
  it('arquivar preserva vínculos e restaurar não concede recompensa', async () => {
    const pid = await project();
    const id = await mission({ projectId: pid });
    await completeTask(id);
    await changeProjectStatus(pid, 'arquivado');
    await changeProjectStatus(pid, 'em_andamento');
    expect(await db.projects.get(pid)).toMatchObject({
      status: 'concluido',
      rewardGranted: true,
    });
    expect((await db.tasks.get(id))?.projectId).toBe(pid);
    expect(await db.activityEvents.count()).toBe(2);
  });
  it('projeto pausado não concede bônus até ser retomado e encerrado', async () => {
    const pid = await project();
    const id = await mission({ projectId: pid });
    await changeProjectStatus(pid, 'pausado');
    await completeTask(id);
    expect((await db.profile.get(1))?.totalXpEarned).toBe(53);
    await changeProjectStatus(pid, 'em_andamento');
    await changeProjectStatus(pid, 'concluido');
    expect((await db.profile.get(1))?.totalXpEarned).toBe(58);
  });
  it('mover missão concluída exige desfazer, preservando origem da recompensa', async () => {
    const pid = await project();
    const id = await mission({ projectId: pid });
    await completeTask(id);
    await expect(edit(id, { projectId: null })).rejects.toThrow('Desfaça');
    expect((await db.tasks.get(id))?.projectId).toBe(pid);
  });
});
describe('etapas do projeto', () => {
  it('etapa vazia mantém o projeto em aberto até receber trabalho ou ser removida', async () => {
    const pid = await project({
      stages: [
        { id: 'a', title: 'Primeiro' },
        { id: 'b', title: 'Depois' },
      ],
    });
    const a = await mission({ projectId: pid, projectStageId: 'a' });
    await completeTask(a);
    expect((await db.projects.get(pid))?.rewardGranted).toBe(false);
    await expect(changeProjectStatus(pid, 'concluido')).rejects.toThrow(
      'etapas vazias',
    );
    const b = await mission({ projectId: pid, projectStageId: 'b' });
    await completeTask(b);
    expect((await db.projects.get(pid))?.rewardGranted).toBe(true);
    expect((await db.profile.get(1))?.totalXpEarned).toBe(117);
  });
});
describe('esforço, equipamentos e limites', () => {
  it('mais passos não aumentam XP; legado é preservado até escolha explícita', async () => {
    const a = await mission();
    const b = await mission({
      steps: Array.from({ length: 20 }, (_, index) => `Passo ${index}`),
    });
    expect((await db.tasks.get(a))?.xp).toBe(50);
    expect((await db.tasks.get(b))?.xp).toBe(50);
    const old = await db.tasks.add({
      title: 'Legada',
      xp: 500,
      rarity: 'legendary',
      createdAt: new Date(),
    });
    await edit(old);
    expect((await db.tasks.get(old))?.xp).toBe(500);
    await edit(old, { effort: 'deep' });
    expect(await db.tasks.get(old)).toMatchObject({
      xp: 250,
      rarity: 'legendary',
    });
  });
  it('percentual de projeto não cresce com contagem de tarefas', () => {
    const task = { xp: 50 } as Task;
    expect(getProjectDifficultyInfoForTasks([task]).bonusXpFraction).toBe(0.1);
    expect(
      getProjectDifficultyInfoForTasks(Array(20).fill(task)).bonusXpFraction,
    ).toBe(0.1);
  });
  it('espada altera XP efetivo de missão e prévia, sem alterar o bônus de projeto', async () => {
    await db.ownedShopItems.add({
      itemId: 105,
      equipped: true,
      acquiredAt: new Date().toISOString(),
    });
    const profile = (await db.profile.get(1))!;
    const quote = calculateReward(
      50,
      profile,
      await buildHeroModifiersFromOwned(),
      await getActiveCompanionBuffs(),
    );
    const pid = await project();
    const id = await mission({ projectId: pid });
    const event = await completeTask(id);
    expect(event?.reward.xp).toBe(55);
    expect(event?.reward).toEqual({
      xp: quote.xp,
      gold: quote.gold,
      food: quote.food,
    });
    expect(
      (await db.activityEvents.toArray()).find(
        (item) => item.kind === 'project',
      )?.reward.xp,
    ).toBe(5);
  });
  it('limite atual permanece 30 e metas superiores estão identificadas como futuras', () => {
    expect(MAX_LEVEL).toBe(30);
    expect(getLevelStateFromTotalXp(250000).level).toBe(30);
    expect(ALL_ACHIEVEMENTS.find((item) => item.id === 'mestre')?.future).toBe(
      true,
    );
    expect(
      ALL_ACHIEVEMENTS.find((item) => item.id === 'semideus')?.future,
    ).toBe(true);
    expect(
      ALL_ACHIEVEMENTS.find((item) => item.id === 'apice-atual')?.condition(
        createAchievementStats({ level: 30 }),
      ),
    ).toBe(true);
  });
});
describe('sessões de revisão', () => {
  it('uma tarefa tem sessões distintas, sem prêmio repetido no mesmo dia, e desfazer preserva a sessão anterior e o bônus', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-10T12:00:00-03:00'));
    const pid = await project();
    const id = await mission({ projectId: pid });
    await configureReview(id, {
      enabled: true,
      intervalDays: 1,
      dueDate: '2026-10-10',
    });
    await Promise.all([
      completeTask(id, { reviewOutcome: 'partial' }),
      completeTask(id),
    ]);
    expect(await db.tasks.count()).toBe(1);
    expect((await db.profile.get(1))?.totalXpEarned).toBe(58);
    await expect(
      configureReview(id, {
        enabled: true,
        intervalDays: 1,
        dueDate: '2026-10-10',
      }),
    ).rejects.toThrow('amanhã');
    await db.tasks.update(id, { reviewDueDate: '2026-10-10' });
    expect(await completeTask(id)).toBeNull();
    vi.setSystemTime(new Date('2026-10-11T12:00:00-03:00'));
    await completeTask(id, { reviewOutcome: 'recalled' });
    expect((await db.profile.get(1))?.totalXpEarned).toBe(111);
    await undoTask(id);
    expect((await db.profile.get(1))?.totalXpEarned).toBe(58);
    expect((await db.projects.get(pid))?.rewardGranted).toBe(true);
    expect((await db.tasks.get(id))?.completed).toBe(true);
    await completeTask(id, { reviewOutcome: 'again' });
    expect((await db.profile.get(1))?.totalXpEarned).toBe(111);
    const sessions = (await db.activityEvents.toArray()).filter(
      (event) => event.kind === 'review' && !event.reversedAt,
    );
    expect(sessions).toHaveLength(2);
    expect(sessions[1].reviewOutcome).toBe('again');
  });
  it('revisão de missão concluída legada não apaga conclusão nem exige estornar bônus desconhecido', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-10T12:00:00-03:00'));
    const pid = await db.projects.add({
      name: 'Antigo',
      status: 'concluido',
      rewardGranted: true,
      createdAt: new Date(),
    });
    const id = await db.tasks.add({
      title: 'Antiga',
      xp: 50,
      rarity: 'common',
      completed: true,
      status: 'completed',
      projectId: pid,
      createdAt: new Date('2026-01-01'),
    });
    await configureReview(id, {
      enabled: true,
      intervalDays: 7,
      dueDate: '2026-10-10',
    });
    await completeTask(id);
    await undoTask(id);
    expect(await db.tasks.get(id)).toMatchObject({
      completed: true,
      completionEventId: null,
    });
    expect((await db.projects.get(pid))?.rewardGranted).toBe(true);
    expect((await db.profile.get(1))?.totalXpEarned).toBe(0);
  });
  it('falha ao registrar metadados da sessão reverte tarefa, evento e saldo', async () => {
    const id = await mission();
    await configureReview(id, {
      enabled: true,
      intervalDays: 7,
      dueDate: '2020-01-01',
    });
    const failure = () => {
      throw new Error('Falha simulada');
    };
    db.activityEvents.hook('updating', failure);
    try {
      await expect(completeTask(id)).rejects.toThrow('simulada');
    } finally {
      db.activityEvents.hook('updating').unsubscribe(failure);
    }
    expect(await db.activityEvents.count()).toBe(0);
    expect(await db.xpLogs.count()).toBe(0);
    expect((await db.profile.get(1))?.totalXpEarned).toBe(0);
  });
  it('backup conserva etapas, esforço, sessões e programação; referências inválidas não substituem dados', async () => {
    const pid = await project({ stages: [{ id: 'a', title: 'Primeiro' }] });
    const id = await mission({
      projectId: pid,
      projectStageId: 'a',
      effort: 'medium',
    });
    await configureReview(id, {
      enabled: true,
      intervalDays: 7,
      dueDate: '2020-01-01',
    });
    await completeTask(id, { reviewOutcome: 'recalled' });
    const backup = JSON.parse(JSON.stringify(await createJourneyBackup()));
    await restoreJourneyBackup(backup);
    expect(await db.tasks.get(id)).toMatchObject({
      effort: 'medium',
      projectStageId: 'a',
      reviewEnabled: true,
    });
    expect(
      (await db.activityEvents.toArray()).find(
        (event) => event.kind === 'review',
      )?.reviewOutcome,
    ).toBe('recalled');
    backup.data.tasks[0].projectStageId = 'inexistente';
    expect(() => validateBackup(backup)).toThrow('etapa');
  });
  it('sessões com passos têm marcações próprias e desfazer permite retomar sem perder os passos', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-10T12:00:00-03:00'));
    const id = await mission({ steps: ['Um passo'] });
    await configureReview(id, {
      enabled: true,
      intervalDays: 1,
      dueDate: '2026-10-10',
    });
    await beginTask(id);
    await setTaskStep(id, 0, true);
    await completeTask(id);
    vi.setSystemTime(new Date('2026-10-11T12:00:00-03:00'));
    await expect(completeTask(id)).rejects.toThrow('Abra a sessão');
    await beginTask(id);
    expect((await db.tasks.get(id))?.completedSubtasks).toEqual([]);
    await setTaskStep(id, 0, true);
    await completeTask(id);
    await undoTask(id);
    await beginTask(id);
    expect((await db.tasks.get(id))?.completedSubtasks).toEqual([0]);
    const backup = JSON.parse(JSON.stringify(await createJourneyBackup()));
    expect(() => validateBackup(backup)).not.toThrow();
  });
  it('sessão em andamento da etapa anterior preserva suas marcações', async () => {
    const id = await mission({ steps: ['Um passo'] });
    const task = (await db.tasks.get(id))!;
    await db.tasks.update(id, {
      reviewEnabled: true,
      reviewDueDate: '2020-01-01',
      reviewSession: new Date(task.createdAt).toISOString(),
      executionState: 'active',
      completedSubtasks: [0],
    });
    await beginTask(id);
    expect((await db.tasks.get(id))?.completedSubtasks).toEqual([0]);
  });
});
