// src/services/projectService.ts
import { db, type HeroProject, type Task } from '$services/db';
import { xpService } from '$services/xpService';
import { browser } from '$app/environment';
import { getHeroModifiersOnce } from '$services/gearService';

export type HeroProjectStatus =
  | 'planejando'
  | 'em_andamento'
  | 'concluido'
  | 'pausado'
  | 'arquivado';

// Dificuldade baseada na quantidade de missões ligadas ao projeto
export type ProjectDifficultyKey =
  | 'none'
  | 'facil'
  | 'media'
  | 'dificil'
  | 'expert';

// Tabela de bônus de XP por dificuldade (em fração: 0.1 = 10%)
const BONUS_BY_DIFFICULTY: Record<ProjectDifficultyKey, number> = {
  none: 0,
  facil: 0.1, // Fácil
  media: 0.15, // Média
  dificil: 0.2, // Difícil
  expert: 0.25, // Expert
};

/**
 * Calcula o XP base total das missões de um projeto.
 * Ignora missões arquivadas.
 */
export function getProjectBaseXp(tasks: Task[]): number {
  return tasks
    .filter((t) => !(t as any).archived)
    .reduce((sum, t) => sum + (t.xp || 0), 0);
}

/**
 * Dado o número de missões ativas, retorna a dificuldade.
 *
 * 0 missões → "none" (sem bônus)
 * 1–2      → fácil
 * 3–4      → média
 * 5–9      → difícil
 * 10+      → expert
 */
function getDifficultyKeyFromTaskCount(
  taskCount: number,
): ProjectDifficultyKey {
  if (taskCount <= 0) return 'none';
  if (taskCount <= 2) return 'facil';
  if (taskCount <= 4) return 'media';
  if (taskCount <= 9) return 'dificil';
  return 'expert';
}

/**
 * Helper para UI: retorna quantas missões ativas o projeto tem,
 * em qual dificuldade ele cai e qual o bônus de XP em % (0–100).
 */
export function getProjectDifficultyInfoForTasks(tasks: Task[]) {
  const activeTasks = tasks.filter((t) => !(t as any).archived);
  const totalTasks = activeTasks.length;
  const key = getDifficultyKeyFromTaskCount(totalTasks);
  const bonusFraction = BONUS_BY_DIFFICULTY[key] ?? 0;

  return {
    totalTasks,
    difficultyKey: key,
    bonusXpFraction: bonusFraction, // ex: 0.1
    bonusXpPercent: Math.round(bonusFraction * 100), // ex: 10
  };
}

/**
 * Verifica se TODAS as missões ativas de um projeto estão concluídas.
 * - Ignora missões arquivadas
 * - Considera concluída se `completed === true` ou status === 'completed'
 */
function areAllProjectTasksCompleted(tasks: Task[]): boolean {
  const activeTasks = tasks.filter((t) => !(t as any).archived);
  if (activeTasks.length === 0) return false;

  return activeTasks.every((t) => {
    const anyTask = t as any;
    return t.completed === true || anyTask.status === 'completed';
  });
}

/**
 * Regra de bônus:
 * - Soma XP base de todas as missões do projeto (ignorando arquivadas)
 * - Descobre quantas missões ativas existem e, com isso, a dificuldade
 * - Se TODAS estiverem concluídas e o projeto ainda não recebeu recompensa:
 *   - Aplica bônus de XP com base na dificuldade
 *   - Soma bônus extra do elmo (projectBonusExtraFraction), se existir
 *   - XP vai pro xpService, que cuida de Santuário e Gold
 * - Marca projeto como `concluido` e `rewardGranted = true`
 */
export async function checkAndApplyProjectCompletionBonus(
  projectId: number,
): Promise<void> {
  if (!projectId) return;

  const project = await db.projects.get(projectId);
  if (!project) return;

  // Já recebeu recompensa antes? Não repete.
  if (project.rewardGranted) return;

  const allTasks = await db.tasks
    .where('projectId')
    .equals(projectId)
    .toArray();

  if (!areAllProjectTasksCompleted(allTasks)) {
    return;
  }

  // Só consideramos missões ativas para XP e dificuldade
  const activeTasks = allTasks.filter((t) => !(t as any).archived);
  if (activeTasks.length === 0) return;

  const baseXp = getProjectBaseXp(activeTasks);
  if (baseXp <= 0) return;

  const { bonusXpFraction } = getProjectDifficultyInfoForTasks(activeTasks);

  // Sem dificuldade válida → sem bônus, mesmo com elmo
  if (bonusXpFraction <= 0) {
    return;
  }

  // Lê modificadores do gear (elmo lendário etc.)
  const mods = await getHeroModifiersOnce();
  const extraFraction = mods.projectBonusExtraFraction ?? 0;

  // bônus final = bônus da dificuldade + extra do elmo
  const finalBonusFraction = bonusXpFraction + extraFraction;

  if (finalBonusFraction <= 0) return;

  // XP base de bônus pela dificuldade + gear
  const bonusXpBase = Math.floor(baseXp * finalBonusFraction);
  const finalBonusPercent = Math.round(finalBonusFraction * 100);

  // Aplica XP bônus (Gold e bônus do Santuário vêm do xpService)
  await xpService.addXp(bonusXpBase, null);

  // Marca projeto como concluído e com recompensa aplicada
  await db.projects.update(projectId, {
    status: 'concluido',
    rewardGranted: true,
    updatedAt: new Date(),
  } as Partial<HeroProject>);

  // Feedback simples pro jogador (pode virar toast depois)
  if (browser) {
    const message = `Projeto concluído! Bônus de dificuldade: +${finalBonusPercent}% sobre ${baseXp} XP base → +${bonusXpBase} XP (antes do Santuário).`;
    alert(message);
  }
}

/* ------------------------------------------------------------------
 * CRUD simples de projetos
 * -----------------------------------------------------------------*/

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
