import { db, type Task } from './db';
import { effortDefinition, type Effort } from './effort';
import { reopenProjectForWork } from './projectLifecycle';
import { dateKey } from './rewardService';
export type TaskDefinitionInput = {
  title: string;
  requestId: string;
  steps?: string[];
  description?: string;
  projectId?: number | null;
  projectStageId?: string | null;
  areaId?: number;
  planToday?: boolean;
  heroName?: string;
  effort?: Effort;
  editId?: number;
  expectedRevision?: number;
};
export async function saveTaskDefinition(
  input: TaskDefinitionInput,
): Promise<number> {
  const title = input.title.trim();
  if (!title || title.length > 160)
    throw new Error('Escreva um título de até 160 caracteres.');
  if (!input.requestId || input.requestId.length > 100)
    throw new Error('Reabra o formulário para tentar novamente.');
  const steps = (input.steps ?? []).map((step) => step.trim()).filter(Boolean);
  if (steps.length > 100 || steps.some((step) => step.length > 500))
    throw new Error('Use até 100 passos, com até 500 caracteres cada.');
  if ((input.description?.length ?? 0) > 10000)
    throw new Error('A descrição precisa ter até 10 mil caracteres.');
  return db.transaction('rw', db.tables, async () => {
    const current = input.editId ? await db.tasks.get(input.editId) : undefined;
    if (input.editId && (!current || current.archived))
      throw new Error('Esta missão não está mais disponível.');
    if (
      current &&
      (current.definitionRevision ?? 0) !== (input.expectedRevision ?? 0)
    )
      throw new Error(
        'A missão mudou em outra aba. Reabra a edição para comparar suas alterações.',
      );
    if (!current) {
      const prior = await db.tasks
        .filter((task) => task.creationKey === input.requestId)
        .first();
      if (prior?.id) return prior.id;
    }
    const projectId = input.projectId ?? null;
    const project = projectId ? await db.projects.get(projectId) : undefined;
    if (projectId && !project)
      throw new Error('O projeto não está mais disponível.');
    if (
      input.projectStageId &&
      !project?.stages?.some((stage) => stage.id === input.projectStageId)
    )
      throw new Error('A etapa mudou. Escolha uma etapa disponível.');
    if (input.areaId && !(await db.areas.get(input.areaId)))
      throw new Error('A área não está mais disponível.');
    if (current?.completed && (current.projectId ?? null) !== projectId)
      throw new Error(
        'Desfaça a conclusão antes de mover esta missão para outro projeto.',
      );
    if (
      projectId &&
      (!current?.completed || (current.projectId ?? null) !== projectId)
    )
      await reopenProjectForWork(projectId);
    if (
      current?.projectId &&
      current.projectId !== projectId &&
      !current.completed
    )
      await reopenProjectForWork(current.projectId);
    const definition = input.effort
      ? effortDefinition(input.effort)
      : current
        ? { xp: current.xp, rarity: current.rarity }
        : effortDefinition('small');
    const now = new Date().toISOString();
    const content: Partial<Task> = {
      title,
      subtasks: steps,
      description: input.description?.trim() ?? '',
      projectId,
      projectStageId: input.projectStageId ?? null,
      areaId: input.areaId ?? 0,
      xp: definition.xp,
      rarity: definition.rarity,
      effort:
        input.effort ?? current?.effort ?? (current ? undefined : 'small'),
      definitionRevision: (current?.definitionRevision ?? 0) + 1,
      updatedAt: now,
    };
    let id: number;
    if (current) {
      if (JSON.stringify(current.subtasks ?? []) !== JSON.stringify(steps))
        content.completedSubtasks = [];
      await db.tasks.update(current.id!, content);
      id = current.id!;
    } else
      id = await db.tasks.add({
        ...content,
        title,
        xp: definition.xp,
        rarity: definition.rarity,
        completed: false,
        status: 'available',
        createdAt: now,
        creationKey: input.requestId,
        plannedDate: input.planToday ? dateKey() : null,
      } as Task);
    if (input.heroName?.trim())
      await db.profile.update(1, { name: input.heroName.trim().slice(0, 80) });
    return id;
  });
}
