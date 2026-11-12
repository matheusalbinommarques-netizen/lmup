import { db, type Profile } from './db';

/** Economy 2.0 materials (wave D). Stock lives in `profile.materials`. */
export const MATERIALS = ['wood', 'stone', 'ore'] as const;
export type Material = (typeof MATERIALS)[number];
export type Materials = Record<Material, number>;
export const ZERO_MATERIALS: Materials = { wood: 0, stone: 0, ore: 0 };
export const MATERIAL_LABEL: Record<Material, string> = {
  wood: 'Madeira',
  stone: 'Pedra',
  ore: 'Minério',
};
/** Spendable balances. */
export type ResourceCost = {
  gold?: number;
  food?: number;
} & Partial<Materials>;
export const LEDGER_SPEND = 'ledger:spend';
export const LEDGER_CREDIT = 'ledger:material-credit';
export const LEDGER_REVERSAL = 'ledger:material-reversal';
export class InsufficientResources extends Error {
  constructor(readonly resource: keyof ResourceCost) {
    super(
      resource === 'gold'
        ? 'Você não tem ouro suficiente.'
        : resource === 'food'
          ? 'Você não tem comida suficiente.'
          : `Você não tem ${MATERIAL_LABEL[resource as Material].toLowerCase()} suficiente.`,
    );
  }
}
const REQUEST_ID = /^[\w:.-]{1,160}$/;
const materialsOf = (value: Partial<Materials> | undefined): Materials => ({
  wood: value?.wood ?? 0,
  stone: value?.stone ?? 0,
  ore: value?.ore ?? 0,
});
const anyMaterial = (value: Materials) => MATERIALS.some((key) => value[key]);

/**
 * The single way to spend gold or food. Debits the profile and writes the
 * receipt (`productivityAudit`, id = requestId) in the caller's transaction,
 * which must include `db.profile` and `db.productivityAudit`. Repeating a
 * requestId never charges again. Past spending is not rewritten.
 */
export async function spendResources(input: {
  requestId: string;
  entityId: string;
  cost: ResourceCost;
  action?: string;
  details?: Record<string, unknown>;
}): Promise<{ profile: Profile; repeated: boolean }> {
  const { requestId, entityId, cost, action = LEDGER_SPEND } = input;
  if (!REQUEST_ID.test(requestId))
    throw Error('Identificador de operação inválido.');
  const gold = cost.gold ?? 0,
    food = cost.food ?? 0,
    materials = materialsOf(cost);
  for (const value of [gold, food, ...Object.values(materials)])
    if (!Number.isSafeInteger(value) || value < 0)
      throw Error('Custo inválido.');
  if (!gold && !food && !anyMaterial(materials)) throw Error('Custo inválido.');
  const profile = await db.profile.get(1);
  if (!profile) throw Error('Abra sua jornada primeiro.');
  const prior = await db.productivityAudit.get(requestId);
  if (prior) {
    if (prior.entityId !== entityId || prior.action !== action)
      throw Error('Identificador de operação já utilizado.');
    return { profile, repeated: true };
  }
  const balance = { gold: profile.gold, food: profile.food ?? 0 };
  if (!Number.isSafeInteger(balance.gold) || balance.gold < gold)
    throw new InsufficientResources('gold');
  if (!Number.isSafeInteger(balance.food) || balance.food < food)
    throw new InsufficientResources('food');
  const stock = materialsOf(profile.materials);
  for (const key of MATERIALS)
    if (stock[key] < materials[key]) throw new InsufficientResources(key);
  const after = { gold: balance.gold - gold, food: balance.food - food };
  const changes: Partial<Profile> = {};
  if (gold) changes.gold = after.gold;
  if (food) changes.food = after.food;
  const usesMaterials = anyMaterial(materials);
  const delta = materialsOf(
    Object.fromEntries(MATERIALS.map((key) => [key, -materials[key]])),
  );
  if (usesMaterials)
    changes.materials = materialsOf(
      Object.fromEntries(
        MATERIALS.map((key) => [key, stock[key] + delta[key]]),
      ),
    );
  await db.profile.update(1, changes);
  await db.productivityAudit.add({
    id: requestId,
    entityId,
    action,
    recordedAt: new Date().toISOString(),
    before: usesMaterials ? { ...balance, materials: stock } : balance,
    after: {
      ...input.details,
      ...after,
      spent: { gold, food },
      // Receipts without materials keep their historical shape.
      ...(usesMaterials ? { materialDelta: delta } : {}),
    },
  });
  return { profile: { ...profile, ...changes }, repeated: false };
}

/**
 * Credits materials (e.g. a supply box). Outstanding material debt is paid
 * first, like reward debt. Same transaction rules as `spendResources`.
 * The receipt's `materialDelta` is the full credited amount, so
 * `materials - materialDebt` always equals the sum of all deltas.
 */
export async function creditMaterials(input: {
  requestId: string;
  entityId: string;
  amount: Partial<Materials>;
  action?: string;
  details?: Record<string, unknown>;
}): Promise<{ profile: Profile; repeated: boolean }> {
  const { requestId, entityId, action = LEDGER_CREDIT } = input;
  if (!REQUEST_ID.test(requestId))
    throw Error('Identificador de operação inválido.');
  const amount = materialsOf(input.amount);
  for (const value of Object.values(amount))
    if (!Number.isSafeInteger(value) || value < 0)
      throw Error('Quantidade inválida.');
  if (!anyMaterial(amount)) throw Error('Quantidade inválida.');
  const profile = await db.profile.get(1);
  if (!profile) throw Error('Abra sua jornada primeiro.');
  const prior = await db.productivityAudit.get(requestId);
  if (prior) {
    if (prior.entityId !== entityId || prior.action !== action)
      throw Error('Identificador de operação já utilizado.');
    return { profile, repeated: true };
  }
  const stock = materialsOf(profile.materials);
  const debt = materialsOf(profile.materialDebt);
  const paid = materialsOf(
    Object.fromEntries(
      MATERIALS.map((key) => [key, Math.min(debt[key], amount[key])]),
    ),
  );
  const materials = materialsOf(
    Object.fromEntries(
      MATERIALS.map((key) => [key, stock[key] + amount[key] - paid[key]]),
    ),
  );
  const materialDebt = materialsOf(
    Object.fromEntries(MATERIALS.map((key) => [key, debt[key] - paid[key]])),
  );
  if (!Object.values(materials).every(Number.isSafeInteger))
    throw Error('Saldo fora do limite seguro.');
  await db.profile.update(1, { materials, materialDebt });
  await db.productivityAudit.add({
    id: requestId,
    entityId,
    action,
    recordedAt: new Date().toISOString(),
    before: { materials: stock, materialDebt: debt },
    after: {
      ...input.details,
      materials,
      materialDebt,
      materialDelta: amount,
      compensated: paid,
    },
  });
  return {
    profile: { ...profile, materials, materialDebt },
    repeated: false,
  };
}

/**
 * Undoes a material credit once (e.g. the mission behind a box was undone).
 * Takes back what is still in stock; any shortfall becomes material debt,
 * paid by future credits. Never touches gold, food or other receipts.
 */
export async function reverseMaterialCredit(input: {
  creditId: string;
  reason: string;
}): Promise<{ profile: Profile; repeated: boolean }> {
  const reversalId = `${input.creditId}:reversal`;
  if (!REQUEST_ID.test(reversalId))
    throw Error('Identificador de operação inválido.');
  const profile = await db.profile.get(1);
  if (!profile) throw Error('Abra sua jornada primeiro.');
  if (await db.productivityAudit.get(reversalId))
    return { profile, repeated: true };
  const credit = await db.productivityAudit.get(input.creditId);
  if (!credit || credit.action !== LEDGER_CREDIT)
    throw Error('Crédito de material não encontrado.');
  const amount = materialsOf(
    (credit.after as { materialDelta?: Partial<Materials> }).materialDelta,
  );
  const stock = materialsOf(profile.materials);
  const debt = materialsOf(profile.materialDebt);
  const taken = materialsOf(
    Object.fromEntries(
      MATERIALS.map((key) => [key, Math.min(stock[key], amount[key])]),
    ),
  );
  const materials = materialsOf(
    Object.fromEntries(MATERIALS.map((key) => [key, stock[key] - taken[key]])),
  );
  const materialDebt = materialsOf(
    Object.fromEntries(
      MATERIALS.map((key) => [key, debt[key] + amount[key] - taken[key]]),
    ),
  );
  await db.profile.update(1, { materials, materialDebt });
  await db.productivityAudit.add({
    id: reversalId,
    entityId: credit.entityId,
    action: LEDGER_REVERSAL,
    recordedAt: new Date().toISOString(),
    before: { materials: stock, materialDebt: debt },
    after: {
      reason: input.reason,
      creditId: input.creditId,
      materials,
      materialDebt,
      materialDelta: materialsOf(
        Object.fromEntries(MATERIALS.map((key) => [key, -amount[key]])),
      ),
    },
  });
  return {
    profile: { ...profile, materials, materialDebt },
    repeated: false,
  };
}

/** `materials - materialDebt` implied by the receipts; used by backup checks. */
export function materialsFromReceipts(rows: { after?: unknown }[]): Materials {
  const total = { ...ZERO_MATERIALS };
  for (const row of rows) {
    const delta = (row.after as { materialDelta?: Partial<Materials> } | null)
      ?.materialDelta;
    if (!delta) continue;
    for (const key of MATERIALS) total[key] += delta[key] ?? 0;
  }
  return total;
}
