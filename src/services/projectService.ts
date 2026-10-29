import { db, type HeroProjectStatus } from './db';
import { completeProjectIfReady } from './taskService';
import { reopenProjectForWork } from './projectLifecycle';
import { calendarDate } from './calendar';
export {
  getProjectBaseXp,
  getProjectDifficultyInfoForTasks,
} from './projectRules';
export type { ProjectDifficultyKey } from './projectRules';
export type { HeroProjectStatus } from './db';
export async function checkAndApplyProjectCompletionBonus(id: number) {
  await completeProjectIfReady(id);
}
export type CreateHeroProjectInput = {
  name: string;
  vision?: string | null;
  targetDate?: Date | string | null;
  color?: string | null;
  icon?: string | null;
  stages?: { id: string; title: string }[];
  requestId?: string;
};
export async function saveHeroProject(
  input: CreateHeroProjectInput,
  id?: number,
  expectedRevision = 0,
): Promise<number> {
  const name = input.name.trim(),
    vision = input.vision?.trim() ?? '';
  if (!name || name.length > 160)
    throw new Error('Escolha um nome de até 160 caracteres.');
  if (vision.length > 10000)
    throw new Error('O objetivo precisa ter até 10 mil caracteres.');
  const targetDate = calendarDate(input.targetDate);
  const stages = (input.stages ?? []).map((stage) => ({
    id: stage.id,
    title: stage.title.trim(),
  }));
  if (
    stages.length > 50 ||
    stages.some(
      (stage) => !stage.id || !stage.title || stage.title.length > 160,
    ) ||
    new Set(stages.map((stage) => stage.id)).size !== stages.length
  )
    throw new Error(
      'Use até 50 etapas com nomes preenchidos e identificadores distintos.',
    );
  return db.transaction('rw', db.tables, async () => {
    const current = id ? await db.projects.get(id) : undefined;
    if (id && !current) throw new Error('O projeto não está mais disponível.');
    if (current && (current.revision ?? 0) !== expectedRevision)
      throw new Error(
        'O projeto mudou em outra aba. Reabra a edição para comparar suas alterações.',
      );
    if (!id && input.requestId) {
      const prior = await db.projects
        .filter((project) => project.creationKey === input.requestId)
        .first();
      if (prior?.id) return prior.id;
    }
    if (current) {
      const tasks = await db.tasks.where('projectId').equals(id!).toArray();
      if (
        tasks.some(
          (task) =>
            task.projectStageId &&
            !stages.some((stage) => stage.id === task.projectStageId),
        )
      )
        throw new Error(
          'Uma etapa removida ainda tem missões. Mova as missões antes de removê-la.',
        );
      await db.projects.update(id!, {
        name,
        vision,
        targetDate,
        stages,
        updatedAt: new Date(),
        revision: (current.revision ?? 0) + 1,
      });
      return id!;
    }
    return db.projects.add({
      name,
      vision,
      targetDate,
      stages,
      status: 'planejando',
      createdAt: new Date(),
      updatedAt: new Date(),
      rewardGranted: false,
      rewardPolicy: 'effort-v1',
      revision: 1,
      creationKey: input.requestId,
      color: input.color ?? null,
      icon: input.icon ?? null,
    });
  });
}
export async function createHeroProject(input: CreateHeroProjectInput) {
  return saveHeroProject(input);
}
export async function changeProjectStatus(
  id: number,
  status: HeroProjectStatus,
) {
  await db.transaction('rw', db.tables, async () => {
    const project = await db.projects.get(id);
    if (!project) throw new Error('O projeto não está mais disponível.');
    if (status === 'concluido') {
      if (project.rewardGranted) return;
      const tasks = await db.tasks.where('projectId').equals(id).toArray();
      if (
        project.stages?.some(
          (stage) =>
            !tasks.some(
              (task) => !task.archived && task.projectStageId === stage.id,
            ),
        )
      )
        throw new Error(
          'Há etapas vazias. Associe missões ou remova as etapas que não fazem mais sentido antes de concluir.',
        );
      const result = await completeProjectIfReady(id);
      if (!result)
        throw new Error(
          'Conclua todas as missões ativas antes de encerrar o projeto. Projetos vazios, pausados ou arquivados não concedem bônus.',
        );
      return;
    }
    if (
      project.status === 'arquivado' &&
      status === 'em_andamento' &&
      project.rewardGranted
    ) {
      await db.projects.update(id, {
        status: 'concluido',
        revision: (project.revision ?? 0) + 1,
      });
      return;
    }
    if (
      (status === 'em_andamento' || status === 'planejando') &&
      project.rewardGranted
    )
      await reopenProjectForWork(id);
    await db.projects.update(id, {
      status,
      updatedAt: new Date(),
      revision: (project.revision ?? 0) + 1,
    });
  });
}
// Kept for older callers; archiving preserves task links and reward provenance.
export async function deleteHeroProject(id: number) {
  await changeProjectStatus(id, 'arquivado');
}
