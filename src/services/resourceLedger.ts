import { db, type Profile } from './db';

/** Spendable balances. Materials join here when the Economy 2.0 stock exists. */
export type ResourceCost = { gold?: number; food?: number };
export const LEDGER_SPEND = 'ledger:spend';
export class InsufficientResources extends Error {
  constructor(readonly resource: keyof ResourceCost) {
    super(
      resource === 'gold'
        ? 'Você não tem ouro suficiente.'
        : 'Você não tem comida suficiente.',
    );
  }
}

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
  if (!/^[\w:.-]{1,160}$/.test(requestId))
    throw Error('Identificador de operação inválido.');
  const gold = cost.gold ?? 0,
    food = cost.food ?? 0;
  for (const value of [gold, food])
    if (!Number.isSafeInteger(value) || value < 0)
      throw Error('Custo inválido.');
  if (!gold && !food) throw Error('Custo inválido.');
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
  const after = { gold: balance.gold - gold, food: balance.food - food };
  const changes: Partial<Profile> = {};
  if (gold) changes.gold = after.gold;
  if (food) changes.food = after.food;
  await db.profile.update(1, changes);
  await db.productivityAudit.add({
    id: requestId,
    entityId,
    action,
    recordedAt: new Date().toISOString(),
    before: balance,
    after: { ...input.details, ...after, spent: { gold, food } },
  });
  return { profile: { ...profile, ...changes }, repeated: false };
}
