import { db, type ActivityEvent } from './db';
import {
  creditMaterials,
  reverseMaterialCredit,
  LEDGER_CREDIT,
  type Material,
  type Materials,
} from './resourceLedger';

/**
 * Wave D — supply boxes (V0.2, approved by the author on 12/11/2026).
 *
 * - One box per 400 eligible XP; at most 5 per day, worth 100%, 75%, 50%,
 *   50%, 50%. After the 5th box nothing more that day (excess XP is lost
 *   for boxes; mission XP itself is untouched).
 * - Progress below 400 carries to the next day.
 * - Eligible XP is derived from the recorded mission receipts
 *   (`activityEvents`), so boxes are never stored as a counter: undoing a
 *   mission lowers the count, and restoring a backup cannot create boxes.
 * - Opening a box is a material credit receipt
 *   (`supply-box:<date>:<box>:<attempt>`; a new attempt only after a reversal).
 *   If a later correction lowers the day's count below the boxes already
 *   opened, the extra ones are reversed through the ledger (debt if spent).
 */
export const BOX_XP = 400;
export const BOX_FACTORS = [1, 0.75, 0.5, 0.5, 0.5] as const;
export const BOXES_PER_DAY = BOX_FACTORS.length;
export const BOX_BASE: Materials = { wood: 8, stone: 6, ore: 4 };
const ENTITY = 'supply-box';
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export type BoxDay = {
  date: string;
  /** Eligible XP recorded on the day (after downward corrections). */
  xp: number;
  /** XP carried in from previous days (below 400). */
  carryIn: number;
  earned: number;
  /** XP toward the next box, 0 once the 5th box is earned. */
  progress: number;
};

/** Mission XP that counts for boxes on each day. */
export function eligibleXpByDay(events: ActivityEvent[]) {
  const days = new Map<string, number>();
  for (const event of events) {
    const xp =
      (event.kind === 'task' || event.kind === 'review') && !event.reversedAt
        ? (event.grossReward ?? event.reward).xp
        : event.kind === 'adjustment' && event.debtAdded
          ? -event.debtAdded.xp
          : 0;
    if (xp && DATE.test(event.date))
      days.set(event.date, (days.get(event.date) ?? 0) + xp);
  }
  return days;
}

/** Day-by-day box ledger derived from the receipts; pure and deterministic. */
export function boxDays(events: ActivityEvent[]): BoxDay[] {
  const xpByDay = eligibleXpByDay(events);
  let carry = 0;
  return [...xpByDay.keys()].sort().map((date) => {
    const xp = xpByDay.get(date)!;
    const total = Math.max(0, carry + xp);
    const earned = Math.min(BOXES_PER_DAY, Math.floor(total / BOX_XP));
    const progress = earned < BOXES_PER_DAY ? total - earned * BOX_XP : 0;
    const day = { date, xp, carryIn: carry, earned, progress };
    carry = progress;
    return day;
  });
}

export function boxAmount(index: number, material: Material) {
  const factor = BOX_FACTORS[index - 1];
  if (!factor) throw new Error('Caixa inválida.');
  return Math.max(1, Math.round(BOX_BASE[material] * factor));
}

type BoxReceipt = { id: string; date: string; index: number; open: boolean };
async function boxReceipts(): Promise<BoxReceipt[]> {
  const rows = await db.productivityAudit
    .where('id')
    .startsWith(`${ENTITY}:`)
    .toArray();
  const reversed = new Set(
    rows.filter((row) => row.id.endsWith(':reversal')).map((row) => row.id),
  );
  return rows
    .filter((row) => row.action === LEDGER_CREDIT)
    .map((row) => {
      const [, date, index] = row.id.split(':');
      return {
        id: row.id,
        date,
        index: Number(index),
        open: !reversed.has(`${row.id}:reversal`),
      };
    });
}
const openedBoxes = async () => (await boxReceipts()).filter((box) => box.open);

export type BoxStatus = {
  /** Unopened boxes, oldest first. */
  available: { date: string; index: number; factor: number }[];
  today: BoxDay & { opened: number };
};

export async function supplyBoxStatus(today: string): Promise<BoxStatus> {
  const days = boxDays(await db.activityEvents.toArray());
  const opened = await openedBoxes();
  const available: BoxStatus['available'] = [];
  for (const day of days)
    for (let index = 1; index <= day.earned; index++)
      if (!opened.some((box) => box.date === day.date && box.index === index))
        available.push({
          date: day.date,
          index,
          factor: BOX_FACTORS[index - 1],
        });
  const last = days.filter((day) => day.date < today).at(-1);
  const found = days.find((day) => day.date === today) ?? {
    date: today,
    xp: 0,
    carryIn: last?.progress ?? 0,
    earned: 0,
    progress: last?.progress ?? 0,
  };
  return {
    available,
    today: {
      ...found,
      opened: opened.filter((box) => box.date === today).length,
    },
  };
}

/**
 * Opens one earned box and credits the chosen material. Repeating the same
 * box is a no-op; a box that is not (or no longer) earned is refused.
 */
export async function openSupplyBox(input: {
  date: string;
  index: number;
  material: Material;
}) {
  if (!DATE.test(input.date)) throw new Error('Caixa inválida.');
  const amount = boxAmount(input.index, input.material);
  return db.transaction('rw', db.tables, async () => {
    const day = boxDays(await db.activityEvents.toArray()).find(
      (row) => row.date === input.date,
    );
    if (!day || input.index > day.earned)
      throw new Error('Esta caixa não está disponível.');
    const receipts = (await boxReceipts()).filter(
      (box) => box.date === input.date && box.index === input.index,
    );
    // Already open: repeating the click never credits twice.
    if (receipts.some((box) => box.open))
      return { profile: (await db.profile.get(1))!, repeated: true };
    return creditMaterials({
      requestId: `${ENTITY}:${input.date}:${input.index}:${receipts.length + 1}`,
      entityId: `${ENTITY}:${input.date}`,
      amount: { [input.material]: amount },
      details: {
        date: input.date,
        index: input.index,
        factor: BOX_FACTORS[input.index - 1],
        material: input.material,
      },
    });
  });
}

/**
 * Reverses opened boxes that are no longer earned (highest index first).
 * Runs inside the correction's own transaction, so the history never shows
 * more opened boxes than earned ones.
 */
export async function reconcileSupplyBoxes(reason: string) {
  return db.transaction('rw', db.tables, async () => {
    // Cheap index read first: no opened box, nothing to reconcile.
    const opened = await openedBoxes();
    if (!opened.length) return 0;
    const earned = new Map(
      boxDays(await db.activityEvents.toArray()).map((day) => [
        day.date,
        day.earned,
      ]),
    );
    const extra = opened
      .filter((box) => box.index > (earned.get(box.date) ?? 0))
      .sort((a, b) => b.index - a.index);
    for (const box of extra)
      await reverseMaterialCredit({ creditId: box.id, reason });
    return extra.length;
  });
}
