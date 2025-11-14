// src/services/projectService.ts
import { db, type HeroProject, type Task } from '$services/db';
import { xpService } from '$services/xpService';
import { browser } from '$app/environment';

export type HeroProjectStatus =
  | 'planejando'
  | 'em_andamento'
  | 'concluido'
  | 'pausado'
  | 'arquivado';

/**
 * Calcula o XP base total das missões de um projeto.
 * Ignora missões arquivadas.
 */
function getProjectBaseXp(tasks: Task[]): number {
  return tasks
    .filter((t) => !(t as any).archived)
    .reduce((sum, t) => sum + (t.xp || 0), 0);
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
 * - Soma XP base de todas as missões do projeto
 * - Se TODAS estiverem concluídas e o projeto ainda não recebeu recompensa:
 *   - Aplica +25% de XP extra (entra pelo xpService, então gera Gold normal)
 *   - Marca o projeto como `concluido` e `rewardGranted = true`
 */
export async function checkAndApplyProjectCompletionBonus(
  projectId: number,
): Promise<void> {
  if (!projectId) return;

  const project = await db.projects.get(projectId);
  if (!project) return;

  // Já recebeu recompensa antes? Não repete.
  if (project.rewardGranted) return;

  const tasks = await db.tasks.where('projectId').equals(projectId).toArray();

  if (!areAllProjectTasksCompleted(tasks)) {
    return;
  }

  const baseXp = getProjectBaseXp(tasks);
  if (baseXp <= 0) return;

  const bonusXp = Math.floor(baseXp * 0.25);

  // Aplica XP bônus (Gold vem automaticamente do xpService)
  await xpService.addXp(bonusXp, null);

  // Marca projeto como concluído e com recompensa aplicada
  await db.projects.update(projectId, {
    status: 'concluido',
    rewardGranted: true,
    updatedAt: new Date(),
  } as Partial<HeroProject>);

  // Feedback simples pro jogador (pode virar toast depois)
  if (browser) {
    const message = `Projeto concluído! Você recebeu +${bonusXp} XP extra (bônus de 25%).`;
    alert(message);
  }
}
