import { db } from './db';
import type { PilotChoice, PilotState } from '$lib/content/pilot';
export const START: PilotState = { scene: 0 };
export function sanitizePilot(value: unknown): PilotState {
  if (!value || typeof value !== 'object') return START;
  const v = value as Partial<PilotState>;
  return { scene: Number.isInteger(v.scene) ? Math.min(6, Math.max(0, Number(v.scene))) : 0,
    ...(v.choice === 'help' || v.choice === 'follow' ? { choice: v.choice } : {}) };
}
export async function readPilot(): Promise<PilotState> {
  return sanitizePilot((await db.profile.get(1))?.rpgPilot);
}
export async function qualifyingCompletions(): Promise<number> {
  return db.activityEvents.where('kind').anyOf('task', 'review').filter(e => !e.reversedAt).count();
}
export async function advancePilot(expected: number, choice?: PilotChoice): Promise<PilotState> {
  return db.transaction('rw', db.profile, db.activityEvents, async () => {
    const profile = await db.profile.get(1);
    if (!profile) throw new Error('Perfil ainda não disponível.');
    const current = sanitizePilot(profile.rpgPilot);
    if (current.scene !== expected) return current;
    if (expected >= 6) return current;
    if (expected === 3) {
      const completions = await db.activityEvents.where('kind').anyOf('task', 'review').filter(e => !e.reversedAt).count();
      if (!completions) throw new Error('Conclua uma missão real antes de continuar.');
    }
    if (expected === 5 && !choice) throw new Error('Escolha como quer agir.');
    const updated: PilotState = {scene:expected+1,...(expected===5 ? {choice} : current.choice ? {choice:current.choice} : {})};
    await db.profile.update(1, {rpgPilot:updated});
    return updated;
  });
}
