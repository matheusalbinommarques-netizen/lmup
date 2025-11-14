// src/services/projectService.ts
import { db } from '$services/db';

/**
 * Status de um projeto do herói
 */
export type ProjectStatus = 'planning' | 'in_progress' | 'done';

/**
 * Dificuldade calculada automaticamente pela quantidade de tarefas:
 * - easy   → até 3 tarefas
 * - medium → 4 tarefas
 * - hard   → 5 a 9 tarefas
 * - expert → 10+ tarefas
 */
export type ProjectDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

/**
 * Modelo principal salvo na tabela `projects` do Dexie.
 * IMPORTANTE: alinhado com o HeroProject do db.ts
 *  - targetDate: string (nada de null)
 *  - updatedAt: opcional (não obrigatório)
 */
export interface HeroProject {
  id?: number;
  title: string;
  description: string;
  status: ProjectStatus;
  difficulty: ProjectDifficulty;
  totalTasks: number;
  completedTasks: number;
  baseXp: number;
  createdAt: string; // ISO ou "YYYY-MM-DD"
  targetDate: string; // manter como string, vazio = sem alvo
  updatedAt?: string; // opcional para não brigar com o db.HeroProject
}

/**
 * Versão do projeto com campos derivados usados na UI:
 * - completionPercent
 * - bonusXp (+25% se todas as tarefas concluídas)
 * - finalXp (base + bônus)
 * - finalGold (50% do XP final)
 * - allTasksDone (boolean)
 */
export interface ProjectComputed extends HeroProject {
  completionPercent: number;
  bonusXp: number;
  finalXp: number;
  finalGold: number;
  allTasksDone: boolean;
}

/**
 * Regra centralizada de dificuldade por número de tarefas.
 * NÃO é escolhida pelo usuário — é sempre derivada.
 */
export function getDifficultyForTaskCount(
  totalTasks: number,
): ProjectDifficulty {
  const n = Math.max(1, Math.floor(totalTasks || 0));

  if (n <= 3) return 'easy'; // até 3 tarefas
  if (n >= 10) return 'expert'; // 10 ou mais
  if (n >= 5) return 'hard'; // 5 a 9
  return 'medium'; // sobra o 4
}

/**
 * Calcula os campos derivados de um projeto.
 * Essa função NÃO grava nada no banco; é só pra UI.
 */
export function computeProjectStats(project: HeroProject): ProjectComputed {
  const totalTasks = Math.max(project.totalTasks || 0, 1);
  const completed = Math.min(project.completedTasks || 0, totalTasks);

  const completionPercent = Math.round((completed / totalTasks) * 100);

  const allTasksDone =
    project.totalTasks > 0 && project.completedTasks >= project.totalTasks;

  const safeBaseXp = Math.max(0, Math.floor(project.baseXp || 0));
  const bonusXp = allTasksDone ? Math.round(safeBaseXp * 0.25) : 0;
  const finalXp = safeBaseXp + bonusXp;
  const finalGold = Math.floor(finalXp * 0.5);

  return {
    ...project,
    completionPercent,
    bonusXp,
    finalXp,
    finalGold,
    allTasksDone,
  };
}

/**
 * DTO para criação de projeto — entra só o que vem do formulário.
 */
interface CreateProjectInput {
  title: string;
  description: string;
  totalTasks: number;
  baseXp: number;
  targetDate?: string; // sempre string; se vazio, guardamos ''
}

/**
 * Cria um novo projeto do herói.
 * A dificuldade é calculada automaticamente com base em totalTasks.
 */
async function createProject(input: CreateProjectInput): Promise<HeroProject> {
  const nowIso = new Date().toISOString();

  const safeTasks = Math.max(1, Math.floor(input.totalTasks || 1));
  const safeBaseXp = Math.max(0, Math.floor(input.baseXp || 0));
  const difficulty = getDifficultyForTaskCount(safeTasks);

  const targetDate = input.targetDate?.trim() || '';

  const project: HeroProject = {
    title: input.title.trim(),
    description: input.description.trim(),
    status: 'planning',
    difficulty,
    totalTasks: safeTasks,
    completedTasks: 0,
    baseXp: safeBaseXp,
    createdAt: nowIso,
    targetDate,
    updatedAt: nowIso,
  };

  // Dexie espera o tipo declarado em db.ts, mas como somos 100% estruturais,
  // é seguro forçar aqui:
  const id = await db.projects.add(project as any);
  return { ...project, id };
}

/**
 * Retorna todos os projetos, do mais recente para o mais antigo.
 */
async function getAllProjects(): Promise<HeroProject[]> {
  const rows = await db.projects.orderBy('createdAt').reverse().toArray();
  // rows é tipado com o HeroProject do db.ts; coerção estrutural pra nosso HeroProject
  return rows as unknown as HeroProject[];
}

/**
 * Busca um projeto específico por id.
 */
async function getProjectById(id: number): Promise<HeroProject | undefined> {
  if (id == null) return undefined;
  const row = await db.projects.get(id);
  return row as HeroProject | undefined;
}

/**
 * Atualiza parcialmente um projeto (patch).
 * Se totalTasks for alterado, a dificuldade é recalculada automaticamente.
 */
async function updateProject(
  id: number,
  patch: Partial<Omit<HeroProject, 'id'>>,
): Promise<void> {
  const existing = (await db.projects.get(id)) as HeroProject | undefined;
  if (!existing) return;

  const merged: HeroProject = {
    ...existing,
    ...patch,
  };

  // Se o total de tarefas mudou, recalcular dificuldade
  if (patch.totalTasks !== undefined) {
    const safeTasks = Math.max(1, Math.floor(patch.totalTasks || 1));
    merged.totalTasks = safeTasks;
    merged.difficulty = getDifficultyForTaskCount(safeTasks);
  }

  merged.updatedAt = new Date().toISOString();

  await db.projects.put({ ...(merged as any), id });
}

/**
 * Atualiza o status de um projeto.
 */
async function setProjectStatus(
  id: number,
  status: ProjectStatus,
): Promise<void> {
  await updateProject(id, { status });
}

/**
 * Atualiza o número de tarefas concluídas.
 */
async function setCompletedTasks(
  id: number,
  completedTasks: number,
): Promise<void> {
  const safe = Math.max(0, Math.floor(completedTasks || 0));
  await updateProject(id, { completedTasks: safe });
}

/**
 * Remove um projeto definitivamente.
 */
async function deleteProject(id: number): Promise<void> {
  await db.projects.delete(id);
}

/**
 * Service exportado para uso no +page.svelte.
 */
export const projectService = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  setProjectStatus,
  setCompletedTasks,
  deleteProject,
  computeProjectStats,
};
