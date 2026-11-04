import type { Companion, Profile } from '$services/db';
export type CampPreviewState = {
  version: 1;
  epoch: string;
  revision: number;
  caretakerMet: boolean;
  residenceBuilt: boolean;
  simulatedXp?: number;
  discoveredCompanionIds?: number[];
};
export function validateCampPreview(
  value: unknown,
): asserts value is CampPreviewState {
  const s = value as CampPreviewState | null;
  if (
    !s ||
    s.version !== 1 ||
    typeof s.epoch !== 'string' ||
    !s.epoch ||
    !Number.isSafeInteger(s.revision) ||
    s.revision < 0 ||
    typeof s.caretakerMet !== 'boolean' ||
    typeof s.residenceBuilt !== 'boolean' ||
    (s.residenceBuilt && !s.caretakerMet) ||
    (s.simulatedXp !== undefined &&
      (!Number.isSafeInteger(s.simulatedXp) || s.simulatedXp < 0)) ||
    (s.discoveredCompanionIds !== undefined &&
      (!Array.isArray(s.discoveredCompanionIds) ||
        s.discoveredCompanionIds.some(
          (id) => !Number.isSafeInteger(id) || id < 1,
        ) ||
        new Set(s.discoveredCompanionIds).size !==
          s.discoveredCompanionIds.length))
  )
    throw Error('Estado da demonstração inválido. Os dados foram preservados.');
}
export function getCampTreeXp(profile: Profile): number {
  return profile.campPreview?.simulatedXp ?? profile.totalXpEarned;
}
/** Availability or active selection alone never constitute discovery. */
export function isCampCompanionDiscovered(
  pet: Companion,
  profile: Profile,
  preview = true,
): boolean {
  const ids = preview ? profile.campPreview?.discoveredCompanionIds : undefined;
  if (ids) return ids.includes(pet.id ?? -1);
  return (
    pet.unlocked === true ||
    (pet.foodInvested ?? 0) > 0 ||
    (pet.evolutionStage ?? 1) > 1 ||
    !!pet.careHistory?.length
  );
}
