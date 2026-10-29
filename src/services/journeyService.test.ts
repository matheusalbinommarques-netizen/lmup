import { beforeEach, describe, expect, it } from 'vitest';
import { db, type Task } from './db';
import { initializeJourney } from './profileService';
import {
  createQuickTask,
  beginTask,
  setTaskStep,
  saveTaskNotes,
  pauseTask,
  planTask,
  pinTask,
  selectNext,
  taskSteps,
} from './journeyService';
import { completeTask, undoTask } from './taskService';
import {
  createJourneyBackup,
  restoreJourneyBackup,
  validateBackup,
} from './backupDataService';
import { invalidateHeroModifiersCache } from './gearService';
beforeEach(async () => {
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  invalidateHeroModifiersCache();
  await initializeJourney();
});
const create = (title = 'Missão real', steps: string[] = []) =>
  createQuickTask({ title, steps, requestId: crypto.randomUUID() });
describe('jornada real', () => {
  it('criação repetida é idempotente e não adiciona ao plano sem escolha', async () => {
    const requestId = crypto.randomUUID();
    const ids = await Promise.all(
      [1, 2, 3].map(() => createQuickTask({ title: 'Ideia', requestId })),
    );
    expect(new Set(ids).size).toBe(1);
    expect(await db.tasks.count()).toBe(1);
    expect((await db.tasks.get(ids[0]))?.plannedDate).toBeNull();
  });
  it('persiste passos e notas; concluir exige os passos e desfazer preserva o trabalho', async () => {
    const id = await create('Missão', ['Primeiro', 'Segundo']);
    await beginTask(id);
    await setTaskStep(id, 0, true);
    await saveTaskNotes(id, 'Descoberta pessoal', 0);
    await pauseTask(id);
    await expect(completeTask(id)).rejects.toThrow('passos');
    expect(await db.profile.get(1)).toMatchObject({ totalXpEarned: 0 });
    await beginTask(id);
    await setTaskStep(id, 1, true);
    await completeTask(id);
    expect(await db.tasks.get(id)).toMatchObject({
      executionNotes: 'Descoberta pessoal',
      completedSubtasks: [0, 1],
      completed: true,
      executionState: 'idle',
    });
    await undoTask(id);
    expect(await db.tasks.get(id)).toMatchObject({
      executionNotes: 'Descoberta pessoal',
      completedSubtasks: [0, 1],
      completed: false,
    });
  });
  it('alterações de passos concorrentes não apagam outros passos', async () => {
    const id = await create('Missão', ['Um', 'Dois']);
    await Promise.all([setTaskStep(id, 0, true), setTaskStep(id, 1, true)]);
    expect((await db.tasks.get(id))?.completedSubtasks?.sort()).toEqual([0, 1]);
  });
  it('notas antigas não sobrescrevem notas salvas por outra aba sem decisão explícita', async () => {
    const id = await create();
    expect(await saveTaskNotes(id, 'Da primeira aba', 0)).toBe(1);
    await expect(saveTaskNotes(id, 'Rascunho da segunda', 0)).rejects.toThrow(
      'outra aba',
    );
    expect((await db.tasks.get(id))?.executionNotes).toBe('Da primeira aba');
    expect(await saveTaskNotes(id, 'Rascunho da segunda', 0, true)).toBe(2);
  });
  it('falha ao salvar preserva notas e revisão anteriores', async () => {
    const id = await create();
    await saveTaskNotes(id, 'Original', 0);
    const failure = () => {
      throw new Error('Falha de escrita simulada');
    };
    db.tasks.hook('updating', failure);
    try {
      await expect(saveTaskNotes(id, 'Novo', 1)).rejects.toThrow('simulada');
    } finally {
      db.tasks.hook('updating').unsubscribe(failure);
    }
    expect(await db.tasks.get(id)).toMatchObject({
      executionNotes: 'Original',
      notesRevision: 1,
    });
  });
  it('fixa apenas uma missão e prioriza em andamento antes da fixada e do plano', async () => {
    const a = await create('A');
    const b = await create('B');
    const c = await create('C');
    await pinTask(a, true);
    await pinTask(b, true);
    await planTask(c, true);
    expect((await db.tasks.get(a))?.pinned).toBe(false);
    expect(selectNext(await db.tasks.toArray())?.task.id).toBe(b);
    await beginTask(a);
    expect(selectNext(await db.tasks.toArray())?.task.id).toBe(a);
    await completeTask(a);
    await completeTask(b);
    expect(selectNext(await db.tasks.toArray())?.task.id).toBe(c);
  });
  it('progresso novo sobrevive à exportação e restauração', async () => {
    const id = await create('Plano', ['Um', 'Dois']);
    await planTask(id, true);
    await pinTask(id, true);
    await beginTask(id);
    await setTaskStep(id, 0, true);
    await saveTaskNotes(id, 'Guardar isto', 0);
    const backup = JSON.parse(JSON.stringify(await createJourneyBackup()));
    await restoreJourneyBackup(backup);
    expect(await db.tasks.get(id)).toMatchObject({
      executionNotes: 'Guardar isto',
      completedSubtasks: [0],
      pinned: true,
      executionState: 'active',
    });
    backup.data.tasks[0].executionState = 'inválido';
    expect(() => validateBackup(backup)).toThrow('estado');
  });
  it('passos legados mantêm os índices ao ignorar linhas vazias', () => {
    const task = {
      subtasks: [' Primeiro ', '', 'Terceiro'],
      completedSubtasks: [2],
    } as Task;
    expect(taskSteps(task)).toEqual([
      { index: 0, label: 'Primeiro' },
      { index: 2, label: 'Terceiro' },
    ]);
  });
  it('campos inválidos e relação inexistente não gravam tarefa parcial', async () => {
    await expect(create('  ')).rejects.toThrow('título');
    await expect(
      createQuickTask({
        title: 'Projeto ausente',
        requestId: crypto.randomUUID(),
        projectId: 999,
      }),
    ).rejects.toThrow('projeto');
    expect(await db.tasks.count()).toBe(0);
  });
});
