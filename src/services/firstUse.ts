import { db, type Profile } from './db';
import { DOMAINS, isDomainKey, type DomainKey } from '$lib/content/domains';
import { isTaskIconKey } from '$lib/content/visualAssets';
import { saveArea } from './areaService';

/**
 * Primeiro uso opcional (lote 7). Só perfis criados a partir deste lote têm
 * `firstUse`; perfis antigos e backups sem o campo nunca veem o painel.
 * - "Agora não" recolhe o painel (postponed) e não conclui nada;
 * - "Pular passo" resolve só aquele passo;
 * - "Pular tudo" encerra sem mexer na camada atual (Discreta para quem
 *   não escolheu outra).
 */
export const FIRST_USE_STEPS = ['areas', 'day', 'layer'] as const;
export type FirstUseStep = (typeof FIRST_USE_STEPS)[number];
export type FirstUseState = {
  status: 'pending' | 'done' | 'skipped';
  steps: Partial<Record<FirstUseStep, 'done' | 'skipped'>>;
  postponed?: boolean;
  startedAt: string;
  finishedAt?: string;
};

export function newFirstUse(at = new Date()): FirstUseState {
  return { status: 'pending', steps: {}, startedAt: at.toISOString() };
}

export const firstUsePending = (profile?: Pick<Profile, 'firstUse'> | null) =>
  profile?.firstUse?.status === 'pending';

/** Next unresolved step, or null when the first use is not pending. */
export function nextFirstUseStep(
  profile?: Pick<Profile, 'firstUse'> | null,
): FirstUseStep | null {
  if (!firstUsePending(profile)) return null;
  return (
    FIRST_USE_STEPS.find((step) => !profile!.firstUse!.steps[step]) ?? null
  );
}

const isIso = (value: unknown) =>
  typeof value === 'string' && !Number.isNaN(Date.parse(value));

export function isFirstUseState(value: unknown): value is FirstUseState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  if (!['pending', 'done', 'skipped'].includes(row.status as string))
    return false;
  if (!isIso(row.startedAt)) return false;
  if (row.finishedAt !== undefined && !isIso(row.finishedAt)) return false;
  if (row.postponed !== undefined && typeof row.postponed !== 'boolean')
    return false;
  const steps = row.steps;
  if (!steps || typeof steps !== 'object' || Array.isArray(steps)) return false;
  return Object.entries(steps).every(
    ([key, mark]) =>
      (FIRST_USE_STEPS as readonly string[]).includes(key) &&
      (mark === 'done' || mark === 'skipped'),
  );
}

/**
 * Marks a step inside an open transaction on db.profile. Does nothing when
 * the first use is absent, finished, or the step was already resolved, so
 * Configurações can call it freely.
 */
export async function resolveFirstUseStep(
  step: FirstUseStep,
  mark: 'done' | 'skipped',
  at = new Date(),
) {
  const profile = await db.profile.get(1);
  const state = profile?.firstUse;
  if (!state || state.status !== 'pending' || state.steps[step]) return;
  const steps = { ...state.steps, [step]: mark };
  const finished = FIRST_USE_STEPS.every((key) => steps[key]);
  await db.profile.update(1, {
    firstUse: {
      ...state,
      steps,
      ...(finished
        ? { status: 'done' as const, finishedAt: at.toISOString() }
        : {}),
    },
  });
}

async function updatePending(change: (state: FirstUseState) => FirstUseState) {
  await db.transaction('rw', db.profile, async () => {
    const state = (await db.profile.get(1))?.firstUse;
    if (!state || state.status !== 'pending') return;
    await db.profile.update(1, { firstUse: change(state) });
  });
}

export const skipFirstUseStep = (step: FirstUseStep) =>
  db.transaction('rw', db.profile, () => resolveFirstUseStep(step, 'skipped'));

/** "Agora não": collapses without finishing anything. */
export const postponeFirstUse = () =>
  updatePending((state) => ({ ...state, postponed: true }));

const withoutPostponed = (state: FirstUseState): FirstUseState => {
  const next = { ...state };
  delete next.postponed;
  return next;
};

/** "Continuar a preparação": opens the panel again where it stopped. */
export const resumeFirstUse = () => updatePending(withoutPostponed);

/** "Pular tudo": ends the first use; the current layer stays as it is. */
export const skipFirstUse = (at = new Date()) =>
  updatePending((state) => ({
    ...withoutPostponed(state),
    status: 'skipped',
    finishedAt: at.toISOString(),
  }));

// ---------------------------------------------
// Áreas sugeridas pela Roda da Vida
// ---------------------------------------------

/** Icons from the existing library; null when none fits honestly. */
export const domainIcon: Record<DomainKey, string | null> = {
  health: 'exercicio',
  emotional: 'bem_estar',
  knowledge: 'estudo',
  career: 'projeto_atividade',
  finance: 'ouro',
  home: 'limpeza',
  relations: 'social',
  leisure: 'aventura',
  creativity: 'criar',
  values: null,
};

export const domainSuggestions = DOMAINS.map((domain) => ({
  key: domain.key,
  name: domain.short,
  label: domain.label,
  icon: domainIcon[domain.key],
}));

export type AreaChoice = { name: string; domain?: DomainKey | null };
export type AreaResult = { created: string[]; kept: string[] };

const sameName = (a: string, b: string) =>
  a.trim().toLocaleLowerCase('pt-BR') === b.trim().toLocaleLowerCase('pt-BR');

/**
 * Creates the chosen areas. An area that already exists with the same name
 * (or "Geral") is kept exactly as it is: no new domain, icon or name.
 * Repeated choices count once. Zero choices is allowed and only resolves
 * the step.
 */
export async function createFirstUseAreas(
  choices: AreaChoice[],
): Promise<AreaResult> {
  const unique: AreaChoice[] = [];
  for (const choice of choices) {
    const name = choice.name?.trim();
    if (!name) continue;
    if (name.length > 80)
      throw new Error('Escreva nomes de área com até 80 caracteres.');
    if (choice.domain != null && !isDomainKey(choice.domain))
      throw new Error('Área da vida inválida.');
    if (!unique.some((row) => sameName(row.name, name)))
      unique.push({ name, domain: choice.domain ?? null });
  }
  const result: AreaResult = { created: [], kept: [] };
  await db.transaction(
    'rw',
    db.profile,
    db.areas,
    db.productivityAudit,
    async () => {
      const existing = (await db.areas.toArray()).filter(
        (area) => !area.archived,
      );
      for (const choice of unique) {
        if (
          sameName(choice.name, 'Geral') ||
          existing.some((area) => sameName(area.nome, choice.name))
        ) {
          result.kept.push(choice.name);
          continue;
        }
        const icon = choice.domain ? domainIcon[choice.domain] : null;
        const id = await saveArea(
          choice.name,
          undefined,
          isTaskIconKey(icon) ? icon : null,
        );
        if (choice.domain) await db.areas.update(id, { domain: choice.domain });
        result.created.push(choice.name);
      }
      await resolveFirstUseStep('areas', 'done');
    },
  );
  return result;
}

// ---------------------------------------------
// Início e fim do dia (referência de planejamento)
// ---------------------------------------------

export type DayHours = { start?: string; end?: string };
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
export const toMinutes = (time: string) =>
  Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

/** Message for an invalid pair, or '' when it can be saved. */
export function dayHoursProblem(hours: DayHours): string {
  for (const value of [hours.start, hours.end])
    if (value !== undefined && !TIME.test(value))
      return 'Use horários no formato 07:30.';
  if (
    hours.start !== undefined &&
    hours.end !== undefined &&
    toMinutes(hours.end) <= toMinutes(hours.start)
  )
    return 'O fim do dia precisa ser depois do início. Se seu dia passa da meia-noite, deixe o fim em branco.';
  return '';
}

export function isDayHours(value: unknown): value is DayHours {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  if (!Object.keys(row).every((key) => key === 'start' || key === 'end'))
    return false;
  if (
    (row.start !== undefined && typeof row.start !== 'string') ||
    (row.end !== undefined && typeof row.end !== 'string')
  )
    return false;
  return !dayHoursProblem(row as DayHours);
}

/** Valid hours from the profile; anything else counts as absent. */
export const dayHoursOf = (
  profile?: Pick<Profile, 'dayHours'> | null,
): DayHours => (isDayHours(profile?.dayHours) ? profile!.dayHours! : {});

/**
 * Saves or clears (both empty) the hours. Empty strings mean "not set".
 * Also resolves the first-use step when it is still open.
 */
export async function saveDayHours(input: { start?: string; end?: string }) {
  const hours: DayHours = {};
  if (input.start) hours.start = input.start;
  if (input.end) hours.end = input.end;
  const problem = dayHoursProblem(hours);
  if (problem) throw new Error(problem);
  await db.transaction('rw', db.profile, async () => {
    const profile = await db.profile.get(1);
    if (!profile) throw new Error('Abra sua jornada primeiro.');
    if (hours.start || hours.end)
      await db.profile.update(1, { dayHours: hours });
    else if (profile.dayHours !== undefined)
      await db.profile.update(1, { dayHours: undefined });
    await resolveFirstUseStep('day', 'done');
  });
  return hours;
}
