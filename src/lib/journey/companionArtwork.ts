import type { Companion } from '$services/db';
import { getCompanionStageImage } from '$services/companionService';
// All stages use the same presentation catalog, including legacy records.
export function companionArtwork(companion: Companion | null | undefined) {
  return getCompanionStageImage(companion) ?? companion?.imagePath ?? '';
}
