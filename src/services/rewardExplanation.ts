import type { ActivityEvent } from './db';
import { EFFORTS } from './effort';
import { getFoodFromEffectiveXp } from './progression';
import type { Resources } from './productivityTypes';

export type ExplanationRow = Resources & { label: string; note?: string };
export type RewardExplanation = {
  rows: ExplanationRow[];
  total: Resources;
};

const ZERO: Resources = { xp: 0, gold: 0, food: 0 };
const minus = (a: Resources, b: Resources): Resources => ({
  xp: a.xp - b.xp,
  gold: a.gold - b.gold,
  food: a.food - b.food,
});
const empty = (row: Resources) => !row.xp && !row.gold && !row.food;
const percent = (multiplier: number) => {
  const value = Math.round((multiplier - 1) * 100);
  return `${value >= 0 ? '+' : ''}${value}%`;
};

function baseLabel(event: ActivityEvent) {
  if (event.kind === 'project') return 'Base do bônus de projeto';
  if (event.kind === 'review') return 'Base da revisão';
  const effort = EFFORTS.find((row) => row.xp === event.baseXp);
  return effort ? `Esforço ${effort.label}` : 'Base registrada';
}

/**
 * Rebuilds the account of a receipt from what it stored at grant time
 * (base XP, multipliers, milestone gold, debt compensation). Rows always add
 * up to the recorded net reward: anything the formula cannot attribute
 * (partial progress, legacy fixed rewards) appears as an explicit adjustment.
 * Pure read; never recalculates or changes balances.
 */
export function explainReward(event: ActivityEvent): RewardExplanation | null {
  if (event.kind === 'reversal' || event.kind === 'adjustment') return null;
  if (!Number.isSafeInteger(event.baseXp) || event.baseXp <= 0) return null;
  const mods = event.modifiers ?? {
    xpMultiplier: 1,
    goldMultiplier: 1,
    foodMultiplier: 1,
  };
  const base: Resources = {
    xp: event.baseXp,
    gold: Math.floor(event.baseXp * 0.5),
    food: getFoodFromEffectiveXp(event.baseXp),
  };
  const boosted: Resources = {
    xp: Math.round(base.xp * mods.xpMultiplier),
    gold: Math.round(base.gold * mods.goldMultiplier),
    food: Math.round(base.food * mods.foodMultiplier),
  };
  const milestone = event.milestoneGold ?? 0;
  const gross = event.grossReward ?? event.reward;
  const compensation = event.grossReward ? (event.compensation ?? ZERO) : ZERO;
  const rows: ExplanationRow[] = [{ label: baseLabel(event), ...base }];
  const bonus = minus(boosted, base);
  if (!empty(bonus))
    rows.push({
      label: 'Bônus ativos',
      note:
        'Refúgio, equipamento e companheiro: ' +
        (
          [
            ['XP', mods.xpMultiplier],
            ['Ouro', mods.goldMultiplier],
            ['Comida', mods.foodMultiplier],
          ] as const
        )
          .filter(([, value]) => Math.round((value - 1) * 100) !== 0)
          .map(([name, value]) => `${name} ${percent(value)}`)
          .join(' · '),
      ...bonus,
    });
  const adjustment = minus(minus(gross, { ...ZERO, gold: milestone }), boosted);
  if (!empty(adjustment))
    rows.push({
      label: 'Ajuste registrado',
      note: event.occurrenceId
        ? 'Parte proporcional ao progresso desta execução.'
        : 'Valor fixo gravado no recibo.',
      ...adjustment,
    });
  if (milestone)
    rows.push({
      label: 'Marco do Refúgio',
      note: 'Ouro de entrada num novo estágio.',
      ...ZERO,
      gold: milestone,
    });
  if (!empty(compensation))
    rows.push({
      label: 'Compensação de débito',
      note: 'Abate de uma recompensa corrigida antes.',
      xp: 0 - compensation.xp,
      gold: 0 - compensation.gold,
      food: 0 - compensation.food,
    });
  const total = rows.reduce(
    (sum, row) => ({
      xp: sum.xp + row.xp,
      gold: sum.gold + row.gold,
      food: sum.food + row.food,
    }),
    ZERO,
  );
  if (empty(minus(total, event.reward))) return { rows, total };
  // A receipt whose numbers do not close is shown as-is, never "fixed".
  return null;
}
