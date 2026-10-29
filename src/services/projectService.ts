import { db, type HeroProject, type Task } from './db';
import { completeProjectIfReady } from './taskService';
export {
  getProjectBaseXp,
  getProjectDifficultyInfoForTasks,
} from './projectRules';
export type { ProjectDifficultyKey } from './projectRules';
export type { HeroProjectStatus } from './db';
export async function checkAndApplyProjectCompletionBonus(
  projectId: number,
): Promise<void> {
  await completeProjectIfReady(projectId);
}

export type CreateHeroProjectInput = {
  name: string;
  vision?: string | null;
  targetDate?: Date | string | null;
  color?: string | null;
  icon?: string | null;
};

/**
 * Cria um novo projeto básico em estado "planejando".
 */
export async function createHeroProject(
  input: CreateHeroProjectInput,
): Promise<number> {
  const now = new Date();

  const payload: HeroProject = {
    name: input.name.trim(),
    vision: input.vision ?? null,
    status: 'planejando',
    createdAt: now,
    updatedAt: now,
    targetDate: input.targetDate ?? null,
    color: input.color ?? null,
    icon: input.icon ?? null,
    rewardGranted: false,
  };

  const id = await db.projects.add(payload);
  return id;
}

/**
 * Exclui um projeto e desassocia suas missões (projectId = null).
 * Não apaga as tarefas, só tira o vínculo.
 */
export async function deleteHeroProject(projectId: number): Promise<void> {
  if (!projectId) return;

  await db.transaction('rw', db.projects, db.tasks, async () => {
    // solta o vínculo das tasks
    await db.tasks
      .where('projectId')
      .equals(projectId)
      .modify({ projectId: null } as Partial<Task>);

    // remove o projeto
    await db.projects.delete(projectId);
  });
}
