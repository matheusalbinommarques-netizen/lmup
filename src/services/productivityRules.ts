import { calendarDate } from './calendar';
import { getFoodFromEffectiveXp } from './progression';
import type {
  Occurrence,
  Planning,
  ProgressConfig,
  Resources,
} from './productivityTypes';

export function validateTime(value?: string | null): string | null {
  if (!value) return null;
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value))
    throw new Error('Escolha um horário válido.');
  return value;
}
export function validatePlanning(
  input: Planning,
  steps: string[] = [],
): Planning {
  const estimatedMinutes = input.estimatedMinutes ?? null;
  if (
    estimatedMinutes !== null &&
    (!Number.isFinite(estimatedMinutes) ||
      estimatedMinutes <= 0 ||
      estimatedMinutes > 10080)
  )
    throw new Error('A duração estimada precisa estar entre zero e sete dias.');
  const importance = input.importance ?? 'normal';
  if (!['low', 'normal', 'high'].includes(importance))
    throw new Error('Escolha uma importância válida.');
  const tracking: ProgressConfig = input.tracking ?? {
    method: steps.length ? 'steps' : 'direct',
  };
  if (
    !['direct', 'time', 'quantity', 'percentage', 'steps'].includes(
      tracking.method,
    )
  )
    throw new Error('Escolha um método de progresso válido.');
  if (
    ['time', 'quantity'].includes(tracking.method) &&
    (!Number.isFinite(tracking.target) ||
      tracking.target! <= 0 ||
      tracking.target! > Number.MAX_SAFE_INTEGER / 1000)
  )
    throw new Error('Informe uma meta positiva e segura.');
  if (tracking.method === 'steps' && !steps.length)
    throw new Error('Adicione ao menos uma etapa.');
  if ((tracking.unit?.length ?? 0) > 40)
    throw new Error('Use uma unidade de até 40 caracteres.');
  const deadline = input.deadline || null;
  if (deadline) {
    const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/.exec(deadline);
    if (
      !match ||
      calendarDate(match[1]) !== match[1] ||
      !validateTime(match[2])
    )
      throw new Error('Escolha um prazo final válido.');
  }
  return {
    plannedTime: validateTime(input.plannedTime),
    estimatedMinutes,
    importance,
    deadline,
    tracking: { ...tracking },
  };
}
export function progressTarget(
  occurrence: Pick<Occurrence, 'tracking' | 'steps'>,
): number {
  switch (occurrence.tracking?.method) {
    case 'time':
    case 'quantity':
      return occurrence.tracking.target!;
    case 'percentage':
      return 100;
    case 'steps':
      return occurrence.steps.length;
    default:
      return 1;
  }
}
export function fraction(
  occurrence: Pick<Occurrence, 'tracking' | 'steps' | 'value'>,
): number {
  return Math.min(1, occurrence.value / progressTarget(occurrence));
}
export function occurrenceDue(
  occurrence: Occurrence,
  value = occurrence.value,
): Resources {
  const target = progressTarget(occurrence);
  if (
    !Number.isFinite(value) ||
    value < 0 ||
    !Number.isSafeInteger(Math.round(value * 1000))
  )
    throw new Error('Progresso inválido.');
  if (occurrence.tracking?.method !== 'time' && value > target)
    throw new Error('O progresso ultrapassa a meta.');
  if (
    ['steps', 'direct'].includes(occurrence.tracking?.method ?? 'direct') &&
    !Number.isInteger(value)
  )
    throw new Error('Informe etapas inteiras.');
  const ratio = Math.min(1, value / target);
  if (occurrence.legacyCompletionOnly && ratio < 1)
    return { xp: 0, gold: 0, food: 0 };
  const bonus =
    occurrence.tracking?.method === 'time'
      ? Math.min(0.5, Math.max(0, value / target - 1))
      : 0;
  const mods = occurrence.modifiers ?? {
    xpMultiplier: 1,
    goldMultiplier: 1,
    foodMultiplier: 1,
  };
  // Round the cumulative entitlement, never individual installments.
  const result = {
    xp: Math.round(occurrence.baseXp * (ratio + bonus) * mods.xpMultiplier),
    gold: Math.round(
      Math.round(Math.floor(occurrence.baseXp * 0.5) * mods.goldMultiplier) *
        ratio,
    ),
    food: Math.round(
      Math.round(
        getFoodFromEffectiveXp(occurrence.baseXp) * mods.foodMultiplier,
      ) * ratio,
    ),
  };
  for (const amount of Object.values(result))
    if (!Number.isSafeInteger(amount) || amount < 0)
      throw new Error('A recompensa ultrapassa o limite seguro.');
  return result;
}
export function settleResources(gross: Resources, debt: Resources) {
  const compensation = { xp: 0, gold: 0, food: 0 };
  const net = { ...gross },
    remaining = { ...debt };
  for (const key of ['xp', 'gold', 'food'] as const) {
    if (
      ![gross[key], debt[key]].every((n) => Number.isSafeInteger(n) && n >= 0)
    )
      throw new Error('Saldo ou débito inválido.');
    compensation[key] = Math.min(gross[key], debt[key]);
    net[key] -= compensation[key];
    remaining[key] -= compensation[key];
  }
  return { compensation, net, remaining };
}
export function executionContext(value: string, now = new Date()) {
  const instant = new Date(value);
  if (!Number.isFinite(instant.getTime()) || instant > now)
    throw new Error(
      'A execução precisa ter uma data válida e não pode estar no futuro.',
    );
  return {
    executedAt: instant.toISOString(),
    localDate: `${instant.getFullYear()}-${String(instant.getMonth() + 1).padStart(2, '0')}-${String(instant.getDate()).padStart(2, '0')}`,
    localTime: `${String(instant.getHours()).padStart(2, '0')}:${String(instant.getMinutes()).padStart(2, '0')}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    offsetMinutes: instant.getTimezoneOffset(),
  };
}
