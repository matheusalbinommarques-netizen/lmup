import { db } from './db';
import {
  CHAPTER_TWO_XP,
  chapterTwoScenes,
  type PilotChoice,
  type PilotState,
} from '$lib/content/pilot';

export const START: PilotState = { scene: 0 };

export function sanitizePilot(value: unknown): PilotState {
  if (!value || typeof value !== 'object') return { ...START };
  const state = value as Partial<PilotState>;
  return {
    scene:
      Number.isInteger(state.scene) && Number(state.scene) >= 0
        ? Math.min(6, Number(state.scene))
        : 0,
    ...(state.choice === 'help' || state.choice === 'follow'
      ? { choice: state.choice }
      : {}),
    ...(Number.isSafeInteger(state.chapterOneEndXp) &&
    Number(state.chapterOneEndXp) >= 0
      ? { chapterOneEndXp: state.chapterOneEndXp }
      : {}),
    ...(state.chapterTwoUnlocked === true
      ? { chapterTwoUnlocked: true }
      : {}),
    ...(Number.isInteger(state.chapterTwoScene) &&
    Number(state.chapterTwoScene) >= 0
      ? {
          chapterTwoScene: Math.min(
            chapterTwoScenes.length,
            Number(state.chapterTwoScene),
          ),
        }
      : {}),
  };
}

export function chapterTwoProgress(state: PilotState, currentXp: number) {
  const earned =
    state.chapterOneEndXp === undefined
      ? 0
      : Math.max(0, currentXp - state.chapterOneEndXp);
  return {
    earned,
    required: CHAPTER_TWO_XP,
    remaining: Math.max(0, CHAPTER_TWO_XP - earned),
    available: state.chapterTwoUnlocked === true || earned >= CHAPTER_TWO_XP,
  };
}

export async function readPilot(): Promise<PilotState> {
  return sanitizePilot((await db.profile.get(1))?.rpgPilot);
}

/** Scenes in chapter one never require a real-world task to continue. */
export async function advancePilot(
  expected: number,
  choice?: PilotChoice,
): Promise<PilotState> {
  return db.transaction('rw', db.profile, async () => {
    const profile = await db.profile.get(1);
    if (!profile) throw new Error('Perfil ainda não disponível.');
    const current = sanitizePilot(profile.rpgPilot);
    if (current.scene !== expected || expected >= 6) return current;
    if (expected === 5 && choice !== 'help' && choice !== 'follow')
      throw new Error('Escolha como quer agir.');

    const updated: PilotState = {
      ...current,
      scene: expected + 1,
      ...(expected === 5
        ? { choice, chapterOneEndXp: profile.totalXpEarned }
        : {}),
    };
    await db.profile.update(1, { rpgPilot: updated });
    return updated;
  });
}

/** For users who completed the old pilot, explicitly start counting new XP. */
export async function initializeChapterTwoProgress(): Promise<PilotState> {
  return db.transaction('rw', db.profile, async () => {
    const profile = await db.profile.get(1);
    if (!profile) throw new Error('Perfil ainda não disponível.');
    const current = sanitizePilot(profile.rpgPilot);
    if (current.scene !== 6) throw new Error('Termine o primeiro capítulo.');
    if (current.chapterOneEndXp !== undefined) return current;
    const updated = { ...current, chapterOneEndXp: profile.totalXpEarned };
    await db.profile.update(1, { rpgPilot: updated });
    return updated;
  });
}

/** Unlock is earned with new XP, cannot be purchased, and remains unlocked. */
export async function unlockChapterTwo(): Promise<PilotState> {
  return db.transaction('rw', db.profile, async () => {
    const profile = await db.profile.get(1);
    if (!profile) throw new Error('Perfil ainda não disponível.');
    const current = sanitizePilot(profile.rpgPilot);
    if (current.scene !== 6) throw new Error('Termine o primeiro capítulo.');
    if (current.chapterOneEndXp === undefined)
      throw new Error('Ative primeiro o progresso do próximo capítulo.');
    if (!chapterTwoProgress(current, profile.totalXpEarned).available)
      throw new Error('O próximo capítulo ainda não está disponível.');
    const updated = {
      ...current,
      chapterTwoUnlocked: true,
      chapterTwoScene: current.chapterTwoScene ?? 0,
    };
    await db.profile.update(1, { rpgPilot: updated });
    return updated;
  });
}

export async function advanceChapterTwo(expected: number): Promise<PilotState> {
  return db.transaction('rw', db.profile, async () => {
    const profile = await db.profile.get(1);
    if (!profile) throw new Error('Perfil ainda não disponível.');
    const current = sanitizePilot(profile.rpgPilot);
    if (!current.chapterTwoUnlocked)
      throw new Error('O capítulo ainda não foi liberado.');
    if ((current.chapterTwoScene ?? 0) !== expected || expected >= chapterTwoScenes.length)
      return current;
    const updated = { ...current, chapterTwoScene: expected + 1 };
    await db.profile.update(1, { rpgPilot: updated });
    return updated;
  });
}
