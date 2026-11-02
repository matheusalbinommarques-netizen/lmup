import { db } from './db';
import { progressTransaction } from './rewardService';
import {
  createCampState,
  campVersion,
  storeInventory,
  validateCampState,
  viewInventory,
  MATERIALS,
  bootstrapError,
  type CampState,
} from '$lib/camp/campState';
import {
  constructionCatalog,
  moveBuilding,
  completeBuilding,
  removeBuilding,
  type CampBuilding,
} from '$lib/camp/campConstruction';
import {
  purchaseConstruction,
  upgradeBuilding,
  assignWorker,
  materialCapacity,
} from '$lib/camp/campEconomy';
import { settleProduction } from '$lib/camp/campProduction';
import { craftDemoItem } from '$lib/camp/campWorkshop';
import { CAMP_WORLD } from '$lib/camp/campRegion';
import type { GroundRotation, Point } from '$lib/camp/campPlacement';
export class CampConflictError extends Error {
  constructor() {
    super(
      'O acampamento mudou em outra aba ou foi restaurado. Confira os dados e tente novamente.',
    );
    this.name = 'CampConflictError';
  }
}
export type CampCommand =
  | { type: 'build'; building: CampBuilding }
  | { type: 'move'; id: string; point: Point; rotation: GroundRotation }
  | { type: 'complete' | 'remove' | 'upgrade' | 'craft'; id: string }
  | { type: 'worker'; id: string; workerId: string | null };
const fingerprint = (value: unknown): string =>
  JSON.stringify(value, (_, v) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(
          Object.keys(v)
            .sort()
            .map((k) => [k, v[k]]),
        )
      : v,
  );
function nowChecked(now: number) {
  if (!Number.isSafeInteger(now) || now < 0 || now > 8640000000000000)
    throw Error('Relógio inválido.');
  return now;
}
function settle(state: CampState, now: number): CampState {
  const clock = Math.max(state.clock, nowChecked(now));
  const result = settleProduction(state.buildings, viewInventory(state), clock);
  return {
    ...state,
    clock,
    buildings: result.buildings,
    inventory: storeInventory(result.inventory),
  };
}
export async function ensureCamp(now = Date.now()) {
  return progressTransaction(async () => {
    const profile = await db.profile.get(1);
    if (!profile) throw Error('Abra sua jornada antes do acampamento.');
    if (profile.camp) {
      validateCampState(profile.camp);
      return profile;
    }
    const camp = createCampState(nowChecked(now));
    const blocked = bootstrapError(camp.buildings, viewInventory(camp));
    if (blocked) throw Error(blocked);
    validateCampState(camp);
    await db.profile.update(1, { camp });
    await db.productivityAudit.add({
      id: `camp:${camp.worldId}:init`,
      entityId: `camp:${camp.worldId}`,
      action: 'camp:provision',
      recordedAt: new Date(now).toISOString(),
      before: null,
      after: { wood: 12, stone: 8, iron: 9, gold: 0 },
    });
    return { ...profile, camp };
  });
}
export async function settleCampProduction(now = Date.now()) {
  return progressTransaction(async () => {
    const profile = await db.profile.get(1);
    if (!profile?.camp) return profile;
    const previous = profile.camp;
    validateCampState(previous);
    const camp = settle(previous, now);
    if (fingerprint(camp) !== fingerprint(previous)) {
      await db.profile.update(1, { camp });
      const delta = Object.fromEntries(
        MATERIALS.map((k) => [k, camp.inventory[k] - previous.inventory[k]]),
      );
      if (Object.values(delta).some((v) => v > 0))
        await db.productivityAudit.add({
          id: `camp:${camp.worldId}:production:${crypto.randomUUID()}`,
          entityId: `camp:${camp.worldId}`,
          action: 'camp:production',
          recordedAt: new Date(camp.clock).toISOString(),
          before: { clock: previous.clock },
          after: { clock: camp.clock, delta },
        });
    }
    return { ...profile, camp };
  });
}
export async function executeCamp(
  command: CampCommand,
  requestId: string,
  expectedVersion: string,
  now = Date.now(),
) {
  if (!requestId || requestId.length > 100)
    throw Error('Identificador de operação inválido.');
  const signature = fingerprint(command);
  return progressTransaction(async () => {
    const profile = await db.profile.get(1);
    if (!profile?.camp) throw Error('Abra seu acampamento primeiro.');
    const previous = profile.camp;
    validateCampState(previous);
    const receiptId = `camp:${previous.worldId}:command:${requestId}`;
    const receipt = await db.productivityAudit.get(receiptId);
    if (receipt) {
      if ((receipt.after as { signature?: string })?.signature !== signature)
        throw Error('Operação já usada com outros dados.');
      return profile;
    }
    if (campVersion(previous) !== expectedVersion)
      throw new CampConflictError();
    let camp = settle(previous, now),
      buildings = camp.buildings,
      inventory = viewInventory(camp);
    const target =
      'id' in command ? buildings.find((b) => b.id === command.id) : undefined;
    if (command.type !== 'build' && !target)
      throw Error('Construção não encontrada.');
    switch (command.type) {
      case 'build': {
        if (!Object.hasOwn(constructionCatalog, command.building.sprite))
          throw Error('Construção fora do catálogo.');
        const result = purchaseConstruction(
          buildings,
          inventory,
          command.building,
          CAMP_WORLD,
        );
        if (result.error) throw Error(result.error);
        buildings = result.buildings;
        inventory = result.inventory;
        camp.nextBuilding++;
        break;
      }
      case 'move':
        buildings = moveBuilding(
          buildings,
          command.id,
          command.point,
          command.rotation,
        );
        break;
      case 'complete':
        if (target!.status !== 'building')
          throw Error('Esta construção já está concluída.');
        buildings = completeBuilding(buildings, command.id, camp.clock);
        break;
      case 'remove':
        if (target!.sprite === 'hall')
          throw Error('O salão principal deve permanecer no acampamento.');
        buildings = removeBuilding(buildings, command.id);
        if (
          MATERIALS.some((k) => inventory[k] > materialCapacity(buildings, k))
        )
          throw Error(
            'Consuma os materiais excedentes antes de remover este armazém.',
          );
        break;
      case 'upgrade': {
        const result = upgradeBuilding(buildings, command.id, inventory);
        if (result.error) throw Error(result.error);
        buildings = result.buildings;
        inventory = result.inventory;
        break;
      }
      case 'worker': {
        const result = assignWorker(buildings, command.id, command.workerId);
        if (result.error) throw Error(result.error);
        buildings = result.buildings;
        break;
      }
      case 'craft': {
        const result = craftDemoItem(buildings, command.id, inventory);
        if (!result.ok) throw Error(result.error);
        inventory = result.inventory;
        break;
      }
      default:
        throw Error('Operação de acampamento inválida.');
    }
    camp = {
      ...camp,
      buildings,
      inventory: storeInventory(inventory),
      revision: camp.revision + 1,
    };
    const blocked = bootstrapError(camp.buildings, viewInventory(camp));
    if (blocked) throw Error(blocked);
    validateCampState(camp);
    await db.profile.update(1, { camp });
    await db.productivityAudit.add({
      id: receiptId,
      entityId: `camp:${camp.worldId}`,
      action: `camp:${command.type}`,
      recordedAt: new Date(camp.clock).toISOString(),
      before: { revision: previous.revision },
      after: {
        signature,
        revision: camp.revision,
        delta: Object.fromEntries(
          MATERIALS.map((k) => [k, camp.inventory[k] - previous.inventory[k]]),
        ),
        items: camp.inventory.trainingSword - previous.inventory.trainingSword,
      },
    });
    return { ...profile, camp };
  });
}
