import { db, type ActivityEvent, type Area, type Task } from './db';
import type { Occurrence, Routine } from './productivityTypes';
import { DOMAINS, isDomainKey, type DomainKey } from '$lib/content/domains';
import { addCalendarDays } from './calendar';

/**
 * Roda da Vida (13/11/2026). Two measures that are never mixed:
 * - how the person feels (optional self-rating 0–10, partial check-ins);
 * - where they acted (days with a recorded completion in the domain).
 * Plus focus and a one-line intention per domain. Nothing here moves
 * balances, grants rewards or is required to use the app. It is not a
 * validated psychological assessment.
 */
export type Checkin = {
  id: string;
  at: string;
  ratings: Partial<Record<DomainKey, number>>;
  notes?: Partial<Record<DomainKey, string>>;
};
export type FocusEntry = { since: string; intention?: string };
export type LifeWheelState = {
  version: 1;
  checkins: Checkin[];
  focus: Partial<Record<DomainKey, FocusEntry>>;
};
const EMPTY: LifeWheelState = { version: 1, checkins: [], focus: {} };
const NOTE_MAX = 280;
const INTENTION_MAX = 200;
const MAX_CHECKINS = 500;

const iso = (value: unknown) =>
  typeof value === 'string' && Number.isFinite(Date.parse(value));
export function validateLifeWheel(
  value: unknown,
): asserts value is LifeWheelState {
  const state = value as Record<string, unknown> | null;
  const keysOk = (row: object, allowed: string[]) =>
    Object.keys(row).every((key) => allowed.includes(key));
  const domainMap = (row: unknown, check: (value: unknown) => boolean) =>
    !!row &&
    typeof row === 'object' &&
    !Array.isArray(row) &&
    Object.entries(row).every(
      ([key, entry]) => isDomainKey(key) && check(entry),
    );
  const ok =
    !!state &&
    typeof state === 'object' &&
    keysOk(state, ['version', 'checkins', 'focus']) &&
    state.version === 1 &&
    Array.isArray(state.checkins) &&
    state.checkins.length <= MAX_CHECKINS &&
    state.checkins.every(
      (row: Record<string, unknown>) =>
        !!row &&
        typeof row === 'object' &&
        keysOk(row, ['id', 'at', 'ratings', 'notes']) &&
        typeof row.id === 'string' &&
        row.id.length <= 80 &&
        iso(row.at) &&
        domainMap(
          row.ratings,
          (n) =>
            Number.isInteger(n) && (n as number) >= 0 && (n as number) <= 10,
        ) &&
        (row.notes === undefined ||
          domainMap(
            row.notes,
            (text) => typeof text === 'string' && text.length <= NOTE_MAX,
          )),
    ) &&
    domainMap(
      state.focus,
      (entry) =>
        !!entry &&
        typeof entry === 'object' &&
        keysOk(entry as object, ['since', 'intention']) &&
        iso((entry as FocusEntry).since) &&
        ((entry as FocusEntry).intention === undefined ||
          (typeof (entry as FocusEntry).intention === 'string' &&
            (entry as FocusEntry).intention!.length <= INTENTION_MAX)),
    );
  if (!ok)
    throw new Error('Roda da Vida inválida. Os dados foram preservados.');
}

async function update(change: (state: LifeWheelState) => LifeWheelState) {
  return db.transaction('rw', db.profile, async () => {
    const profile = await db.profile.get(1);
    if (!profile) throw new Error('Abra sua jornada primeiro.');
    const next = change(structuredClone(profile.lifeWheel ?? EMPTY));
    validateLifeWheel(next);
    await db.profile.update(1, { lifeWheel: next });
    return next;
  });
}

/** Saves a check-in with any subset of domains (at least one). */
export async function saveCheckin(
  ratings: Partial<Record<DomainKey, number>>,
  notes: Partial<Record<DomainKey, string>> = {},
  at = new Date(),
) {
  const rated = Object.entries(ratings).filter(([, n]) => n !== undefined);
  if (!rated.length) throw new Error('Avalie pelo menos uma área.');
  const cleanNotes = Object.fromEntries(
    Object.entries(notes)
      .map(([key, text]) => [key, (text ?? '').trim()])
      .filter(([key, text]) => text && ratings[key as DomainKey] !== undefined),
  );
  if (Object.values(cleanNotes).some((text) => String(text).length > NOTE_MAX))
    throw new Error(`Cada observação pode ter até ${NOTE_MAX} caracteres.`);
  return update((state) => {
    if (state.checkins.length >= MAX_CHECKINS)
      throw new Error('Limite de avaliações alcançado.');
    state.checkins.push({
      id: crypto.randomUUID(),
      at: at.toISOString(),
      ratings: Object.fromEntries(rated),
      ...(Object.keys(cleanNotes).length ? { notes: cleanNotes } : {}),
    });
    return state;
  });
}

/** Turns focus on/off for a domain; any number of domains may be in focus. */
export async function setFocus(
  domain: DomainKey,
  on: boolean,
  at = new Date(),
) {
  if (!isDomainKey(domain)) throw new Error('Área da vida inválida.');
  return update((state) => {
    if (on) state.focus[domain] ??= { since: at.toISOString() };
    else delete state.focus[domain];
    return state;
  });
}

/** One-line "what I want to improve here"; empty text removes it. */
export async function setIntention(
  domain: DomainKey,
  text: string,
  at = new Date(),
) {
  if (!isDomainKey(domain)) throw new Error('Área da vida inválida.');
  const intention = text.trim();
  if (intention.length > INTENTION_MAX)
    throw new Error(`Escreva até ${INTENTION_MAX} caracteres.`);
  return update((state) => {
    const entry = state.focus[domain] ?? { since: at.toISOString() };
    if (intention) entry.intention = intention;
    else delete entry.intention;
    state.focus[domain] = entry;
    return state;
  });
}

/** Links an area (0 = Geral) to a domain, or unlinks it with null. */
export async function setAreaDomain(areaId: number, domain: DomainKey | null) {
  if (domain !== null && !isDomainKey(domain))
    throw new Error('Área da vida inválida.');
  if (areaId === 0) {
    await db.profile.update(1, { generalAreaDomain: domain });
    return;
  }
  const area = await db.areas.get(areaId);
  if (!area || area.archived) throw new Error('Esta área não está disponível.');
  await db.areas.update(areaId, { domain });
}

export type DomainView = {
  key: DomainKey;
  label: string;
  rating: number | null;
  ratedAt: string | null;
  previousRating: number | null;
  ratings: { at: string; value: number }[];
  focus: FocusEntry | null;
  areas: { id: number; nome: string }[];
  /** Days with at least one completion in the last 30 days. */
  activeDays: number;
  /** Same measure for the 30 days before that. */
  previousActiveDays: number;
  routines: string[];
  pending: { id: number; title: string; stalled: boolean }[];
};

export type WheelInput = {
  profile?: {
    lifeWheel?: LifeWheelState;
    generalAreaDomain?: DomainKey | null;
  };
  areas: Area[];
  tasks: Task[];
  events: ActivityEvent[];
  routines: Routine[];
  /** Executions whose progress was corrected to zero no longer count. */
  occurrences?: Occurrence[];
};

const DAY = 86_400_000;
/**
 * Pure read model for the screen. `today` is a local calendar date
 * (yyyy-mm-dd); the windows are the 30 days ending today and the 30 before.
 */
export function wheelView(input: WheelInput, today: string, now = Date.now()) {
  const wheel = input.profile?.lifeWheel ?? EMPTY;
  const areaDomain = new Map<number, DomainKey>();
  for (const area of input.areas)
    if (!area.archived && area.id !== undefined && area.domain)
      areaDomain.set(area.id, area.domain);
  if (input.profile?.generalAreaDomain)
    areaDomain.set(0, input.profile.generalAreaDomain);
  const taskArea = new Map(
    input.tasks.map((task) => [task.id, task.areaId ?? 0]),
  );
  const domainOf = (areaId: number | null | undefined) =>
    areaDomain.get(areaId ?? 0);
  const from = addCalendarDays(today, -29);
  const prevFrom = addCalendarDays(today, -59);
  const days = new Map<DomainKey, { now: Set<string>; before: Set<string> }>();
  const undone = new Set(
    (input.occurrences ?? [])
      .filter((row) => row.value === 0)
      .map((row) => row.id),
  );
  for (const event of input.events) {
    if (!['task', 'review'].includes(event.kind) || event.reversedAt) continue;
    if (event.occurrenceId && undone.has(event.occurrenceId)) continue;
    const domain = domainOf(event.areaId ?? taskArea.get(event.taskId));
    if (!domain || event.date > today || event.date < prevFrom) continue;
    const slot = days.get(domain) ?? { now: new Set(), before: new Set() };
    (event.date >= from ? slot.now : slot.before).add(event.date);
    days.set(domain, slot);
  }
  return DOMAINS.map(({ key, label }): DomainView => {
    const ratings = wheel.checkins
      .filter((row) => row.ratings[key] !== undefined)
      .sort((a, b) => a.at.localeCompare(b.at))
      .map((row) => ({ at: row.at, value: row.ratings[key]! }));
    const last = ratings.at(-1);
    const areaIds = [...areaDomain]
      .filter(([, d]) => d === key)
      .map(([id]) => id);
    return {
      key,
      label,
      rating: last?.value ?? null,
      ratedAt: last?.at ?? null,
      previousRating: ratings.at(-2)?.value ?? null,
      ratings,
      focus: wheel.focus[key] ?? null,
      areas: areaIds.map((id) => ({
        id,
        nome:
          id === 0
            ? 'Geral'
            : (input.areas.find((area) => area.id === id)?.nome ?? 'Área'),
      })),
      activeDays: days.get(key)?.now.size ?? 0,
      previousActiveDays: days.get(key)?.before.size ?? 0,
      // A routine counts for a domain through its default area or any of
      // its missions' areas.
      routines: input.routines
        .filter(
          (row) =>
            row.status === 'active' &&
            !row.mergedInto &&
            (domainOf(row.defaultAreaId) === key ||
              row.entries.some(
                (entry) => domainOf(taskArea.get(entry.taskId)) === key,
              )),
        )
        .map((row) => row.name),
      pending: input.tasks
        .filter(
          (task) =>
            !task.completed &&
            !task.archived &&
            !task.recurrence &&
            domainOf(task.areaId) === key,
        )
        .map((task) => ({
          id: task.id!,
          title: task.title,
          stalled: now - Date.parse(String(task.createdAt ?? now)) > 30 * DAY,
        }))
        .sort((a, b) => Number(b.stalled) - Number(a.stalled)),
    };
  });
}
