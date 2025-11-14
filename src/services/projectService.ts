// src/services/projectService.ts
import { liveQuery } from 'dexie';
import { db, type HeroProject as DbHeroProject } from '$services/db';

/**
 * Tipos básicos vindos do db
 */
export type HeroProject = DbHeroProject;
export type ProjectStatus = HeroProject['status'];
export type ProjectDifficulty = HeroProject['difficulty'];

/**
 * Payload para criação de projeto (entrada crua da UI)
 */
export interface NewProjectInput {
  title: string;
  description: string;
  totalTasks: number;
  baseXp: number;
  /** ISO string (ex: 2025-12-31T00:00:00.000Z) ou undefined */
  targetDate?: string;
}

/**
 * Projeto com campos derivados (para exibição)
 */
export type ProjectWithComputed = HeroProject & {
  completionPercent: number;
  bonusXp: number;
  finalXp: number;
  finalGold: number;
  allTasksDone: boolean;
};

/**
 * Regra de dificuldade baseada APENAS no número de tarefas:
 * - até 3 tarefas → easy
 * - 4 tarefas → medium
 * - 5–9 tarefas → hard
 * - 10+ tarefas → expert
 */
export function inferDifficultyFromTasks(
  totalTasks: number,
): ProjectDifficulty {
  const n = Math.max(0, Math.floor(Number(totalTasks) || 0));

  if (n <= 3) return 'easy';
  if (n === 4) return 'medium';
  if (n >= 5 && n <= 9) return 'hard';
  return 'expert';
}

/**
 * Calcula percentuais e recompensas (XP final + Gold).
 * - 25% de bônus de XP se todas as tarefas estiverem concluídas
 * - Gold = 50% do XP final
 */
export function computeProjectDerived(
  project: HeroProject,
): ProjectWithComputed {
  const totalTasks = Math.max(0, Math.floor(Number(project.totalTasks) || 0));
  const completed = Math.max(
    0,
    Math.floor(Number(project.completedTasks) || 0),
  );

  const safeTotal = totalTasks > 0 ? totalTasks : 1;
  const clampedCompleted = Math.min(completed, safeTotal);

  const completionPercent = Math.round((clampedCompleted / safeTotal) * 100);

  const allTasksDone = totalTasks > 0 && clampedCompleted >= totalTasks;

  const baseXp = Math.max(0, Math.floor(Number(project.baseXp) || 0));
  const bonusXp = allTasksDone ? Math.round(baseXp * 0.25) : 0;
  const finalXp = baseXp + bonusXp;
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
 * Cria um novo projeto na tabela `projects`.
 * A data alvo é opcional; se não vier, salvamos como string vazia
 * para bater com o tipo do db (string, não string | null).
 */
export async function createProject(
  input: NewProjectInput,
): Promise<HeroProject> {
  const title = input.title.trim();
  const description = input.description.trim();

  if (!title) {
    throw new Error('Título do projeto é obrigatório.');
  }
  if (!description) {
    throw new Error('Descrição do projeto é obrigatória.');
  }

  const totalTasks = Math.max(1, Math.floor(Number(input.totalTasks) || 1));
  const baseXp = Math.max(0, Math.floor(Number(input.baseXp) || 0));
  const difficulty = inferDifficultyFromTasks(totalTasks);
  const nowIso = new Date().toISOString();

  const project: HeroProject = {
    // id é opcional, Dexie preenche
    title,
    description,
    status: 'planning' as ProjectStatus,
    difficulty,
    totalTasks,
    completedTasks: 0,
    baseXp,
    createdAt: nowIso,
    // db espera string, então usamos '' quando não houver data alvo
    targetDate: input.targetDate ?? '',
  };

  const id = await db.projects.add(project);
  return { ...project, id };
}

/**
 * Observa a lista de projetos em tempo real usando Dexie liveQuery.
 * Retorna uma função de cleanup para desinscrever.
 */
export function subscribeToProjects(
  onNext: (projects: HeroProject[]) => void,
  onError?: (error: unknown) => void,
): () => void {
  const observable = liveQuery(() => db.projects.toArray());

  const subscription = observable.subscribe(
    (rows) => {
      if (typeof onNext === 'function') {
        onNext(rows ?? []);
      } else {
        console.error(
          'subscribeToProjects: onNext não é função. Valor recebido:',
          onNext,
        );
      }
    },
    (err) => {
      console.error('Erro ao observar projetos:', err);
      if (typeof onError === 'function') {
        onError(err);
      }
    },
  );

  return () => subscription.unsubscribe();
}
